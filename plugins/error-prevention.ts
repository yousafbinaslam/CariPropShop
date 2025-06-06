import { Plugin } from 'vite';
import { readFileSync } from 'fs';

interface ErrorRule {
  pattern: RegExp;
  message: string;
  severity: 'error' | 'warning';
  fix?: string;
}

export function errorPrevention(): Plugin {
  const rules: ErrorRule[] = [
    {
      pattern: /useState\s*\(/,
      message: 'useState hook detected - ensure React is imported',
      severity: 'warning',
      fix: "Add: import { useState } from 'react';"
    },
    {
      pattern: /useEffect\s*\(/,
      message: 'useEffect hook detected - ensure React is imported',
      severity: 'warning',
      fix: "Add: import { useEffect } from 'react';"
    },
    {
      pattern: /\.map\s*\(\s*\([^)]*\)\s*=>\s*<[^>]*(?!.*key=)/,
      message: 'Missing key prop in list rendering',
      severity: 'error',
      fix: 'Add unique key prop to each list item'
    },
    {
      pattern: /console\.log\s*\(/,
      message: 'Console.log statement found',
      severity: 'warning',
      fix: 'Remove console.log statements before production'
    },
    {
      pattern: /href=["']#["']/,
      message: 'Empty href attribute found',
      severity: 'warning',
      fix: 'Use proper navigation or button elements'
    },
    {
      pattern: /onClick=.*preventDefault\(\)/,
      message: 'Consider using button instead of anchor with preventDefault',
      severity: 'warning',
      fix: 'Use <button> element for interactive elements'
    },
    {
      pattern: /className=["'][^"']*\s[^"']*["']/,
      message: 'Multiple classes in className - consider using clsx or cn utility',
      severity: 'warning',
      fix: 'Use utility functions for conditional classes'
    },
    {
      pattern: /img.*(?!alt=)/,
      message: 'Image without alt attribute',
      severity: 'error',
      fix: 'Add alt attribute for accessibility'
    }
  ];

  function checkFile(filePath: string, content: string): Array<{rule: ErrorRule, line: number, column: number}> {
    const issues: Array<{rule: ErrorRule, line: number, column: number}> = [];
    const lines = content.split('\n');
    
    lines.forEach((line, lineIndex) => {
      rules.forEach(rule => {
        const match = line.match(rule.pattern);
        if (match) {
          issues.push({
            rule,
            line: lineIndex + 1,
            column: match.index || 0
          });
        }
      });
    });
    
    return issues;
  }

  return {
    name: 'error-prevention',
    
    load(id) {
      if (id.endsWith('.tsx') || id.endsWith('.jsx') || id.endsWith('.ts')) {
        try {
          const content = readFileSync(id, 'utf-8');
          const issues = checkFile(id, content);
          
          if (issues.length > 0) {
            console.log(`\n🔍 Checking: ${id}`);
            issues.forEach(issue => {
              const icon = issue.rule.severity === 'error' ? '❌' : '⚠️';
              console.log(`${icon} Line ${issue.line}: ${issue.rule.message}`);
              if (issue.rule.fix) {
                console.log(`   💡 Fix: ${issue.rule.fix}`);
              }
            });
            
            // Fail build on errors
            const errors = issues.filter(issue => issue.rule.severity === 'error');
            if (errors.length > 0) {
              throw new Error(`Build failed due to ${errors.length} error(s) in ${id}`);
            }
          }
        } catch (error) {
          if (error instanceof Error && error.message.includes('Build failed')) {
            throw error;
          }
          // Ignore file read errors for non-existent files
        }
      }
      return null;
    },
    
    configureServer(server) {
      server.ws.on('error-prevention:check', (data) => {
        const { filePath, content } = data;
        const issues = checkFile(filePath, content);
        server.ws.send('error-prevention:results', { filePath, issues });
      });
    }
  };
}