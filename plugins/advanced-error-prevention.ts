import { Plugin } from 'vite';
import { readFileSync } from 'fs';
import { parse } from '@typescript-eslint/parser';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

interface ErrorRule {
  id: string;
  pattern?: RegExp;
  astCheck?: (node: any) => boolean;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  fix?: string;
  autoFix?: (content: string) => string;
  category: 'security' | 'performance' | 'accessibility' | 'maintainability' | 'correctness';
}

interface CodeIssue {
  rule: ErrorRule;
  line: number;
  column: number;
  context?: string;
  suggestion?: string;
}

export function advancedErrorPrevention(): Plugin {
  const rules: ErrorRule[] = [
    // Security Rules
    {
      id: 'no-eval',
      pattern: /\beval\s*\(/,
      message: 'Use of eval() is dangerous and should be avoided',
      severity: 'critical',
      category: 'security',
      fix: 'Use safer alternatives like JSON.parse() or Function constructor'
    },
    {
      id: 'no-inner-html',
      pattern: /\.innerHTML\s*=/,
      message: 'Direct innerHTML assignment can lead to XSS vulnerabilities',
      severity: 'high',
      category: 'security',
      fix: 'Use textContent or createElement methods instead'
    },
    {
      id: 'no-unsafe-href',
      pattern: /href\s*=\s*["']javascript:/,
      message: 'javascript: URLs in href attributes are unsafe',
      severity: 'high',
      category: 'security',
      fix: 'Use event handlers or proper navigation methods'
    },

    // Performance Rules
    {
      id: 'no-sync-fs',
      pattern: /fs\.(readFileSync|writeFileSync|existsSync)/,
      message: 'Synchronous file operations can block the event loop',
      severity: 'medium',
      category: 'performance',
      fix: 'Use asynchronous file operations instead'
    },
    {
      id: 'large-bundle-import',
      pattern: /import\s+.*\s+from\s+['"]lodash['"]|import\s+.*\s+from\s+['"]moment['"]/,
      message: 'Importing entire library can increase bundle size',
      severity: 'medium',
      category: 'performance',
      fix: 'Use specific imports like lodash/get or date-fns instead'
    },

    // Accessibility Rules
    {
      id: 'missing-alt-text',
      pattern: /<img(?![^>]*alt=)[^>]*>/,
      message: 'Images must have alt text for accessibility',
      severity: 'high',
      category: 'accessibility',
      fix: 'Add alt attribute with descriptive text',
      autoFix: (content) => content.replace(/<img([^>]*)>/g, '<img$1 alt="">')
    },
    {
      id: 'missing-button-type',
      pattern: /<button(?![^>]*type=)[^>]*>/,
      message: 'Buttons should have explicit type attribute',
      severity: 'medium',
      category: 'accessibility',
      fix: 'Add type="button" or type="submit" as appropriate',
      autoFix: (content) => content.replace(/<button([^>]*)>/g, '<button type="button"$1>')
    },

    // React-specific Rules
    {
      id: 'missing-key-prop',
      pattern: /\.map\s*\(\s*\([^)]*\)\s*=>\s*<[^>]*(?!.*key=)/,
      message: 'Missing key prop in list rendering',
      severity: 'high',
      category: 'correctness',
      fix: 'Add unique key prop to each list item'
    },
    {
      id: 'unused-state',
      pattern: /const\s+\[\s*\w+\s*,\s*set\w+\s*\]\s*=\s*useState/,
      message: 'Potential unused state variable',
      severity: 'low',
      category: 'maintainability',
      fix: 'Remove unused state or use the state variable'
    },
    {
      id: 'missing-dependency',
      pattern: /useEffect\s*\(\s*\(\s*\)\s*=>\s*{[^}]*}\s*,\s*\[\s*\]\s*\)/,
      message: 'useEffect with empty dependency array might be missing dependencies',
      severity: 'medium',
      category: 'correctness',
      fix: 'Add missing dependencies or use useCallback/useMemo'
    },

    // TypeScript Rules
    {
      id: 'any-type',
      pattern: /:\s*any\b/,
      message: 'Avoid using "any" type, use specific types instead',
      severity: 'medium',
      category: 'maintainability',
      fix: 'Define proper TypeScript interfaces or types'
    },
    {
      id: 'console-log',
      pattern: /console\.(log|warn|error|debug)/,
      message: 'Console statements should be removed before production',
      severity: 'low',
      category: 'maintainability',
      fix: 'Remove console statements or use proper logging library',
      autoFix: (content) => content.replace(/console\.(log|warn|error|debug)\([^)]*\);?\n?/g, '')
    },

    // Code Quality Rules
    {
      id: 'magic-numbers',
      pattern: /\b(?!0|1|2|10|100|1000)\d{3,}\b/,
      message: 'Magic numbers should be replaced with named constants',
      severity: 'low',
      category: 'maintainability',
      fix: 'Extract numbers to named constants'
    },
    {
      id: 'long-function',
      pattern: /function\s+\w+[^{]*{(?:[^{}]*{[^{}]*})*[^{}]{200,}}/,
      message: 'Function is too long and should be broken down',
      severity: 'medium',
      category: 'maintainability',
      fix: 'Break down into smaller, focused functions'
    }
  ];

  function analyzeWithAST(content: string, filePath: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    
    try {
      const ast = parse(content, {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      });

      // AST-based analysis for more complex patterns
      function traverse(node: any, parent?: any) {
        if (!node) return;

        // Check for unused imports
        if (node.type === AST_NODE_TYPES.ImportDeclaration) {
          const importName = node.source.value;
          if (!content.includes(importName.split('/').pop())) {
            issues.push({
              rule: {
                id: 'unused-import',
                message: `Unused import: ${importName}`,
                severity: 'low',
                category: 'maintainability',
                fix: 'Remove unused import'
              },
              line: node.loc?.start.line || 0,
              column: node.loc?.start.column || 0
            });
          }
        }

        // Check for complex conditional expressions
        if (node.type === AST_NODE_TYPES.ConditionalExpression && parent?.type === AST_NODE_TYPES.ConditionalExpression) {
          issues.push({
            rule: {
              id: 'nested-ternary',
              message: 'Nested ternary operators reduce readability',
              severity: 'medium',
              category: 'maintainability',
              fix: 'Use if-else statements or extract to a function'
            },
            line: node.loc?.start.line || 0,
            column: node.loc?.start.column || 0
          });
        }

        // Recursively traverse child nodes
        for (const key in node) {
          if (key !== 'parent' && key !== 'loc' && key !== 'range') {
            const child = node[key];
            if (Array.isArray(child)) {
              child.forEach(item => traverse(item, node));
            } else if (child && typeof child === 'object') {
              traverse(child, node);
            }
          }
        }
      }

      traverse(ast);
    } catch (error) {
      // If AST parsing fails, fall back to regex-based analysis
      console.warn(`AST parsing failed for ${filePath}:`, error);
    }

    return issues;
  }

  function analyzeWithRegex(content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const lines = content.split('\n');

    lines.forEach((line, lineIndex) => {
      rules.forEach(rule => {
        if (rule.pattern) {
          const match = line.match(rule.pattern);
          if (match) {
            issues.push({
              rule,
              line: lineIndex + 1,
              column: match.index || 0,
              context: line.trim(),
              suggestion: rule.fix
            });
          }
        }
      });
    });

    return issues;
  }

  function generateFixSuggestions(issues: CodeIssue[]): string[] {
    const suggestions: string[] = [];
    const categoryGroups = issues.reduce((acc, issue) => {
      if (!acc[issue.rule.category]) acc[issue.rule.category] = [];
      acc[issue.rule.category].push(issue);
      return acc;
    }, {} as Record<string, CodeIssue[]>);

    Object.entries(categoryGroups).forEach(([category, categoryIssues]) => {
      suggestions.push(`\n${category.toUpperCase()} ISSUES (${categoryIssues.length}):`);
      categoryIssues.slice(0, 5).forEach(issue => {
        suggestions.push(`  • Line ${issue.line}: ${issue.rule.message}`);
        if (issue.rule.fix) {
          suggestions.push(`    Fix: ${issue.rule.fix}`);
        }
      });
      if (categoryIssues.length > 5) {
        suggestions.push(`    ... and ${categoryIssues.length - 5} more`);
      }
    });

    return suggestions;
  }

  function applyAutoFixes(content: string, issues: CodeIssue[]): string {
    let fixedContent = content;
    
    issues.forEach(issue => {
      if (issue.rule.autoFix) {
        try {
          fixedContent = issue.rule.autoFix(fixedContent);
        } catch (error) {
          console.warn(`Auto-fix failed for rule ${issue.rule.id}:`, error);
        }
      }
    });

    return fixedContent;
  }

  return {
    name: 'advanced-error-prevention',
    
    load(id) {
      if (id.endsWith('.tsx') || id.endsWith('.jsx') || id.endsWith('.ts')) {
        try {
          const content = readFileSync(id, 'utf-8');
          
          // Combine regex and AST analysis
          const regexIssues = analyzeWithRegex(content);
          const astIssues = analyzeWithAST(content, id);
          const allIssues = [...regexIssues, ...astIssues];
          
          if (allIssues.length > 0) {
            console.log(`\n🔍 Advanced analysis for: ${id}`);
            
            // Group by severity
            const critical = allIssues.filter(i => i.rule.severity === 'critical');
            const high = allIssues.filter(i => i.rule.severity === 'high');
            const medium = allIssues.filter(i => i.rule.severity === 'medium');
            const low = allIssues.filter(i => i.rule.severity === 'low');
            
            // Report critical and high severity issues
            [...critical, ...high].forEach(issue => {
              const icon = issue.rule.severity === 'critical' ? '🚨' : '❌';
              console.log(`${icon} Line ${issue.line}: ${issue.rule.message}`);
              if (issue.rule.fix) {
                console.log(`   💡 Fix: ${issue.rule.fix}`);
              }
            });
            
            // Summary for medium and low
            if (medium.length > 0) {
              console.log(`⚠️  ${medium.length} medium severity issues found`);
            }
            if (low.length > 0) {
              console.log(`ℹ️  ${low.length} low severity issues found`);
            }
            
            // Generate comprehensive suggestions
            const suggestions = generateFixSuggestions(allIssues);
            if (suggestions.length > 0) {
              console.log('\n📋 DETAILED ANALYSIS:');
              suggestions.forEach(suggestion => console.log(suggestion));
            }
            
            // Auto-fix if enabled
            const autoFixableIssues = allIssues.filter(i => i.rule.autoFix);
            if (autoFixableIssues.length > 0) {
              console.log(`\n🔧 ${autoFixableIssues.length} issues can be auto-fixed`);
            }
            
            // Fail build on critical errors
            if (critical.length > 0) {
              throw new Error(`Build failed: ${critical.length} critical error(s) in ${id}`);
            }
            
            // Warn on high severity
            if (high.length > 3) {
              console.warn(`⚠️  High number of high-severity issues (${high.length}) in ${id}`);
            }
          }
        } catch (error) {
          if (error instanceof Error && error.message.includes('Build failed')) {
            throw error;
          }
          // Ignore file read errors
        }
      }
      return null;
    },
    
    configureServer(server) {
      server.ws.on('error-prevention:analyze', (data) => {
        const { filePath, content } = data;
        const regexIssues = analyzeWithRegex(content);
        const astIssues = analyzeWithAST(content, filePath);
        const allIssues = [...regexIssues, ...astIssues];
        
        server.ws.send('error-prevention:results', {
          filePath,
          issues: allIssues,
          suggestions: generateFixSuggestions(allIssues),
          autoFixable: allIssues.filter(i => i.rule.autoFix).length
        });
      });
      
      server.ws.on('error-prevention:auto-fix', (data) => {
        const { filePath, content } = data;
        const issues = [...analyzeWithRegex(content), ...analyzeWithAST(content, filePath)];
        const fixedContent = applyAutoFixes(content, issues);
        
        server.ws.send('error-prevention:fixed', {
          filePath,
          originalContent: content,
          fixedContent,
          appliedFixes: issues.filter(i => i.rule.autoFix).map(i => i.rule.id)
        });
      });
    }
  };
}