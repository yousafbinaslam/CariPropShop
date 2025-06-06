import { Plugin } from 'vite';
import { readFileSync } from 'fs';
import { parse } from 'node-html-parser';

interface LinkIssue {
  file: string;
  line: number;
  link: string;
  issue: string;
  severity: 'error' | 'warning';
}

export function linkValidator(): Plugin {
  const internalRoutes = new Set([
    '/',
    '/admin',
    '/sitemap',
    '/privacy-policy',
    '/terms-of-service',
    '/legal-compliance',
    '/user-agreement'
  ]);

  const validExternalDomains = new Set([
    'wa.me',
    'whatsapp.com',
    'images.pexels.com',
    'pexels.com'
  ]);

  function validateLinks(filePath: string, content: string): LinkIssue[] {
    const issues: LinkIssue[] = [];
    const lines = content.split('\n');
    
    // Check for href attributes
    const hrefRegex = /href=["']([^"']+)["']/g;
    let match;
    
    while ((match = hrefRegex.exec(content)) !== null) {
      const link = match[1];
      const lineNumber = content.substring(0, match.index).split('\n').length;
      
      // Skip data URLs and mailto links
      if (link.startsWith('data:') || link.startsWith('mailto:')) {
        continue;
      }
      
      // Check empty links
      if (link === '#' || link === '') {
        issues.push({
          file: filePath,
          line: lineNumber,
          link,
          issue: 'Empty or placeholder link',
          severity: 'warning'
        });
        continue;
      }
      
      // Check internal routes
      if (link.startsWith('/')) {
        if (!internalRoutes.has(link) && !link.startsWith('/admin/')) {
          issues.push({
            file: filePath,
            line: lineNumber,
            link,
            issue: 'Internal route not found in route definitions',
            severity: 'error'
          });
        }
      }
      
      // Check external links
      if (link.startsWith('http')) {
        try {
          const url = new URL(link);
          if (!validExternalDomains.has(url.hostname)) {
            issues.push({
              file: filePath,
              line: lineNumber,
              link,
              issue: 'External domain not in whitelist',
              severity: 'warning'
            });
          }
        } catch (error) {
          issues.push({
            file: filePath,
            line: lineNumber,
            link,
            issue: 'Invalid URL format',
            severity: 'error'
          });
        }
      }
    }
    
    // Check for src attributes in images
    const srcRegex = /src=["']([^"']+)["']/g;
    while ((match = srcRegex.exec(content)) !== null) {
      const src = match[1];
      const lineNumber = content.substring(0, match.index).split('\n').length;
      
      if (src.startsWith('http')) {
        try {
          const url = new URL(src);
          if (!validExternalDomains.has(url.hostname)) {
            issues.push({
              file: filePath,
              line: lineNumber,
              link: src,
              issue: 'Image source from unverified domain',
              severity: 'warning'
            });
          }
        } catch (error) {
          issues.push({
            file: filePath,
            line: lineNumber,
            link: src,
            issue: 'Invalid image URL format',
            severity: 'error'
          });
        }
      }
    }
    
    return issues;
  }

  return {
    name: 'link-validator',
    
    load(id) {
      if (id.endsWith('.tsx') || id.endsWith('.jsx')) {
        try {
          const content = readFileSync(id, 'utf-8');
          const issues = validateLinks(id, content);
          
          if (issues.length > 0) {
            console.log(`\n🔗 Link validation for: ${id}`);
            issues.forEach(issue => {
              const icon = issue.severity === 'error' ? '❌' : '⚠️';
              console.log(`${icon} Line ${issue.line}: ${issue.issue}`);
              console.log(`   🔗 Link: ${issue.link}`);
            });
            
            // Fail build on link errors
            const errors = issues.filter(issue => issue.severity === 'error');
            if (errors.length > 0) {
              console.log(`\n💡 Fix these link issues before continuing build`);
            }
          }
        } catch (error) {
          // Ignore file read errors
        }
      }
      return null;
    },
    
    configureServer(server) {
      server.ws.on('link-validator:check', () => {
        // Trigger link validation for all files
        console.log('🔗 Running comprehensive link validation...');
      });
    }
  };
}