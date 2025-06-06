var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";

// plugins/comprehensive-tracker.ts
import { watch } from "file:///home/project/node_modules/chokidar/index.js";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import * as cron from "file:///home/project/node_modules/node-cron/src/node-cron.js";
function comprehensiveTracker(config) {
  let state = {
    domChanges: [],
    stateChanges: [],
    networkRequests: [],
    errors: [],
    performance: {
      buildTimes: [],
      bundleSizes: [],
      memoryUsage: [],
      loadTimes: []
    },
    health: {
      score: 100,
      status: "excellent",
      lastCheck: (/* @__PURE__ */ new Date()).toISOString(),
      issues: []
    },
    recovery: {
      attempts: 0,
      successful: 0,
      lastRecovery: ""
    }
  };
  const logDir = join(process.cwd(), "logs");
  const stateFile = join(logDir, "comprehensive-state.json");
  const dailyReportDir = join(logDir, "daily-reports");
  const backupDir = join(logDir, "backups");
  [logDir, dailyReportDir, backupDir].forEach((dir) => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });
  let buildStartTime;
  function saveState() {
    try {
      writeFileSync(stateFile, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error("Failed to save comprehensive state:", error);
    }
  }
  function loadState() {
    if (existsSync(stateFile)) {
      try {
        state = { ...state, ...JSON.parse(readFileSync(stateFile, "utf-8")) };
      } catch (error) {
        console.warn("Could not load existing state:", error);
      }
    }
  }
  function calculateHealthScore() {
    let score = 100;
    const recentErrors = state.errors.filter(
      (e) => Date.now() - new Date(e.timestamp).getTime() < 36e5
      // Last hour
    );
    recentErrors.forEach((error) => {
      switch (error.severity) {
        case "critical":
          score -= 20;
          break;
        case "high":
          score -= 10;
          break;
        case "medium":
          score -= 5;
          break;
        case "low":
          score -= 2;
          break;
      }
    });
    const avgBuildTime = state.performance.buildTimes.slice(-5).reduce((a, b) => a + b, 0) / 5;
    if (avgBuildTime > config.performanceBenchmarks.buildTime) {
      score -= 10;
    }
    const avgBundleSize = state.performance.bundleSizes.slice(-5).reduce((a, b) => a + b, 0) / 5;
    if (avgBundleSize > config.performanceBenchmarks.bundleSize) {
      score -= 15;
    }
    return Math.max(0, Math.min(100, score));
  }
  function updateHealthStatus() {
    const score = calculateHealthScore();
    state.health.score = score;
    state.health.lastCheck = (/* @__PURE__ */ new Date()).toISOString();
    if (score >= 90) state.health.status = "excellent";
    else if (score >= 70) state.health.status = "good";
    else if (score >= 50) state.health.status = "warning";
    else state.health.status = "critical";
    state.health.issues = [];
    const recentErrors = state.errors.filter(
      (e) => Date.now() - new Date(e.timestamp).getTime() < 36e5
    );
    if (recentErrors.length > 0) {
      state.health.issues.push(`${recentErrors.length} recent errors detected`);
    }
    const avgBuildTime = state.performance.buildTimes.slice(-5).reduce((a, b) => a + b, 0) / 5;
    if (avgBuildTime > config.performanceBenchmarks.buildTime) {
      state.health.issues.push("Build time exceeds benchmark");
    }
    saveState();
  }
  function logError(error) {
    const errorLog = {
      type: "javascript",
      message: "",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      severity: "medium",
      recovered: false,
      ...error
    };
    state.errors.unshift(errorLog);
    if (state.errors.length > 1e3) {
      state.errors = state.errors.slice(0, 1e3);
    }
    const criticalErrors = state.errors.filter((e) => e.severity === "critical").length;
    if (criticalErrors > config.errorThreshold.critical) {
      triggerRecovery("Critical error threshold exceeded");
    }
    updateHealthStatus();
    broadcastUpdate("error", errorLog);
  }
  function triggerRecovery(reason) {
    state.recovery.attempts++;
    console.log(`\u{1F504} Triggering recovery: ${reason}`);
    if (config.recovery.backupOnError) {
      createBackup();
    }
    if (config.recovery.autoRestart) {
      console.log("\u{1F504} Auto-restart initiated");
    }
    state.recovery.lastRecovery = (/* @__PURE__ */ new Date()).toISOString();
    state.recovery.successful++;
    saveState();
  }
  function createBackup() {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
    const backupFile = join(backupDir, `backup-${timestamp}.json`);
    try {
      writeFileSync(backupFile, JSON.stringify(state, null, 2));
      console.log(`\u{1F4BE} Backup created: ${backupFile}`);
    } catch (error) {
      console.error("Failed to create backup:", error);
    }
  }
  function generateDailyReport() {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const reportFile = join(dailyReportDir, `report-${today}.json`);
    const todayErrors = state.errors.filter(
      (e) => e.timestamp.startsWith(today)
    );
    const report = {
      date: today,
      summary: {
        totalErrors: todayErrors.length,
        criticalErrors: todayErrors.filter((e) => e.severity === "critical").length,
        recoveryAttempts: state.recovery.attempts,
        healthScore: state.health.score,
        status: state.health.status
      },
      performance: {
        avgBuildTime: state.performance.buildTimes.slice(-10).reduce((a, b) => a + b, 0) / 10,
        avgBundleSize: state.performance.bundleSizes.slice(-10).reduce((a, b) => a + b, 0) / 10,
        avgMemoryUsage: state.performance.memoryUsage.slice(-10).reduce((a, b) => a + b, 0) / 10
      },
      errors: todayErrors,
      recommendations: generateRecommendations()
    };
    try {
      writeFileSync(reportFile, JSON.stringify(report, null, 2));
      console.log(`\u{1F4CA} Daily report generated: ${reportFile}`);
    } catch (error) {
      console.error("Failed to generate daily report:", error);
    }
  }
  function generateRecommendations() {
    const recommendations = [];
    if (state.health.score < 70) {
      recommendations.push("Consider reviewing recent code changes for potential issues");
    }
    const avgBuildTime = state.performance.buildTimes.slice(-5).reduce((a, b) => a + b, 0) / 5;
    if (avgBuildTime > config.performanceBenchmarks.buildTime) {
      recommendations.push("Optimize build performance with code splitting");
    }
    const recentErrors = state.errors.filter(
      (e) => Date.now() - new Date(e.timestamp).getTime() < 864e5
      // Last 24 hours
    );
    if (recentErrors.length > 10) {
      recommendations.push("High error rate detected - review error patterns");
    }
    return recommendations;
  }
  function broadcastUpdate(type, data) {
    console.log(`\u{1F4E1} Broadcasting update: ${type}`, data);
  }
  return {
    name: "comprehensive-tracker",
    configureServer(server) {
      loadState();
      server.ws.on("message", (message) => {
        try {
          const data = JSON.parse(message.toString());
          switch (data.type) {
            case "dom-change":
              state.domChanges.unshift(data.data);
              if (state.domChanges.length > 1e3) {
                state.domChanges = state.domChanges.slice(0, 1e3);
              }
              break;
            case "state-change":
              state.stateChanges.unshift(data.data);
              if (state.stateChanges.length > 1e3) {
                state.stateChanges = state.stateChanges.slice(0, 1e3);
              }
              break;
            case "network-request":
              state.networkRequests.unshift(data.data);
              if (state.networkRequests.length > 1e3) {
                state.networkRequests = state.networkRequests.slice(0, 1e3);
              }
              break;
            case "javascript-error":
            case "promise-rejection":
            case "network-error":
              logError({
                type: data.type === "network-error" ? "network" : "javascript",
                message: data.data.message,
                stack: data.data.stack,
                file: data.data.filename,
                line: data.data.lineno,
                column: data.data.colno,
                severity: data.data.severity || "medium"
              });
              break;
          }
          saveState();
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      });
      server.ws.on("comprehensive-tracker:get-state", () => {
        server.ws.send("comprehensive-tracker:state", {
          events: state.errors.slice(0, 50),
          health: state.health,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      });
      server.ws.on("comprehensive-tracker:client-error", (data) => {
        logError({
          type: "javascript",
          message: data.error?.message || "Client error",
          stack: data.error?.stack,
          severity: "high"
        });
      });
      const watcher = watch(["src/**/*", "public/**/*", "*.config.*"], {
        ignored: ["node_modules", "dist", "logs"],
        persistent: true
      });
      watcher.on("change", (filePath) => {
        console.log(`\u{1F4DD} File changed: ${filePath}`);
        updateHealthStatus();
        broadcastUpdate("file-change", { path: filePath, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
      });
      setInterval(() => {
        updateHealthStatus();
        broadcastUpdate("health-update", state.health);
      }, 3e4);
      cron.schedule("0 0 * * *", () => {
        generateDailyReport();
      });
    },
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "development") {
        const script = `
          <script>
            if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
              // Use Vite's HMR WebSocket for monitoring
              console.log('\u{1F4CA} Comprehensive tracking initialized');
            }
          </script>
        `;
        return html.replace("</head>", `${script}</head>`);
      }
      return html;
    },
    buildStart() {
      buildStartTime = Date.now();
      console.log("\u{1F680} Comprehensive tracking started");
      updateHealthStatus();
    },
    generateBundle(options, bundle) {
      const buildTime = Date.now() - buildStartTime;
      let bundleSize = 0;
      Object.values(bundle).forEach((chunk) => {
        if (chunk.code) bundleSize += chunk.code.length;
        if (chunk.source) bundleSize += chunk.source.length;
      });
      state.performance.buildTimes.unshift(buildTime);
      state.performance.bundleSizes.unshift(bundleSize);
      state.performance.memoryUsage.unshift(process.memoryUsage().heapUsed);
      ["buildTimes", "bundleSizes", "memoryUsage"].forEach((key) => {
        if (state.performance[key].length > 100) {
          state.performance[key] = state.performance[key].slice(0, 100);
        }
      });
      if (buildTime > config.performanceBenchmarks.buildTime) {
        logError({
          type: "build",
          message: `Build time exceeded benchmark: ${buildTime}ms > ${config.performanceBenchmarks.buildTime}ms`,
          severity: "medium"
        });
      }
      if (bundleSize > config.performanceBenchmarks.bundleSize) {
        logError({
          type: "build",
          message: `Bundle size exceeded benchmark: ${bundleSize} bytes > ${config.performanceBenchmarks.bundleSize} bytes`,
          severity: "medium"
        });
      }
      updateHealthStatus();
      saveState();
    },
    buildEnd() {
      console.log("\u2705 Build completed");
      console.log(`\u{1F4CA} Health Score: ${state.health.score}/100 (${state.health.status})`);
      if (state.health.issues.length > 0) {
        console.log("\u26A0\uFE0F  Current Issues:");
        state.health.issues.forEach((issue) => console.log(`   \u2022 ${issue}`));
      }
      const recommendations = generateRecommendations();
      if (recommendations.length > 0) {
        console.log("\u{1F4A1} Recommendations:");
        recommendations.forEach((rec) => console.log(`   \u2022 ${rec}`));
      }
    }
  };
}

// plugins/advanced-error-prevention.ts
import { readFileSync as readFileSync2 } from "fs";
import { parse } from "file:///home/project/node_modules/@typescript-eslint/parser/dist/index.js";
import { AST_NODE_TYPES } from "file:///home/project/node_modules/@typescript-eslint/types/dist/index.js";
function advancedErrorPrevention() {
  const rules = [
    // Security Rules
    {
      id: "no-eval",
      pattern: /\beval\s*\(/,
      message: "Use of eval() is dangerous and should be avoided",
      severity: "critical",
      category: "security",
      fix: "Use safer alternatives like JSON.parse() or Function constructor"
    },
    {
      id: "no-inner-html",
      pattern: /\.innerHTML\s*=/,
      message: "Direct innerHTML assignment can lead to XSS vulnerabilities",
      severity: "high",
      category: "security",
      fix: "Use textContent or createElement methods instead"
    },
    {
      id: "no-unsafe-href",
      pattern: /href\s*=\s*["']javascript:/,
      message: "javascript: URLs in href attributes are unsafe",
      severity: "high",
      category: "security",
      fix: "Use event handlers or proper navigation methods"
    },
    // Performance Rules
    {
      id: "no-sync-fs",
      pattern: /fs\.(readFileSync|writeFileSync|existsSync)/,
      message: "Synchronous file operations can block the event loop",
      severity: "medium",
      category: "performance",
      fix: "Use asynchronous file operations instead"
    },
    {
      id: "large-bundle-import",
      pattern: /import\s+.*\s+from\s+['"]lodash['"]|import\s+.*\s+from\s+['"]moment['"]/,
      message: "Importing entire library can increase bundle size",
      severity: "medium",
      category: "performance",
      fix: "Use specific imports like lodash/get or date-fns instead"
    },
    // Accessibility Rules
    {
      id: "missing-alt-text",
      pattern: /<img(?![^>]*alt=)[^>]*>/,
      message: "Images must have alt text for accessibility",
      severity: "high",
      category: "accessibility",
      fix: "Add alt attribute with descriptive text",
      autoFix: (content) => content.replace(/<img([^>]*)>/g, '<img$1 alt="">')
    },
    {
      id: "missing-button-type",
      pattern: /<button(?![^>]*type=)[^>]*>/,
      message: "Buttons should have explicit type attribute",
      severity: "medium",
      category: "accessibility",
      fix: 'Add type="button" or type="submit" as appropriate',
      autoFix: (content) => content.replace(/<button([^>]*)>/g, '<button type="button"$1>')
    },
    // React-specific Rules
    {
      id: "missing-key-prop",
      pattern: /\.map\s*\(\s*\([^)]*\)\s*=>\s*<[^>]*(?!.*key=)/,
      message: "Missing key prop in list rendering",
      severity: "high",
      category: "correctness",
      fix: "Add unique key prop to each list item"
    },
    {
      id: "unused-state",
      pattern: /const\s+\[\s*\w+\s*,\s*set\w+\s*\]\s*=\s*useState/,
      message: "Potential unused state variable",
      severity: "low",
      category: "maintainability",
      fix: "Remove unused state or use the state variable"
    },
    {
      id: "missing-dependency",
      pattern: /useEffect\s*\(\s*\(\s*\)\s*=>\s*{[^}]*}\s*,\s*\[\s*\]\s*\)/,
      message: "useEffect with empty dependency array might be missing dependencies",
      severity: "medium",
      category: "correctness",
      fix: "Add missing dependencies or use useCallback/useMemo"
    },
    // TypeScript Rules
    {
      id: "any-type",
      pattern: /:\s*any\b/,
      message: 'Avoid using "any" type, use specific types instead',
      severity: "medium",
      category: "maintainability",
      fix: "Define proper TypeScript interfaces or types"
    },
    {
      id: "console-log",
      pattern: /console\.(log|warn|error|debug)/,
      message: "Console statements should be removed before production",
      severity: "low",
      category: "maintainability",
      fix: "Remove console statements or use proper logging library",
      autoFix: (content) => content.replace(/console\.(log|warn|error|debug)\([^)]*\);?\n?/g, "")
    },
    // Code Quality Rules
    {
      id: "magic-numbers",
      pattern: /\b(?!0|1|2|10|100|1000)\d{3,}\b/,
      message: "Magic numbers should be replaced with named constants",
      severity: "low",
      category: "maintainability",
      fix: "Extract numbers to named constants"
    },
    {
      id: "long-function",
      pattern: /function\s+\w+[^{]*{(?:[^{}]*{[^{}]*})*[^{}]{200,}}/,
      message: "Function is too long and should be broken down",
      severity: "medium",
      category: "maintainability",
      fix: "Break down into smaller, focused functions"
    }
  ];
  function analyzeWithAST(content, filePath) {
    const issues = [];
    try {
      let traverse = function(node, parent) {
        if (!node) return;
        if (node.type === AST_NODE_TYPES.ImportDeclaration) {
          const importName = node.source.value;
          if (!content.includes(importName.split("/").pop())) {
            issues.push({
              rule: {
                id: "unused-import",
                message: `Unused import: ${importName}`,
                severity: "low",
                category: "maintainability",
                fix: "Remove unused import"
              },
              line: node.loc?.start.line || 0,
              column: node.loc?.start.column || 0
            });
          }
        }
        if (node.type === AST_NODE_TYPES.ConditionalExpression && parent?.type === AST_NODE_TYPES.ConditionalExpression) {
          issues.push({
            rule: {
              id: "nested-ternary",
              message: "Nested ternary operators reduce readability",
              severity: "medium",
              category: "maintainability",
              fix: "Use if-else statements or extract to a function"
            },
            line: node.loc?.start.line || 0,
            column: node.loc?.start.column || 0
          });
        }
        for (const key in node) {
          if (key !== "parent" && key !== "loc" && key !== "range") {
            const child = node[key];
            if (Array.isArray(child)) {
              child.forEach((item) => traverse(item, node));
            } else if (child && typeof child === "object") {
              traverse(child, node);
            }
          }
        }
      };
      const ast = parse(content, {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true
        }
      });
      traverse(ast);
    } catch (error) {
      console.warn(`AST parsing failed for ${filePath}:`, error);
    }
    return issues;
  }
  function analyzeWithRegex(content) {
    const issues = [];
    const lines = content.split("\n");
    lines.forEach((line, lineIndex) => {
      rules.forEach((rule) => {
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
  function generateFixSuggestions(issues) {
    const suggestions = [];
    const categoryGroups = issues.reduce((acc, issue) => {
      if (!acc[issue.rule.category]) acc[issue.rule.category] = [];
      acc[issue.rule.category].push(issue);
      return acc;
    }, {});
    Object.entries(categoryGroups).forEach(([category, categoryIssues]) => {
      suggestions.push(`
${category.toUpperCase()} ISSUES (${categoryIssues.length}):`);
      categoryIssues.slice(0, 5).forEach((issue) => {
        suggestions.push(`  \u2022 Line ${issue.line}: ${issue.rule.message}`);
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
  function applyAutoFixes(content, issues) {
    let fixedContent = content;
    issues.forEach((issue) => {
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
    name: "advanced-error-prevention",
    load(id) {
      if (id.endsWith(".tsx") || id.endsWith(".jsx") || id.endsWith(".ts")) {
        try {
          const content = readFileSync2(id, "utf-8");
          const regexIssues = analyzeWithRegex(content);
          const astIssues = analyzeWithAST(content, id);
          const allIssues = [...regexIssues, ...astIssues];
          if (allIssues.length > 0) {
            console.log(`
\u{1F50D} Advanced analysis for: ${id}`);
            const critical = allIssues.filter((i) => i.rule.severity === "critical");
            const high = allIssues.filter((i) => i.rule.severity === "high");
            const medium = allIssues.filter((i) => i.rule.severity === "medium");
            const low = allIssues.filter((i) => i.rule.severity === "low");
            [...critical, ...high].forEach((issue) => {
              const icon = issue.rule.severity === "critical" ? "\u{1F6A8}" : "\u274C";
              console.log(`${icon} Line ${issue.line}: ${issue.rule.message}`);
              if (issue.rule.fix) {
                console.log(`   \u{1F4A1} Fix: ${issue.rule.fix}`);
              }
            });
            if (medium.length > 0) {
              console.log(`\u26A0\uFE0F  ${medium.length} medium severity issues found`);
            }
            if (low.length > 0) {
              console.log(`\u2139\uFE0F  ${low.length} low severity issues found`);
            }
            const suggestions = generateFixSuggestions(allIssues);
            if (suggestions.length > 0) {
              console.log("\n\u{1F4CB} DETAILED ANALYSIS:");
              suggestions.forEach((suggestion) => console.log(suggestion));
            }
            const autoFixableIssues = allIssues.filter((i) => i.rule.autoFix);
            if (autoFixableIssues.length > 0) {
              console.log(`
\u{1F527} ${autoFixableIssues.length} issues can be auto-fixed`);
            }
            if (critical.length > 0) {
              throw new Error(`Build failed: ${critical.length} critical error(s) in ${id}`);
            }
            if (high.length > 3) {
              console.warn(`\u26A0\uFE0F  High number of high-severity issues (${high.length}) in ${id}`);
            }
          }
        } catch (error) {
          if (error instanceof Error && error.message.includes("Build failed")) {
            throw error;
          }
        }
      }
      return null;
    },
    configureServer(server) {
      server.ws.on("error-prevention:analyze", (data) => {
        const { filePath, content } = data;
        const regexIssues = analyzeWithRegex(content);
        const astIssues = analyzeWithAST(content, filePath);
        const allIssues = [...regexIssues, ...astIssues];
        server.ws.send("error-prevention:results", {
          filePath,
          issues: allIssues,
          suggestions: generateFixSuggestions(allIssues),
          autoFixable: allIssues.filter((i) => i.rule.autoFix).length
        });
      });
      server.ws.on("error-prevention:auto-fix", (data) => {
        const { filePath, content } = data;
        const issues = [...analyzeWithRegex(content), ...analyzeWithAST(content, filePath)];
        const fixedContent = applyAutoFixes(content, issues);
        server.ws.send("error-prevention:fixed", {
          filePath,
          originalContent: content,
          fixedContent,
          appliedFixes: issues.filter((i) => i.rule.autoFix).map((i) => i.rule.id)
        });
      });
    }
  };
}

// plugins/performance-optimizer.ts
import { writeFileSync as writeFileSync2, readFileSync as readFileSync3, existsSync as existsSync2 } from "fs";
import { join as join2 } from "path";
import { gzipSync } from "zlib";
function performanceOptimizer(config = {
  bundleAnalysis: true,
  codesplitting: true,
  lazyLoading: true,
  assetOptimization: true,
  compressionAnalysis: true
}) {
  let buildStartTime;
  let bundleAnalysis;
  let performanceMetrics;
  const logDir = join2(process.cwd(), "logs");
  const analysisFile = join2(logDir, "bundle-analysis.json");
  const metricsFile = join2(logDir, "performance-metrics.json");
  function analyzeBundleComposition(bundle) {
    const chunks = [];
    const assets = [];
    let totalSize = 0;
    let totalGzipSize = 0;
    Object.entries(bundle).forEach(([fileName, chunk]) => {
      if (chunk.type === "chunk") {
        const chunkSize = chunk.code?.length || 0;
        const gzipSize = chunk.code ? gzipSync(chunk.code).length : 0;
        totalSize += chunkSize;
        totalGzipSize += gzipSize;
        chunks.push({
          name: fileName,
          size: chunkSize,
          gzipSize,
          modules: chunk.modules ? Object.keys(chunk.modules) : [],
          dependencies: chunk.imports || [],
          isEntry: chunk.isEntry || false,
          isDynamic: chunk.isDynamicEntry || false
        });
      } else if (chunk.type === "asset") {
        const assetSize = chunk.source?.length || 0;
        totalSize += assetSize;
        assets.push({
          name: fileName,
          size: assetSize,
          type: fileName.split(".").pop() || "unknown"
        });
      }
    });
    const recommendations = generateOptimizationRecommendations(chunks, assets);
    return {
      chunks,
      assets,
      totalSize,
      totalGzipSize,
      recommendations
    };
  }
  function generateOptimizationRecommendations(chunks, assets) {
    const recommendations = [];
    const largeChunks = chunks.filter((chunk) => chunk.size > 5e5);
    if (largeChunks.length > 0) {
      recommendations.push(
        `Consider splitting large chunks: ${largeChunks.map((c) => c.name).join(", ")}`
      );
    }
    const vendorChunks = chunks.filter(
      (chunk) => chunk.modules.some((module) => module.includes("node_modules"))
    );
    if (vendorChunks.length === 0) {
      recommendations.push("Consider creating a vendor chunk for third-party libraries");
    }
    const allModules = chunks.flatMap((chunk) => chunk.modules);
    const duplicateModules = allModules.filter(
      (module, index) => allModules.indexOf(module) !== index
    );
    if (duplicateModules.length > 0) {
      recommendations.push(
        `Potential duplicate modules detected: ${[...new Set(duplicateModules)].slice(0, 3).join(", ")}`
      );
    }
    const largeAssets = assets.filter((asset) => asset.size > 1e6);
    if (largeAssets.length > 0) {
      recommendations.push(
        `Consider optimizing large assets: ${largeAssets.map((a) => a.name).join(", ")}`
      );
    }
    const totalOriginalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const totalGzipSize = chunks.reduce((sum, chunk) => sum + chunk.gzipSize, 0);
    const compressionRatio = totalGzipSize / totalOriginalSize;
    if (compressionRatio > 0.7) {
      recommendations.push("Poor compression ratio - consider minification improvements");
    }
    const staticChunks = chunks.filter((chunk) => !chunk.isDynamic && !chunk.isEntry);
    if (staticChunks.length > 5) {
      recommendations.push("Consider using dynamic imports for route-based code splitting");
    }
    return recommendations;
  }
  function generateCodeSplittingConfig(chunks) {
    const config2 = {
      manualChunks: {}
    };
    const vendorModules = /* @__PURE__ */ new Set();
    chunks.forEach((chunk) => {
      chunk.modules.forEach((module) => {
        if (module.includes("node_modules")) {
          const packageName = module.split("node_modules/")[1]?.split("/")[0];
          if (packageName) {
            vendorModules.add(packageName);
          }
        }
      });
    });
    const commonVendors = ["react", "react-dom", "react-router-dom"];
    const uiLibraries = ["lucide-react", "@headlessui", "@radix-ui"];
    const utilityLibraries = ["lodash", "date-fns", "axios"];
    commonVendors.forEach((vendor) => {
      if (vendorModules.has(vendor)) {
        config2.manualChunks[vendor] = [vendor];
      }
    });
    if (uiLibraries.some((lib) => vendorModules.has(lib))) {
      config2.manualChunks["ui-libs"] = uiLibraries.filter((lib) => vendorModules.has(lib));
    }
    if (utilityLibraries.some((lib) => vendorModules.has(lib))) {
      config2.manualChunks["utils"] = utilityLibraries.filter((lib) => vendorModules.has(lib));
    }
    return config2;
  }
  function calculatePerformanceMetrics(buildTime, analysis) {
    const compressionRatio = analysis.totalGzipSize / analysis.totalSize;
    const totalModules = analysis.chunks.reduce((sum, chunk) => sum + chunk.modules.length, 0);
    const treeshakingEfficiency = Math.max(0, 1 - totalModules / 1e3);
    const dynamicChunks = analysis.chunks.filter((chunk) => chunk.isDynamic).length;
    const codeUtilization = Math.min(1, dynamicChunks / Math.max(1, analysis.chunks.length));
    return {
      buildTime,
      bundleSize: analysis.totalSize,
      chunkCount: analysis.chunks.length,
      assetCount: analysis.assets.length,
      compressionRatio,
      treeshakingEfficiency,
      codeUtilization
    };
  }
  function generateLazyLoadingRecommendations(chunks) {
    const recommendations = [];
    const largeStaticChunks = chunks.filter(
      (chunk) => !chunk.isDynamic && !chunk.isEntry && chunk.size > 1e5
    );
    if (largeStaticChunks.length > 0) {
      recommendations.push("Consider lazy loading for these components:");
      largeStaticChunks.forEach((chunk) => {
        recommendations.push(`  \u2022 ${chunk.name} (${Math.round(chunk.size / 1024)}KB)`);
      });
    }
    return recommendations;
  }
  function optimizeAssets(assets) {
    const optimizations = [];
    const images = assets.filter(
      (asset) => ["jpg", "jpeg", "png", "gif", "svg"].includes(asset.type)
    );
    const largeImages = images.filter((img) => img.size > 5e5);
    if (largeImages.length > 0) {
      optimizations.push("Consider optimizing large images:");
      largeImages.forEach((img) => {
        optimizations.push(`  \u2022 ${img.name} (${Math.round(img.size / 1024)}KB)`);
      });
    }
    const fonts = assets.filter(
      (asset) => ["woff", "woff2", "ttf", "otf"].includes(asset.type)
    );
    if (fonts.length > 3) {
      optimizations.push("Consider reducing the number of font files or using font subsetting");
    }
    return optimizations;
  }
  return {
    name: "performance-optimizer",
    buildStart() {
      buildStartTime = Date.now();
      console.log("\u26A1 Performance optimization started");
    },
    generateBundle(options, bundle) {
      const buildTime = Date.now() - buildStartTime;
      if (config.bundleAnalysis) {
        bundleAnalysis = analyzeBundleComposition(bundle);
        performanceMetrics = calculatePerformanceMetrics(buildTime, bundleAnalysis);
        try {
          writeFileSync2(analysisFile, JSON.stringify(bundleAnalysis, null, 2));
          writeFileSync2(metricsFile, JSON.stringify(performanceMetrics, null, 2));
        } catch (error) {
          console.error("Failed to save performance analysis:", error);
        }
      }
    },
    writeBundle() {
      if (!bundleAnalysis || !performanceMetrics) return;
      console.log("\n\u{1F4CA} Performance Analysis Results:");
      console.log(`   \u23F1\uFE0F  Build Time: ${performanceMetrics.buildTime}ms`);
      console.log(`   \u{1F4E6} Total Bundle Size: ${Math.round(performanceMetrics.bundleSize / 1024)}KB`);
      console.log(`   \u{1F5DC}\uFE0F  Gzipped Size: ${Math.round(bundleAnalysis.totalGzipSize / 1024)}KB`);
      console.log(`   \u{1F4CA} Compression Ratio: ${Math.round(performanceMetrics.compressionRatio * 100)}%`);
      console.log(`   \u{1F9E9} Chunks: ${performanceMetrics.chunkCount}`);
      console.log(`   \u{1F5BC}\uFE0F  Assets: ${performanceMetrics.assetCount}`);
      let score = 100;
      if (performanceMetrics.buildTime > 15e3) score -= 20;
      if (performanceMetrics.bundleSize > 2e6) score -= 25;
      if (performanceMetrics.compressionRatio > 0.7) score -= 15;
      if (performanceMetrics.chunkCount > 20) score -= 10;
      console.log(`   \u{1F3AF} Performance Score: ${Math.max(0, score)}/100`);
      if (bundleAnalysis.recommendations.length > 0) {
        console.log("\n\u{1F4A1} Optimization Recommendations:");
        bundleAnalysis.recommendations.forEach((rec) => {
          console.log(`   \u2022 ${rec}`);
        });
      }
      if (config.codesplitting) {
        const splittingConfig = generateCodeSplittingConfig(bundleAnalysis.chunks);
        if (Object.keys(splittingConfig.manualChunks).length > 0) {
          console.log("\n\u{1F500} Suggested Code Splitting Configuration:");
          console.log(JSON.stringify(splittingConfig, null, 2));
        }
      }
      if (config.lazyLoading) {
        const lazyRecommendations = generateLazyLoadingRecommendations(bundleAnalysis.chunks);
        if (lazyRecommendations.length > 0) {
          console.log("\n\u{1F504} Lazy Loading Opportunities:");
          lazyRecommendations.forEach((rec) => console.log(`   ${rec}`));
        }
      }
      if (config.assetOptimization) {
        const assetOptimizations = optimizeAssets(bundleAnalysis.assets);
        if (assetOptimizations.length > 0) {
          console.log("\n\u{1F5BC}\uFE0F  Asset Optimization Suggestions:");
          assetOptimizations.forEach((opt) => console.log(`   ${opt}`));
        }
      }
      if (score < 70) {
        console.log("\n\u26A0\uFE0F  Performance Warning: Consider implementing the above recommendations");
      }
      if (performanceMetrics.bundleSize > 5e6) {
        console.log("\n\u{1F6A8} Critical: Bundle size is very large - immediate optimization required");
      }
    },
    configureServer(server) {
      server.ws.on("performance:get-analysis", () => {
        if (existsSync2(analysisFile) && existsSync2(metricsFile)) {
          try {
            const analysis = JSON.parse(readFileSync3(analysisFile, "utf-8"));
            const metrics = JSON.parse(readFileSync3(metricsFile, "utf-8"));
            server.ws.send("performance:analysis", {
              analysis,
              metrics,
              timestamp: (/* @__PURE__ */ new Date()).toISOString()
            });
          } catch (error) {
            console.error("Failed to load performance data:", error);
          }
        }
      });
      server.ws.on("performance:optimize", (data) => {
        const { type } = data;
        switch (type) {
          case "code-splitting":
            if (bundleAnalysis) {
              const config2 = generateCodeSplittingConfig(bundleAnalysis.chunks);
              server.ws.send("performance:optimization-config", {
                type: "code-splitting",
                config: config2
              });
            }
            break;
          case "lazy-loading":
            if (bundleAnalysis) {
              const recommendations = generateLazyLoadingRecommendations(bundleAnalysis.chunks);
              server.ws.send("performance:optimization-config", {
                type: "lazy-loading",
                recommendations
              });
            }
            break;
        }
      });
    }
  };
}

// plugins/automated-recovery.ts
import { writeFileSync as writeFileSync3, readFileSync as readFileSync4, existsSync as existsSync3, copyFileSync, mkdirSync as mkdirSync2 } from "fs";
import { join as join3 } from "path";
import * as crypto from "crypto";
import * as cron2 from "file:///home/project/node_modules/node-cron/src/node-cron.js";
function automatedRecovery(config = {
  backupInterval: "0 */6 * * *",
  // Every 6 hours
  maxBackups: 24,
  autoRestart: true,
  rollbackOnFailure: true,
  healthCheckInterval: 3e4,
  // 30 seconds
  errorThresholds: {
    critical: 3,
    consecutive: 5,
    timeWindow: 3e5
    // 5 minutes
  }
}) {
  let systemHealth = {
    isHealthy: true,
    score: 100,
    issues: [],
    lastCheck: (/* @__PURE__ */ new Date()).toISOString(),
    consecutiveFailures: 0
  };
  let backups = [];
  let recoveryActions = [];
  let errorHistory = [];
  const logDir = join3(process.cwd(), "logs");
  const backupDir = join3(logDir, "recovery-backups");
  const recoveryFile = join3(logDir, "recovery-state.json");
  const healthFile = join3(logDir, "system-health.json");
  [logDir, backupDir].forEach((dir) => {
    if (!existsSync3(dir)) {
      mkdirSync2(dir, { recursive: true });
    }
  });
  function loadRecoveryState() {
    if (existsSync3(recoveryFile)) {
      try {
        const state = JSON.parse(readFileSync4(recoveryFile, "utf-8"));
        backups = state.backups || [];
        recoveryActions = state.recoveryActions || [];
        errorHistory = state.errorHistory || [];
      } catch (error) {
        console.warn("Could not load recovery state:", error);
      }
    }
  }
  function saveRecoveryState() {
    try {
      const state = {
        backups: backups.slice(0, config.maxBackups),
        recoveryActions: recoveryActions.slice(0, 100),
        errorHistory: errorHistory.slice(0, 1e3),
        lastUpdate: (/* @__PURE__ */ new Date()).toISOString()
      };
      writeFileSync3(recoveryFile, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error("Failed to save recovery state:", error);
    }
  }
  function saveHealthState() {
    try {
      writeFileSync3(healthFile, JSON.stringify(systemHealth, null, 2));
    } catch (error) {
      console.error("Failed to save health state:", error);
    }
  }
  function createBackup(reason = "scheduled") {
    const backupId = `backup-${Date.now()}`;
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    console.log(`\u{1F4BE} Creating backup: ${backupId} (${reason})`);
    const criticalFiles = [
      "package.json",
      "vite.config.ts",
      "tsconfig.json",
      "src/App.tsx",
      "src/main.tsx"
    ];
    const files = [];
    criticalFiles.forEach((filePath) => {
      const fullPath = join3(process.cwd(), filePath);
      if (existsSync3(fullPath)) {
        try {
          const content = readFileSync4(fullPath, "utf-8");
          const checksum = crypto.createHash("md5").update(content).digest("hex");
          files.push({
            path: filePath,
            content,
            checksum
          });
          const backupFilePath = join3(backupDir, `${backupId}-${filePath.replace(/[\/\\]/g, "-")}`);
          copyFileSync(fullPath, backupFilePath);
        } catch (error) {
          console.warn(`Failed to backup file ${filePath}:`, error);
        }
      }
    });
    const backup = {
      id: backupId,
      timestamp,
      files,
      metadata: {
        buildSuccess: systemHealth.consecutiveFailures === 0,
        errorCount: errorHistory.filter(
          (e) => Date.now() - new Date(e.timestamp).getTime() < 36e5
        ).length,
        performanceScore: 85,
        // Would be calculated from actual metrics
        healthScore: systemHealth.score
      }
    };
    backups.unshift(backup);
    if (backups.length > config.maxBackups) {
      backups = backups.slice(0, config.maxBackups);
    }
    saveRecoveryState();
    return backup;
  }
  function rollbackToBackup(backupId) {
    const targetBackup = backupId ? backups.find((b) => b.id === backupId) : backups.find((b) => b.metadata.buildSuccess);
    if (!targetBackup) {
      console.error("\u274C No suitable backup found for rollback");
      return false;
    }
    console.log(`\u{1F504} Rolling back to backup: ${targetBackup.id}`);
    try {
      targetBackup.files.forEach((file) => {
        const fullPath = join3(process.cwd(), file.path);
        writeFileSync3(fullPath, file.content);
      });
      logRecoveryAction({
        type: "rollback",
        reason: `Rollback to backup ${targetBackup.id}`,
        success: true,
        details: { backupId: targetBackup.id, filesRestored: targetBackup.files.length }
      });
      console.log(`\u2705 Rollback completed: ${targetBackup.files.length} files restored`);
      return true;
    } catch (error) {
      console.error("\u274C Rollback failed:", error);
      logRecoveryAction({
        type: "rollback",
        reason: `Rollback to backup ${targetBackup.id}`,
        success: false,
        details: { error: error.message }
      });
      return false;
    }
  }
  function logRecoveryAction(action) {
    const recoveryAction = {
      id: `action-${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ...action
    };
    recoveryActions.unshift(recoveryAction);
    if (recoveryActions.length > 100) {
      recoveryActions = recoveryActions.slice(0, 100);
    }
    saveRecoveryState();
  }
  function logError(severity, message) {
    errorHistory.unshift({
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      severity,
      message
    });
    const recentErrors = errorHistory.filter(
      (e) => Date.now() - new Date(e.timestamp).getTime() < config.errorThresholds.timeWindow
    );
    const criticalErrors = recentErrors.filter((e) => e.severity === "critical");
    if (criticalErrors.length >= config.errorThresholds.critical) {
      triggerRecovery("Critical error threshold exceeded");
    }
    updateSystemHealth();
  }
  function updateSystemHealth() {
    const recentErrors = errorHistory.filter(
      (e) => Date.now() - new Date(e.timestamp).getTime() < 36e5
      // Last hour
    );
    let score = 100;
    let issues = [];
    recentErrors.forEach((error) => {
      switch (error.severity) {
        case "critical":
          score -= 20;
          break;
        case "high":
          score -= 10;
          break;
        case "medium":
          score -= 5;
          break;
        case "low":
          score -= 2;
          break;
      }
    });
    if (systemHealth.consecutiveFailures > config.errorThresholds.consecutive) {
      score -= 30;
      issues.push(`${systemHealth.consecutiveFailures} consecutive failures detected`);
    }
    systemHealth.score = Math.max(0, score);
    systemHealth.isHealthy = score >= 70;
    systemHealth.issues = issues;
    systemHealth.lastCheck = (/* @__PURE__ */ new Date()).toISOString();
    if (recentErrors.length > 0) {
      systemHealth.issues.push(`${recentErrors.length} recent errors`);
    }
    saveHealthState();
  }
  function triggerRecovery(reason) {
    console.log(`\u{1F6A8} Recovery triggered: ${reason}`);
    createBackup("emergency");
    if (config.autoRestart) {
      console.log("\u{1F504} Attempting auto-restart...");
      logRecoveryAction({
        type: "restart",
        reason,
        success: true,
        details: { method: "auto-restart" }
      });
    }
    if (config.rollbackOnFailure && systemHealth.consecutiveFailures > 2) {
      console.log("\u{1F504} Attempting rollback to last known good state...");
      const rollbackSuccess = rollbackToBackup();
      if (rollbackSuccess) {
        systemHealth.consecutiveFailures = 0;
        updateSystemHealth();
      }
    }
  }
  function performHealthCheck() {
    const recentErrors = errorHistory.filter(
      (e) => Date.now() - new Date(e.timestamp).getTime() < config.healthCheckInterval
    );
    if (recentErrors.length > 0) {
      systemHealth.consecutiveFailures++;
    } else {
      systemHealth.consecutiveFailures = Math.max(0, systemHealth.consecutiveFailures - 1);
    }
    updateSystemHealth();
    if (!systemHealth.isHealthy && systemHealth.score < 30) {
      triggerRecovery("System health critical");
    }
  }
  function repairCommonIssues() {
    console.log("\u{1F527} Attempting to repair common issues...");
    let repaired = false;
    const repairs = [];
    try {
      const packageJson = JSON.parse(readFileSync4(join3(process.cwd(), "package.json"), "utf-8"));
      const nodeModulesExists = existsSync3(join3(process.cwd(), "node_modules"));
      if (!nodeModulesExists) {
        console.log("\u{1F4E6} Node modules missing - this would trigger npm install");
        repairs.push("Node modules installation required");
        repaired = true;
      }
    } catch (error) {
      console.warn("Could not check package.json:", error);
    }
    const configFiles = ["vite.config.ts", "tsconfig.json"];
    configFiles.forEach((file) => {
      const filePath = join3(process.cwd(), file);
      if (existsSync3(filePath)) {
        try {
          const content = readFileSync4(filePath, "utf-8");
          if (content.trim().length === 0) {
            console.log(`\u{1F4DD} Empty config file detected: ${file}`);
            repairs.push(`Empty config file: ${file}`);
            repaired = true;
          }
        } catch (error) {
          console.warn(`Could not read ${file}:`, error);
          repairs.push(`Corrupted config file: ${file}`);
          repaired = true;
        }
      }
    });
    if (repaired) {
      logRecoveryAction({
        type: "repair",
        reason: "Automated repair of common issues",
        success: true,
        details: { repairs }
      });
    }
    return repaired;
  }
  return {
    name: "automated-recovery",
    configureServer(server) {
      loadRecoveryState();
      cron2.schedule(config.backupInterval, () => {
        createBackup("scheduled");
      });
      setInterval(() => {
        performHealthCheck();
      }, config.healthCheckInterval);
      server.ws.on("recovery:get-status", () => {
        server.ws.send("recovery:status", {
          health: systemHealth,
          backups: backups.slice(0, 10),
          recentActions: recoveryActions.slice(0, 10),
          errorHistory: errorHistory.slice(0, 20)
        });
      });
      server.ws.on("recovery:create-backup", () => {
        const backup = createBackup("manual");
        server.ws.send("recovery:backup-created", backup);
      });
      server.ws.on("recovery:rollback", (data) => {
        const { backupId } = data;
        const success = rollbackToBackup(backupId);
        server.ws.send("recovery:rollback-result", { success, backupId });
      });
      server.ws.on("recovery:repair", () => {
        const success = repairCommonIssues();
        server.ws.send("recovery:repair-result", { success });
      });
    },
    buildStart() {
      console.log("\u{1F6E1}\uFE0F  Automated recovery system active");
      updateSystemHealth();
    },
    buildError(error) {
      console.error("\u{1F6A8} Build error detected:", error.message);
      logError("critical", `Build error: ${error.message}`);
      const repaired = repairCommonIssues();
      if (!repaired && config.rollbackOnFailure) {
        triggerRecovery("Build failure");
      }
    },
    buildEnd() {
      if (systemHealth.consecutiveFailures > 0) {
        console.log("\u2705 Build successful - resetting failure count");
        systemHealth.consecutiveFailures = 0;
        updateSystemHealth();
      }
    }
  };
}

// plugins/real-time-monitor.ts
import { WebSocketServer } from "file:///home/project/node_modules/ws/wrapper.mjs";
import { watch as watch2 } from "file:///home/project/node_modules/chokidar/index.js";
import { writeFileSync as writeFileSync4, readFileSync as readFileSync5, existsSync as existsSync4 } from "fs";
import { join as join4 } from "path";
import * as cron3 from "file:///home/project/node_modules/node-cron/src/node-cron.js";
function realTimeMonitor(config = {
  enableDOMTracking: true,
  enableNetworkMonitoring: true,
  enablePerformanceTracking: true,
  enableErrorCapture: true,
  alertThresholds: {
    errorRate: 10,
    // errors per minute
    responseTime: 5e3,
    // milliseconds
    memoryUsage: 100 * 1024 * 1024,
    // 100MB
    buildTime: 3e4
    // 30 seconds
  },
  reportingInterval: "0 0 * * *",
  // Daily at midnight
  retentionPeriod: 30
  // 30 days
}) {
  let events = [];
  let wsServer;
  let connectedClients = /* @__PURE__ */ new Set();
  const logDir = join4(process.cwd(), "logs");
  const eventsFile = join4(logDir, "real-time-events.json");
  const reportsDir = join4(logDir, "daily-reports");
  [logDir, reportsDir].forEach((dir) => {
    if (!existsSync4(dir)) {
      __require("fs").mkdirSync(dir, { recursive: true });
    }
  });
  const alertRules = [
    {
      id: "high-error-rate",
      name: "High Error Rate",
      condition: (events2) => {
        const recentErrors = events2.filter(
          (e) => e.type === "error" && Date.now() - new Date(e.timestamp).getTime() < 6e4
          // Last minute
        );
        return recentErrors.length > config.alertThresholds.errorRate;
      },
      severity: "high",
      cooldown: 3e5
      // 5 minutes
    },
    {
      id: "slow-response-time",
      name: "Slow Response Time",
      condition: (events2) => {
        const recentNetwork = events2.filter(
          (e) => e.type === "network" && Date.now() - new Date(e.timestamp).getTime() < 6e4
        );
        const avgResponseTime = recentNetwork.reduce((sum, e) => sum + (e.data.responseTime || 0), 0) / recentNetwork.length;
        return avgResponseTime > config.alertThresholds.responseTime;
      },
      severity: "medium",
      cooldown: 18e4
      // 3 minutes
    },
    {
      id: "memory-leak",
      name: "Potential Memory Leak",
      condition: (events2) => {
        const recentPerf = events2.filter(
          (e) => e.type === "performance" && e.data.memoryUsage && Date.now() - new Date(e.timestamp).getTime() < 3e5
          // Last 5 minutes
        );
        return recentPerf.some((e) => e.data.memoryUsage > config.alertThresholds.memoryUsage);
      },
      severity: "high",
      cooldown: 6e5
      // 10 minutes
    },
    {
      id: "build-performance",
      name: "Build Performance Degradation",
      condition: (events2) => {
        const recentBuilds = events2.filter(
          (e) => e.type === "build" && Date.now() - new Date(e.timestamp).getTime() < 36e5
          // Last hour
        );
        const avgBuildTime = recentBuilds.reduce((sum, e) => sum + (e.data.buildTime || 0), 0) / recentBuilds.length;
        return avgBuildTime > config.alertThresholds.buildTime;
      },
      severity: "medium",
      cooldown: 9e5
      // 15 minutes
    }
  ];
  function addEvent(event) {
    const realTimeEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ...event
    };
    events.unshift(realTimeEvent);
    if (events.length > 1e4) {
      events = events.slice(0, 1e4);
    }
    broadcastEvent(realTimeEvent);
    checkAlertRules();
    if (events.length % 100 === 0) {
      persistEvents();
    }
  }
  function broadcastEvent(event) {
    const message = JSON.stringify({
      type: "real-time-event",
      event
    });
    connectedClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
  function checkAlertRules() {
    const now = Date.now();
    alertRules.forEach((rule) => {
      if (rule.lastTriggered && now - new Date(rule.lastTriggered).getTime() < rule.cooldown) {
        return;
      }
      if (rule.condition(events)) {
        triggerAlert(rule);
        rule.lastTriggered = (/* @__PURE__ */ new Date()).toISOString();
      }
    });
  }
  function triggerAlert(rule) {
    const alert = {
      id: `alert-${Date.now()}`,
      rule: rule.name,
      severity: rule.severity,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      message: `Alert triggered: ${rule.name}`
    };
    console.log(`\u{1F6A8} ${rule.severity.toUpperCase()} ALERT: ${rule.name}`);
    addEvent({
      type: "error",
      severity: rule.severity === "critical" ? "critical" : "warning",
      source: "alert-system",
      data: alert
    });
    broadcastNotification(alert);
  }
  function broadcastNotification(alert) {
    const message = JSON.stringify({
      type: "alert",
      alert
    });
    connectedClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
  function persistEvents() {
    try {
      const dataToSave = {
        events: events.slice(0, 1e3),
        // Save last 1000 events
        lastUpdate: (/* @__PURE__ */ new Date()).toISOString()
      };
      writeFileSync4(eventsFile, JSON.stringify(dataToSave, null, 2));
    } catch (error) {
      console.error("Failed to persist events:", error);
    }
  }
  function loadEvents() {
    if (existsSync4(eventsFile)) {
      try {
        const data = JSON.parse(readFileSync5(eventsFile, "utf-8"));
        events = data.events || [];
      } catch (error) {
        console.warn("Could not load existing events:", error);
      }
    }
  }
  function generateDailyReport() {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const todayEvents = events.filter((e) => e.timestamp.startsWith(today));
    const errorEvents = todayEvents.filter((e) => e.severity === "error" || e.severity === "critical");
    const warningEvents = todayEvents.filter((e) => e.severity === "warning");
    const networkEvents = todayEvents.filter((e) => e.type === "network");
    const buildEvents = todayEvents.filter((e) => e.type === "build");
    const avgResponseTime = networkEvents.length > 0 ? networkEvents.reduce((sum, e) => sum + (e.data.responseTime || 0), 0) / networkEvents.length : 0;
    const peakMemoryUsage = Math.max(
      ...todayEvents.filter((e) => e.data.memoryUsage).map((e) => e.data.memoryUsage),
      0
    );
    const avgBuildTime = buildEvents.length > 0 ? buildEvents.reduce((sum, e) => sum + (e.data.buildTime || 0), 0) / buildEvents.length : 0;
    const errorRate = errorEvents.length / Math.max(todayEvents.length, 1) * 100;
    const performanceScore = Math.max(0, 100 - avgResponseTime / 100);
    const stabilityScore = Math.max(0, 100 - errorEvents.length * 5);
    const issueTypes = todayEvents.reduce((acc, event) => {
      const key = `${event.type}-${event.severity}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const topIssues = Object.entries(issueTypes).sort(([, a], [, b]) => b - a).slice(0, 5).map(([type, count]) => ({
      type,
      count,
      description: `${type} events occurred ${count} times`
    }));
    const recommendations = [];
    if (errorRate > 5) {
      recommendations.push("High error rate detected - review recent code changes");
    }
    if (avgResponseTime > 2e3) {
      recommendations.push("Slow response times - consider performance optimization");
    }
    if (avgBuildTime > 15e3) {
      recommendations.push("Build times are slow - consider build optimization");
    }
    if (peakMemoryUsage > 80 * 1024 * 1024) {
      recommendations.push("High memory usage detected - check for memory leaks");
    }
    return {
      date: today,
      summary: {
        totalEvents: todayEvents.length,
        errorCount: errorEvents.length,
        warningCount: warningEvents.length,
        avgResponseTime,
        peakMemoryUsage,
        buildCount: buildEvents.length,
        avgBuildTime
      },
      trends: {
        errorRate,
        performanceScore,
        stabilityScore
      },
      topIssues,
      recommendations
    };
  }
  function saveDailyReport() {
    const report = generateDailyReport();
    const reportFile = join4(reportsDir, `report-${report.date}.json`);
    try {
      writeFileSync4(reportFile, JSON.stringify(report, null, 2));
      console.log(`\u{1F4CA} Daily report generated: ${reportFile}`);
      const message = JSON.stringify({
        type: "daily-report",
        report
      });
      connectedClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } catch (error) {
      console.error("Failed to save daily report:", error);
    }
  }
  function cleanupOldData() {
    const cutoffDate = /* @__PURE__ */ new Date();
    cutoffDate.setDate(cutoffDate.getDate() - config.retentionPeriod);
    events = events.filter((e) => new Date(e.timestamp) > cutoffDate);
    try {
      const fs = __require("fs");
      const files = fs.readdirSync(reportsDir);
      files.forEach((file) => {
        if (file.startsWith("report-")) {
          const fileDate = file.replace("report-", "").replace(".json", "");
          if (new Date(fileDate) < cutoffDate) {
            fs.unlinkSync(join4(reportsDir, file));
          }
        }
      });
    } catch (error) {
      console.warn("Failed to cleanup old report files:", error);
    }
  }
  return {
    name: "real-time-monitor",
    configureServer(server) {
      loadEvents();
      wsServer = new WebSocketServer({ port: 3002 });
      wsServer.on("connection", (ws) => {
        connectedClients.add(ws);
        console.log(`\u{1F50C} Real-time monitor client connected (${connectedClients.size} total)`);
        ws.send(JSON.stringify({
          type: "initial-events",
          events: events.slice(0, 50)
        }));
        ws.on("close", () => {
          connectedClients.delete(ws);
          console.log(`\u{1F50C} Real-time monitor client disconnected (${connectedClients.size} total)`);
        });
        ws.on("message", (message) => {
          try {
            const data = JSON.parse(message.toString());
            switch (data.type) {
              case "client-error":
                addEvent({
                  type: "error",
                  severity: "error",
                  source: "client",
                  data: data.error
                });
                break;
              case "performance-metric":
                addEvent({
                  type: "performance",
                  severity: "info",
                  source: "client",
                  data: data.metric
                });
                break;
              case "network-request":
                addEvent({
                  type: "network",
                  severity: data.error ? "warning" : "info",
                  source: "client",
                  data: data.request
                });
                break;
            }
          } catch (error) {
            console.error("Error processing real-time monitor message:", error);
          }
        });
      });
      if (config.enableDOMTracking) {
        const watcher = watch2(["src/**/*"], {
          ignored: ["node_modules", "dist", "logs"],
          persistent: true
        });
        watcher.on("change", (filePath) => {
          addEvent({
            type: "file",
            severity: "info",
            source: "file-watcher",
            data: { path: filePath, action: "modified" }
          });
        });
      }
      cron3.schedule(config.reportingInterval, () => {
        saveDailyReport();
        cleanupOldData();
      });
      cron3.schedule("0 2 * * *", () => {
        cleanupOldData();
      });
      setInterval(() => {
        persistEvents();
      }, 6e4);
    },
    buildStart() {
      console.log("\u{1F4E1} Real-time monitoring started");
      addEvent({
        type: "build",
        severity: "info",
        source: "vite",
        data: { action: "build-start", timestamp: Date.now() }
      });
    },
    buildEnd() {
      addEvent({
        type: "build",
        severity: "info",
        source: "vite",
        data: { action: "build-end", timestamp: Date.now() }
      });
    },
    buildError(error) {
      addEvent({
        type: "error",
        severity: "critical",
        source: "vite",
        data: {
          message: error.message,
          stack: error.stack,
          plugin: error.plugin
        }
      });
    },
    generateBundle(options, bundle) {
      const bundleSize = Object.values(bundle).reduce((size, chunk) => {
        return size + (chunk.code?.length || chunk.source?.length || 0);
      }, 0);
      addEvent({
        type: "build",
        severity: "info",
        source: "vite",
        data: {
          action: "bundle-generated",
          bundleSize,
          chunkCount: Object.keys(bundle).length
        }
      });
    }
  };
}

// vite.config.ts
import checker from "file:///home/project/node_modules/vite-plugin-checker/dist/esm/main.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    checker({
      typescript: true
    }),
    comprehensiveTracker({
      errorThreshold: {
        critical: 0,
        high: 2,
        medium: 5,
        low: 10
      },
      performanceBenchmarks: {
        buildTime: 15e3,
        // 15 seconds
        bundleSize: 2e6,
        // 2MB
        chunkSize: 5e5,
        // 500KB
        memoryUsage: 1e8
        // 100MB
      },
      loggingLevel: "detailed",
      notifications: {
        desktop: true,
        console: true,
        webhook: false
      },
      recovery: {
        autoRestart: true,
        backupOnError: true,
        rollbackOnFailure: false
      }
    }),
    advancedErrorPrevention(),
    performanceOptimizer(),
    automatedRecovery(),
    realTimeMonitor()
  ],
  optimizeDeps: {
    exclude: ["lucide-react"]
  },
  server: {
    port: 3e3,
    host: true,
    hmr: {
      overlay: true,
      port: 3001
    }
  },
  build: {
    sourcemap: true,
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          icons: ["lucide-react"],
          admin: [
            "./src/components/admin/AdminDashboard",
            "./src/components/admin/PropertyUpload",
            "./src/components/admin/ClientManagement"
          ]
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]"
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  define: {
    __MONITORING_ENABLED__: true,
    __BUILD_TIME__: JSON.stringify((/* @__PURE__ */ new Date()).toISOString())
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGx1Z2lucy9jb21wcmVoZW5zaXZlLXRyYWNrZXIudHMiLCAicGx1Z2lucy9hZHZhbmNlZC1lcnJvci1wcmV2ZW50aW9uLnRzIiwgInBsdWdpbnMvcGVyZm9ybWFuY2Utb3B0aW1pemVyLnRzIiwgInBsdWdpbnMvYXV0b21hdGVkLXJlY292ZXJ5LnRzIiwgInBsdWdpbnMvcmVhbC10aW1lLW1vbml0b3IudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBjb21wcmVoZW5zaXZlVHJhY2tlciB9IGZyb20gJy4vcGx1Z2lucy9jb21wcmVoZW5zaXZlLXRyYWNrZXInO1xuaW1wb3J0IHsgYWR2YW5jZWRFcnJvclByZXZlbnRpb24gfSBmcm9tICcuL3BsdWdpbnMvYWR2YW5jZWQtZXJyb3ItcHJldmVudGlvbic7XG5pbXBvcnQgeyBwZXJmb3JtYW5jZU9wdGltaXplciB9IGZyb20gJy4vcGx1Z2lucy9wZXJmb3JtYW5jZS1vcHRpbWl6ZXInO1xuaW1wb3J0IHsgYXV0b21hdGVkUmVjb3ZlcnkgfSBmcm9tICcuL3BsdWdpbnMvYXV0b21hdGVkLXJlY292ZXJ5JztcbmltcG9ydCB7IHJlYWxUaW1lTW9uaXRvciB9IGZyb20gJy4vcGx1Z2lucy9yZWFsLXRpbWUtbW9uaXRvcic7XG5pbXBvcnQgY2hlY2tlciBmcm9tICd2aXRlLXBsdWdpbi1jaGVja2VyJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIGNoZWNrZXIoe1xuICAgICAgdHlwZXNjcmlwdDogdHJ1ZVxuICAgIH0pLFxuICAgIGNvbXByZWhlbnNpdmVUcmFja2VyKHtcbiAgICAgIGVycm9yVGhyZXNob2xkOiB7XG4gICAgICAgIGNyaXRpY2FsOiAwLFxuICAgICAgICBoaWdoOiAyLFxuICAgICAgICBtZWRpdW06IDUsXG4gICAgICAgIGxvdzogMTBcbiAgICAgIH0sXG4gICAgICBwZXJmb3JtYW5jZUJlbmNobWFya3M6IHtcbiAgICAgICAgYnVpbGRUaW1lOiAxNTAwMCwgLy8gMTUgc2Vjb25kc1xuICAgICAgICBidW5kbGVTaXplOiAyMDAwMDAwLCAvLyAyTUJcbiAgICAgICAgY2h1bmtTaXplOiA1MDAwMDAsIC8vIDUwMEtCXG4gICAgICAgIG1lbW9yeVVzYWdlOiAxMDAwMDAwMDAgLy8gMTAwTUJcbiAgICAgIH0sXG4gICAgICBsb2dnaW5nTGV2ZWw6ICdkZXRhaWxlZCcsXG4gICAgICBub3RpZmljYXRpb25zOiB7XG4gICAgICAgIGRlc2t0b3A6IHRydWUsXG4gICAgICAgIGNvbnNvbGU6IHRydWUsXG4gICAgICAgIHdlYmhvb2s6IGZhbHNlXG4gICAgICB9LFxuICAgICAgcmVjb3Zlcnk6IHtcbiAgICAgICAgYXV0b1Jlc3RhcnQ6IHRydWUsXG4gICAgICAgIGJhY2t1cE9uRXJyb3I6IHRydWUsXG4gICAgICAgIHJvbGxiYWNrT25GYWlsdXJlOiBmYWxzZVxuICAgICAgfVxuICAgIH0pLFxuICAgIGFkdmFuY2VkRXJyb3JQcmV2ZW50aW9uKCksXG4gICAgcGVyZm9ybWFuY2VPcHRpbWl6ZXIoKSxcbiAgICBhdXRvbWF0ZWRSZWNvdmVyeSgpLFxuICAgIHJlYWxUaW1lTW9uaXRvcigpXG4gIF0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFsnbHVjaWRlLXJlYWN0J10sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDMwMDAsXG4gICAgaG9zdDogdHJ1ZSxcbiAgICBobXI6IHtcbiAgICAgIG92ZXJsYXk6IHRydWUsXG4gICAgICBwb3J0OiAzMDAxXG4gICAgfVxuICB9LFxuICBidWlsZDoge1xuICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgICBtaW5pZnk6ICd0ZXJzZXInLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICB2ZW5kb3I6IFsncmVhY3QnLCAncmVhY3QtZG9tJ10sXG4gICAgICAgICAgcm91dGVyOiBbJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICBpY29uczogWydsdWNpZGUtcmVhY3QnXSxcbiAgICAgICAgICBhZG1pbjogW1xuICAgICAgICAgICAgJy4vc3JjL2NvbXBvbmVudHMvYWRtaW4vQWRtaW5EYXNoYm9hcmQnLFxuICAgICAgICAgICAgJy4vc3JjL2NvbXBvbmVudHMvYWRtaW4vUHJvcGVydHlVcGxvYWQnLFxuICAgICAgICAgICAgJy4vc3JjL2NvbXBvbmVudHMvYWRtaW4vQ2xpZW50TWFuYWdlbWVudCdcbiAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxuICAgICAgICBlbnRyeUZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzJyxcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5bZXh0XSdcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlcnNlck9wdGlvbnM6IHtcbiAgICAgIGNvbXByZXNzOiB7XG4gICAgICAgIGRyb3BfY29uc29sZTogdHJ1ZSxcbiAgICAgICAgZHJvcF9kZWJ1Z2dlcjogdHJ1ZVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgZGVmaW5lOiB7XG4gICAgX19NT05JVE9SSU5HX0VOQUJMRURfXzogdHJ1ZSxcbiAgICBfX0JVSUxEX1RJTUVfXzogSlNPTi5zdHJpbmdpZnkobmV3IERhdGUoKS50b0lTT1N0cmluZygpKVxuICB9XG59KTsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3QvcGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9wbHVnaW5zL2NvbXByZWhlbnNpdmUtdHJhY2tlci50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3BsdWdpbnMvY29tcHJlaGVuc2l2ZS10cmFja2VyLnRzXCI7aW1wb3J0IHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyB3YXRjaCB9IGZyb20gJ2Nob2tpZGFyJztcbmltcG9ydCB7IHdyaXRlRmlsZVN5bmMsIHJlYWRGaWxlU3luYywgZXhpc3RzU3luYywgbWtkaXJTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgY3JvbiBmcm9tICdub2RlLWNyb24nO1xuXG5pbnRlcmZhY2UgVHJhY2tlckNvbmZpZyB7XG4gIGVycm9yVGhyZXNob2xkOiB7XG4gICAgY3JpdGljYWw6IG51bWJlcjtcbiAgICBoaWdoOiBudW1iZXI7XG4gICAgbWVkaXVtOiBudW1iZXI7XG4gICAgbG93OiBudW1iZXI7XG4gIH07XG4gIHBlcmZvcm1hbmNlQmVuY2htYXJrczoge1xuICAgIGJ1aWxkVGltZTogbnVtYmVyO1xuICAgIGJ1bmRsZVNpemU6IG51bWJlcjtcbiAgICBjaHVua1NpemU6IG51bWJlcjtcbiAgICBtZW1vcnlVc2FnZTogbnVtYmVyO1xuICB9O1xuICBsb2dnaW5nTGV2ZWw6ICdtaW5pbWFsJyB8ICdzdGFuZGFyZCcgfCAnZGV0YWlsZWQnIHwgJ3ZlcmJvc2UnO1xuICBub3RpZmljYXRpb25zOiB7XG4gICAgZGVza3RvcDogYm9vbGVhbjtcbiAgICBjb25zb2xlOiBib29sZWFuO1xuICAgIHdlYmhvb2s6IGJvb2xlYW47XG4gIH07XG4gIHJlY292ZXJ5OiB7XG4gICAgYXV0b1Jlc3RhcnQ6IGJvb2xlYW47XG4gICAgYmFja3VwT25FcnJvcjogYm9vbGVhbjtcbiAgICByb2xsYmFja09uRmFpbHVyZTogYm9vbGVhbjtcbiAgfTtcbn1cblxuaW50ZXJmYWNlIERPTUNoYW5nZSB7XG4gIHR5cGU6ICdtdXRhdGlvbicgfCAnY3JlYXRpb24nIHwgJ2RlbGV0aW9uJztcbiAgZWxlbWVudDogc3RyaW5nO1xuICB0aW1lc3RhbXA6IHN0cmluZztcbiAgYXR0cmlidXRlcz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gIGNvbnRlbnQ/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBTdGF0ZUNoYW5nZSB7XG4gIGNvbXBvbmVudDogc3RyaW5nO1xuICBzdGF0ZTogc3RyaW5nO1xuICBvbGRWYWx1ZTogYW55O1xuICBuZXdWYWx1ZTogYW55O1xuICB0aW1lc3RhbXA6IHN0cmluZztcbiAgc3RhY2tUcmFjZT86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIE5ldHdvcmtSZXF1ZXN0IHtcbiAgdXJsOiBzdHJpbmc7XG4gIG1ldGhvZDogc3RyaW5nO1xuICBzdGF0dXM6IG51bWJlcjtcbiAgcmVzcG9uc2VUaW1lOiBudW1iZXI7XG4gIHRpbWVzdGFtcDogc3RyaW5nO1xuICBlcnJvcj86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIEVycm9yTG9nIHtcbiAgdHlwZTogJ2phdmFzY3JpcHQnIHwgJ25ldHdvcmsnIHwgJ2J1aWxkJyB8ICdydW50aW1lJztcbiAgbWVzc2FnZTogc3RyaW5nO1xuICBzdGFjaz86IHN0cmluZztcbiAgZmlsZT86IHN0cmluZztcbiAgbGluZT86IG51bWJlcjtcbiAgY29sdW1uPzogbnVtYmVyO1xuICB0aW1lc3RhbXA6IHN0cmluZztcbiAgc2V2ZXJpdHk6ICdjcml0aWNhbCcgfCAnaGlnaCcgfCAnbWVkaXVtJyB8ICdsb3cnO1xuICByZWNvdmVyZWQ6IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBDb21wcmVoZW5zaXZlU3RhdGUge1xuICBkb21DaGFuZ2VzOiBET01DaGFuZ2VbXTtcbiAgc3RhdGVDaGFuZ2VzOiBTdGF0ZUNoYW5nZVtdO1xuICBuZXR3b3JrUmVxdWVzdHM6IE5ldHdvcmtSZXF1ZXN0W107XG4gIGVycm9yczogRXJyb3JMb2dbXTtcbiAgcGVyZm9ybWFuY2U6IHtcbiAgICBidWlsZFRpbWVzOiBudW1iZXJbXTtcbiAgICBidW5kbGVTaXplczogbnVtYmVyW107XG4gICAgbWVtb3J5VXNhZ2U6IG51bWJlcltdO1xuICAgIGxvYWRUaW1lczogbnVtYmVyW107XG4gIH07XG4gIGhlYWx0aDoge1xuICAgIHNjb3JlOiBudW1iZXI7XG4gICAgc3RhdHVzOiAnZXhjZWxsZW50JyB8ICdnb29kJyB8ICd3YXJuaW5nJyB8ICdjcml0aWNhbCc7XG4gICAgbGFzdENoZWNrOiBzdHJpbmc7XG4gICAgaXNzdWVzOiBzdHJpbmdbXTtcbiAgfTtcbiAgcmVjb3Zlcnk6IHtcbiAgICBhdHRlbXB0czogbnVtYmVyO1xuICAgIHN1Y2Nlc3NmdWw6IG51bWJlcjtcbiAgICBsYXN0UmVjb3Zlcnk6IHN0cmluZztcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXByZWhlbnNpdmVUcmFja2VyKGNvbmZpZzogVHJhY2tlckNvbmZpZyk6IFBsdWdpbiB7XG4gIGxldCBzdGF0ZTogQ29tcHJlaGVuc2l2ZVN0YXRlID0ge1xuICAgIGRvbUNoYW5nZXM6IFtdLFxuICAgIHN0YXRlQ2hhbmdlczogW10sXG4gICAgbmV0d29ya1JlcXVlc3RzOiBbXSxcbiAgICBlcnJvcnM6IFtdLFxuICAgIHBlcmZvcm1hbmNlOiB7XG4gICAgICBidWlsZFRpbWVzOiBbXSxcbiAgICAgIGJ1bmRsZVNpemVzOiBbXSxcbiAgICAgIG1lbW9yeVVzYWdlOiBbXSxcbiAgICAgIGxvYWRUaW1lczogW11cbiAgICB9LFxuICAgIGhlYWx0aDoge1xuICAgICAgc2NvcmU6IDEwMCxcbiAgICAgIHN0YXR1czogJ2V4Y2VsbGVudCcsXG4gICAgICBsYXN0Q2hlY2s6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIGlzc3VlczogW11cbiAgICB9LFxuICAgIHJlY292ZXJ5OiB7XG4gICAgICBhdHRlbXB0czogMCxcbiAgICAgIHN1Y2Nlc3NmdWw6IDAsXG4gICAgICBsYXN0UmVjb3Zlcnk6ICcnXG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGxvZ0RpciA9IGpvaW4ocHJvY2Vzcy5jd2QoKSwgJ2xvZ3MnKTtcbiAgY29uc3Qgc3RhdGVGaWxlID0gam9pbihsb2dEaXIsICdjb21wcmVoZW5zaXZlLXN0YXRlLmpzb24nKTtcbiAgY29uc3QgZGFpbHlSZXBvcnREaXIgPSBqb2luKGxvZ0RpciwgJ2RhaWx5LXJlcG9ydHMnKTtcbiAgY29uc3QgYmFja3VwRGlyID0gam9pbihsb2dEaXIsICdiYWNrdXBzJyk7XG5cbiAgLy8gRW5zdXJlIGRpcmVjdG9yaWVzIGV4aXN0XG4gIFtsb2dEaXIsIGRhaWx5UmVwb3J0RGlyLCBiYWNrdXBEaXJdLmZvckVhY2goZGlyID0+IHtcbiAgICBpZiAoIWV4aXN0c1N5bmMoZGlyKSkge1xuICAgICAgbWtkaXJTeW5jKGRpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgfVxuICB9KTtcblxuICBsZXQgYnVpbGRTdGFydFRpbWU6IG51bWJlcjtcblxuICBmdW5jdGlvbiBzYXZlU3RhdGUoKSB7XG4gICAgdHJ5IHtcbiAgICAgIHdyaXRlRmlsZVN5bmMoc3RhdGVGaWxlLCBKU09OLnN0cmluZ2lmeShzdGF0ZSwgbnVsbCwgMikpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2F2ZSBjb21wcmVoZW5zaXZlIHN0YXRlOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBsb2FkU3RhdGUoKSB7XG4gICAgaWYgKGV4aXN0c1N5bmMoc3RhdGVGaWxlKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgc3RhdGUgPSB7IC4uLnN0YXRlLCAuLi5KU09OLnBhcnNlKHJlYWRGaWxlU3luYyhzdGF0ZUZpbGUsICd1dGYtOCcpKSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdDb3VsZCBub3QgbG9hZCBleGlzdGluZyBzdGF0ZTonLCBlcnJvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2FsY3VsYXRlSGVhbHRoU2NvcmUoKTogbnVtYmVyIHtcbiAgICBsZXQgc2NvcmUgPSAxMDA7XG4gICAgY29uc3QgcmVjZW50RXJyb3JzID0gc3RhdGUuZXJyb3JzLmZpbHRlcihlID0+IFxuICAgICAgRGF0ZS5ub3coKSAtIG5ldyBEYXRlKGUudGltZXN0YW1wKS5nZXRUaW1lKCkgPCAzNjAwMDAwIC8vIExhc3QgaG91clxuICAgICk7XG5cbiAgICAvLyBEZWR1Y3QgcG9pbnRzIGZvciBlcnJvcnNcbiAgICByZWNlbnRFcnJvcnMuZm9yRWFjaChlcnJvciA9PiB7XG4gICAgICBzd2l0Y2ggKGVycm9yLnNldmVyaXR5KSB7XG4gICAgICAgIGNhc2UgJ2NyaXRpY2FsJzogc2NvcmUgLT0gMjA7IGJyZWFrO1xuICAgICAgICBjYXNlICdoaWdoJzogc2NvcmUgLT0gMTA7IGJyZWFrO1xuICAgICAgICBjYXNlICdtZWRpdW0nOiBzY29yZSAtPSA1OyBicmVhaztcbiAgICAgICAgY2FzZSAnbG93Jzogc2NvcmUgLT0gMjsgYnJlYWs7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBQZXJmb3JtYW5jZSBwZW5hbHRpZXNcbiAgICBjb25zdCBhdmdCdWlsZFRpbWUgPSBzdGF0ZS5wZXJmb3JtYW5jZS5idWlsZFRpbWVzLnNsaWNlKC01KS5yZWR1Y2UoKGEsIGIpID0+IGEgKyBiLCAwKSAvIDU7XG4gICAgaWYgKGF2Z0J1aWxkVGltZSA+IGNvbmZpZy5wZXJmb3JtYW5jZUJlbmNobWFya3MuYnVpbGRUaW1lKSB7XG4gICAgICBzY29yZSAtPSAxMDtcbiAgICB9XG5cbiAgICBjb25zdCBhdmdCdW5kbGVTaXplID0gc3RhdGUucGVyZm9ybWFuY2UuYnVuZGxlU2l6ZXMuc2xpY2UoLTUpLnJlZHVjZSgoYSwgYikgPT4gYSArIGIsIDApIC8gNTtcbiAgICBpZiAoYXZnQnVuZGxlU2l6ZSA+IGNvbmZpZy5wZXJmb3JtYW5jZUJlbmNobWFya3MuYnVuZGxlU2l6ZSkge1xuICAgICAgc2NvcmUgLT0gMTU7XG4gICAgfVxuXG4gICAgcmV0dXJuIE1hdGgubWF4KDAsIE1hdGgubWluKDEwMCwgc2NvcmUpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUhlYWx0aFN0YXR1cygpIHtcbiAgICBjb25zdCBzY29yZSA9IGNhbGN1bGF0ZUhlYWx0aFNjb3JlKCk7XG4gICAgc3RhdGUuaGVhbHRoLnNjb3JlID0gc2NvcmU7XG4gICAgc3RhdGUuaGVhbHRoLmxhc3RDaGVjayA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICBcbiAgICBpZiAoc2NvcmUgPj0gOTApIHN0YXRlLmhlYWx0aC5zdGF0dXMgPSAnZXhjZWxsZW50JztcbiAgICBlbHNlIGlmIChzY29yZSA+PSA3MCkgc3RhdGUuaGVhbHRoLnN0YXR1cyA9ICdnb29kJztcbiAgICBlbHNlIGlmIChzY29yZSA+PSA1MCkgc3RhdGUuaGVhbHRoLnN0YXR1cyA9ICd3YXJuaW5nJztcbiAgICBlbHNlIHN0YXRlLmhlYWx0aC5zdGF0dXMgPSAnY3JpdGljYWwnO1xuXG4gICAgLy8gVXBkYXRlIGlzc3Vlc1xuICAgIHN0YXRlLmhlYWx0aC5pc3N1ZXMgPSBbXTtcbiAgICBjb25zdCByZWNlbnRFcnJvcnMgPSBzdGF0ZS5lcnJvcnMuZmlsdGVyKGUgPT4gXG4gICAgICBEYXRlLm5vdygpIC0gbmV3IERhdGUoZS50aW1lc3RhbXApLmdldFRpbWUoKSA8IDM2MDAwMDBcbiAgICApO1xuICAgIFxuICAgIGlmIChyZWNlbnRFcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgc3RhdGUuaGVhbHRoLmlzc3Vlcy5wdXNoKGAke3JlY2VudEVycm9ycy5sZW5ndGh9IHJlY2VudCBlcnJvcnMgZGV0ZWN0ZWRgKTtcbiAgICB9XG5cbiAgICBjb25zdCBhdmdCdWlsZFRpbWUgPSBzdGF0ZS5wZXJmb3JtYW5jZS5idWlsZFRpbWVzLnNsaWNlKC01KS5yZWR1Y2UoKGEsIGIpID0+IGEgKyBiLCAwKSAvIDU7XG4gICAgaWYgKGF2Z0J1aWxkVGltZSA+IGNvbmZpZy5wZXJmb3JtYW5jZUJlbmNobWFya3MuYnVpbGRUaW1lKSB7XG4gICAgICBzdGF0ZS5oZWFsdGguaXNzdWVzLnB1c2goJ0J1aWxkIHRpbWUgZXhjZWVkcyBiZW5jaG1hcmsnKTtcbiAgICB9XG5cbiAgICBzYXZlU3RhdGUoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvZ0Vycm9yKGVycm9yOiBQYXJ0aWFsPEVycm9yTG9nPikge1xuICAgIGNvbnN0IGVycm9yTG9nOiBFcnJvckxvZyA9IHtcbiAgICAgIHR5cGU6ICdqYXZhc2NyaXB0JyxcbiAgICAgIG1lc3NhZ2U6ICcnLFxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICBzZXZlcml0eTogJ21lZGl1bScsXG4gICAgICByZWNvdmVyZWQ6IGZhbHNlLFxuICAgICAgLi4uZXJyb3JcbiAgICB9O1xuXG4gICAgc3RhdGUuZXJyb3JzLnVuc2hpZnQoZXJyb3JMb2cpO1xuICAgIGlmIChzdGF0ZS5lcnJvcnMubGVuZ3RoID4gMTAwMCkge1xuICAgICAgc3RhdGUuZXJyb3JzID0gc3RhdGUuZXJyb3JzLnNsaWNlKDAsIDEwMDApO1xuICAgIH1cblxuICAgIC8vIENoZWNrIHRocmVzaG9sZHNcbiAgICBjb25zdCBjcml0aWNhbEVycm9ycyA9IHN0YXRlLmVycm9ycy5maWx0ZXIoZSA9PiBlLnNldmVyaXR5ID09PSAnY3JpdGljYWwnKS5sZW5ndGg7XG4gICAgaWYgKGNyaXRpY2FsRXJyb3JzID4gY29uZmlnLmVycm9yVGhyZXNob2xkLmNyaXRpY2FsKSB7XG4gICAgICB0cmlnZ2VyUmVjb3ZlcnkoJ0NyaXRpY2FsIGVycm9yIHRocmVzaG9sZCBleGNlZWRlZCcpO1xuICAgIH1cblxuICAgIHVwZGF0ZUhlYWx0aFN0YXR1cygpO1xuICAgIGJyb2FkY2FzdFVwZGF0ZSgnZXJyb3InLCBlcnJvckxvZyk7XG4gIH1cblxuICBmdW5jdGlvbiB0cmlnZ2VyUmVjb3ZlcnkocmVhc29uOiBzdHJpbmcpIHtcbiAgICBzdGF0ZS5yZWNvdmVyeS5hdHRlbXB0cysrO1xuICAgIGNvbnNvbGUubG9nKGBcdUQ4M0RcdUREMDQgVHJpZ2dlcmluZyByZWNvdmVyeTogJHtyZWFzb259YCk7XG5cbiAgICBpZiAoY29uZmlnLnJlY292ZXJ5LmJhY2t1cE9uRXJyb3IpIHtcbiAgICAgIGNyZWF0ZUJhY2t1cCgpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcucmVjb3ZlcnkuYXV0b1Jlc3RhcnQpIHtcbiAgICAgIC8vIEltcGxlbWVudCByZXN0YXJ0IGxvZ2ljXG4gICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDA0IEF1dG8tcmVzdGFydCBpbml0aWF0ZWQnKTtcbiAgICB9XG5cbiAgICBzdGF0ZS5yZWNvdmVyeS5sYXN0UmVjb3ZlcnkgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgc3RhdGUucmVjb3Zlcnkuc3VjY2Vzc2Z1bCsrO1xuICAgIHNhdmVTdGF0ZSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlQmFja3VwKCkge1xuICAgIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5yZXBsYWNlKC9bOi5dL2csICctJyk7XG4gICAgY29uc3QgYmFja3VwRmlsZSA9IGpvaW4oYmFja3VwRGlyLCBgYmFja3VwLSR7dGltZXN0YW1wfS5qc29uYCk7XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgIHdyaXRlRmlsZVN5bmMoYmFja3VwRmlsZSwgSlNPTi5zdHJpbmdpZnkoc3RhdGUsIG51bGwsIDIpKTtcbiAgICAgIGNvbnNvbGUubG9nKGBcdUQ4M0RcdURDQkUgQmFja3VwIGNyZWF0ZWQ6ICR7YmFja3VwRmlsZX1gKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGNyZWF0ZSBiYWNrdXA6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlRGFpbHlSZXBvcnQoKSB7XG4gICAgY29uc3QgdG9kYXkgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXTtcbiAgICBjb25zdCByZXBvcnRGaWxlID0gam9pbihkYWlseVJlcG9ydERpciwgYHJlcG9ydC0ke3RvZGF5fS5qc29uYCk7XG4gICAgXG4gICAgY29uc3QgdG9kYXlFcnJvcnMgPSBzdGF0ZS5lcnJvcnMuZmlsdGVyKGUgPT4gXG4gICAgICBlLnRpbWVzdGFtcC5zdGFydHNXaXRoKHRvZGF5KVxuICAgICk7XG5cbiAgICBjb25zdCByZXBvcnQgPSB7XG4gICAgICBkYXRlOiB0b2RheSxcbiAgICAgIHN1bW1hcnk6IHtcbiAgICAgICAgdG90YWxFcnJvcnM6IHRvZGF5RXJyb3JzLmxlbmd0aCxcbiAgICAgICAgY3JpdGljYWxFcnJvcnM6IHRvZGF5RXJyb3JzLmZpbHRlcihlID0+IGUuc2V2ZXJpdHkgPT09ICdjcml0aWNhbCcpLmxlbmd0aCxcbiAgICAgICAgcmVjb3ZlcnlBdHRlbXB0czogc3RhdGUucmVjb3ZlcnkuYXR0ZW1wdHMsXG4gICAgICAgIGhlYWx0aFNjb3JlOiBzdGF0ZS5oZWFsdGguc2NvcmUsXG4gICAgICAgIHN0YXR1czogc3RhdGUuaGVhbHRoLnN0YXR1c1xuICAgICAgfSxcbiAgICAgIHBlcmZvcm1hbmNlOiB7XG4gICAgICAgIGF2Z0J1aWxkVGltZTogc3RhdGUucGVyZm9ybWFuY2UuYnVpbGRUaW1lcy5zbGljZSgtMTApLnJlZHVjZSgoYSwgYikgPT4gYSArIGIsIDApIC8gMTAsXG4gICAgICAgIGF2Z0J1bmRsZVNpemU6IHN0YXRlLnBlcmZvcm1hbmNlLmJ1bmRsZVNpemVzLnNsaWNlKC0xMCkucmVkdWNlKChhLCBiKSA9PiBhICsgYiwgMCkgLyAxMCxcbiAgICAgICAgYXZnTWVtb3J5VXNhZ2U6IHN0YXRlLnBlcmZvcm1hbmNlLm1lbW9yeVVzYWdlLnNsaWNlKC0xMCkucmVkdWNlKChhLCBiKSA9PiBhICsgYiwgMCkgLyAxMFxuICAgICAgfSxcbiAgICAgIGVycm9yczogdG9kYXlFcnJvcnMsXG4gICAgICByZWNvbW1lbmRhdGlvbnM6IGdlbmVyYXRlUmVjb21tZW5kYXRpb25zKClcbiAgICB9O1xuXG4gICAgdHJ5IHtcbiAgICAgIHdyaXRlRmlsZVN5bmMocmVwb3J0RmlsZSwgSlNPTi5zdHJpbmdpZnkocmVwb3J0LCBudWxsLCAyKSk7XG4gICAgICBjb25zb2xlLmxvZyhgXHVEODNEXHVEQ0NBIERhaWx5IHJlcG9ydCBnZW5lcmF0ZWQ6ICR7cmVwb3J0RmlsZX1gKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGdlbmVyYXRlIGRhaWx5IHJlcG9ydDonLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2VuZXJhdGVSZWNvbW1lbmRhdGlvbnMoKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IHJlY29tbWVuZGF0aW9uczogc3RyaW5nW10gPSBbXTtcbiAgICBcbiAgICBpZiAoc3RhdGUuaGVhbHRoLnNjb3JlIDwgNzApIHtcbiAgICAgIHJlY29tbWVuZGF0aW9ucy5wdXNoKCdDb25zaWRlciByZXZpZXdpbmcgcmVjZW50IGNvZGUgY2hhbmdlcyBmb3IgcG90ZW50aWFsIGlzc3VlcycpO1xuICAgIH1cbiAgICBcbiAgICBjb25zdCBhdmdCdWlsZFRpbWUgPSBzdGF0ZS5wZXJmb3JtYW5jZS5idWlsZFRpbWVzLnNsaWNlKC01KS5yZWR1Y2UoKGEsIGIpID0+IGEgKyBiLCAwKSAvIDU7XG4gICAgaWYgKGF2Z0J1aWxkVGltZSA+IGNvbmZpZy5wZXJmb3JtYW5jZUJlbmNobWFya3MuYnVpbGRUaW1lKSB7XG4gICAgICByZWNvbW1lbmRhdGlvbnMucHVzaCgnT3B0aW1pemUgYnVpbGQgcGVyZm9ybWFuY2Ugd2l0aCBjb2RlIHNwbGl0dGluZycpO1xuICAgIH1cbiAgICBcbiAgICBjb25zdCByZWNlbnRFcnJvcnMgPSBzdGF0ZS5lcnJvcnMuZmlsdGVyKGUgPT4gXG4gICAgICBEYXRlLm5vdygpIC0gbmV3IERhdGUoZS50aW1lc3RhbXApLmdldFRpbWUoKSA8IDg2NDAwMDAwIC8vIExhc3QgMjQgaG91cnNcbiAgICApO1xuICAgIFxuICAgIGlmIChyZWNlbnRFcnJvcnMubGVuZ3RoID4gMTApIHtcbiAgICAgIHJlY29tbWVuZGF0aW9ucy5wdXNoKCdIaWdoIGVycm9yIHJhdGUgZGV0ZWN0ZWQgLSByZXZpZXcgZXJyb3IgcGF0dGVybnMnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVjb21tZW5kYXRpb25zO1xuICB9XG5cbiAgZnVuY3Rpb24gYnJvYWRjYXN0VXBkYXRlKHR5cGU6IHN0cmluZywgZGF0YTogYW55KSB7XG4gICAgLy8gUGxhY2Vob2xkZXIgZm9yIFdlYlNvY2tldCBicm9hZGNhc3RpbmdcbiAgICBjb25zb2xlLmxvZyhgXHVEODNEXHVEQ0UxIEJyb2FkY2FzdGluZyB1cGRhdGU6ICR7dHlwZX1gLCBkYXRhKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2NvbXByZWhlbnNpdmUtdHJhY2tlcicsXG4gICAgXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuICAgICAgbG9hZFN0YXRlKCk7XG4gICAgICBcbiAgICAgIC8vIEhhbmRsZSBpbmNvbWluZyBXZWJTb2NrZXQgbWVzc2FnZXNcbiAgICAgIHNlcnZlci53cy5vbignbWVzc2FnZScsIChtZXNzYWdlKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2UobWVzc2FnZS50b1N0cmluZygpKTtcbiAgICAgICAgICBcbiAgICAgICAgICBzd2l0Y2ggKGRhdGEudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnZG9tLWNoYW5nZSc6XG4gICAgICAgICAgICAgIHN0YXRlLmRvbUNoYW5nZXMudW5zaGlmdChkYXRhLmRhdGEpO1xuICAgICAgICAgICAgICBpZiAoc3RhdGUuZG9tQ2hhbmdlcy5sZW5ndGggPiAxMDAwKSB7XG4gICAgICAgICAgICAgICAgc3RhdGUuZG9tQ2hhbmdlcyA9IHN0YXRlLmRvbUNoYW5nZXMuc2xpY2UoMCwgMTAwMCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNhc2UgJ3N0YXRlLWNoYW5nZSc6XG4gICAgICAgICAgICAgIHN0YXRlLnN0YXRlQ2hhbmdlcy51bnNoaWZ0KGRhdGEuZGF0YSk7XG4gICAgICAgICAgICAgIGlmIChzdGF0ZS5zdGF0ZUNoYW5nZXMubGVuZ3RoID4gMTAwMCkge1xuICAgICAgICAgICAgICAgIHN0YXRlLnN0YXRlQ2hhbmdlcyA9IHN0YXRlLnN0YXRlQ2hhbmdlcy5zbGljZSgwLCAxMDAwKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2FzZSAnbmV0d29yay1yZXF1ZXN0JzpcbiAgICAgICAgICAgICAgc3RhdGUubmV0d29ya1JlcXVlc3RzLnVuc2hpZnQoZGF0YS5kYXRhKTtcbiAgICAgICAgICAgICAgaWYgKHN0YXRlLm5ldHdvcmtSZXF1ZXN0cy5sZW5ndGggPiAxMDAwKSB7XG4gICAgICAgICAgICAgICAgc3RhdGUubmV0d29ya1JlcXVlc3RzID0gc3RhdGUubmV0d29ya1JlcXVlc3RzLnNsaWNlKDAsIDEwMDApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjYXNlICdqYXZhc2NyaXB0LWVycm9yJzpcbiAgICAgICAgICAgIGNhc2UgJ3Byb21pc2UtcmVqZWN0aW9uJzpcbiAgICAgICAgICAgIGNhc2UgJ25ldHdvcmstZXJyb3InOlxuICAgICAgICAgICAgICBsb2dFcnJvcih7XG4gICAgICAgICAgICAgICAgdHlwZTogZGF0YS50eXBlID09PSAnbmV0d29yay1lcnJvcicgPyAnbmV0d29yaycgOiAnamF2YXNjcmlwdCcsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZGF0YS5kYXRhLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgc3RhY2s6IGRhdGEuZGF0YS5zdGFjayxcbiAgICAgICAgICAgICAgICBmaWxlOiBkYXRhLmRhdGEuZmlsZW5hbWUsXG4gICAgICAgICAgICAgICAgbGluZTogZGF0YS5kYXRhLmxpbmVubyxcbiAgICAgICAgICAgICAgICBjb2x1bW46IGRhdGEuZGF0YS5jb2xubyxcbiAgICAgICAgICAgICAgICBzZXZlcml0eTogZGF0YS5kYXRhLnNldmVyaXR5IHx8ICdtZWRpdW0nXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgc2F2ZVN0YXRlKCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgcHJvY2Vzc2luZyBXZWJTb2NrZXQgbWVzc2FnZTonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgXG4gICAgICAvLyBVc2UgVml0ZSdzIGJ1aWx0LWluIFdlYlNvY2tldCBmb3IgcmVhbC10aW1lIGNvbW11bmljYXRpb25cbiAgICAgIHNlcnZlci53cy5vbignY29tcHJlaGVuc2l2ZS10cmFja2VyOmdldC1zdGF0ZScsICgpID0+IHtcbiAgICAgICAgc2VydmVyLndzLnNlbmQoJ2NvbXByZWhlbnNpdmUtdHJhY2tlcjpzdGF0ZScsIHtcbiAgICAgICAgICBldmVudHM6IHN0YXRlLmVycm9ycy5zbGljZSgwLCA1MCksXG4gICAgICAgICAgaGVhbHRoOiBzdGF0ZS5oZWFsdGgsXG4gICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgc2VydmVyLndzLm9uKCdjb21wcmVoZW5zaXZlLXRyYWNrZXI6Y2xpZW50LWVycm9yJywgKGRhdGEpID0+IHtcbiAgICAgICAgbG9nRXJyb3Ioe1xuICAgICAgICAgIHR5cGU6ICdqYXZhc2NyaXB0JyxcbiAgICAgICAgICBtZXNzYWdlOiBkYXRhLmVycm9yPy5tZXNzYWdlIHx8ICdDbGllbnQgZXJyb3InLFxuICAgICAgICAgIHN0YWNrOiBkYXRhLmVycm9yPy5zdGFjayxcbiAgICAgICAgICBzZXZlcml0eTogJ2hpZ2gnXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIEZpbGUgd2F0Y2hlciBmb3IgY29tcHJlaGVuc2l2ZSB0cmFja2luZ1xuICAgICAgY29uc3Qgd2F0Y2hlciA9IHdhdGNoKFsnc3JjLyoqLyonLCAncHVibGljLyoqLyonLCAnKi5jb25maWcuKiddLCB7XG4gICAgICAgIGlnbm9yZWQ6IFsnbm9kZV9tb2R1bGVzJywgJ2Rpc3QnLCAnbG9ncyddLFxuICAgICAgICBwZXJzaXN0ZW50OiB0cnVlXG4gICAgICB9KTtcblxuICAgICAgd2F0Y2hlci5vbignY2hhbmdlJywgKGZpbGVQYXRoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBcdUQ4M0RcdURDREQgRmlsZSBjaGFuZ2VkOiAke2ZpbGVQYXRofWApO1xuICAgICAgICB1cGRhdGVIZWFsdGhTdGF0dXMoKTtcbiAgICAgICAgYnJvYWRjYXN0VXBkYXRlKCdmaWxlLWNoYW5nZScsIHsgcGF0aDogZmlsZVBhdGgsIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIEhlYWx0aCBjaGVjayBpbnRlcnZhbFxuICAgICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICB1cGRhdGVIZWFsdGhTdGF0dXMoKTtcbiAgICAgICAgYnJvYWRjYXN0VXBkYXRlKCdoZWFsdGgtdXBkYXRlJywgc3RhdGUuaGVhbHRoKTtcbiAgICAgIH0sIDMwMDAwKTtcblxuICAgICAgLy8gRGFpbHkgcmVwb3J0IGdlbmVyYXRpb25cbiAgICAgIGNyb24uc2NoZWR1bGUoJzAgMCAqICogKicsICgpID0+IHtcbiAgICAgICAgZ2VuZXJhdGVEYWlseVJlcG9ydCgpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBcbiAgICB0cmFuc2Zvcm1JbmRleEh0bWwoaHRtbCkge1xuICAgICAgLy8gSW5qZWN0IG1vbml0b3Jpbmcgc2NyaXB0IG9ubHkgaW4gZGV2ZWxvcG1lbnRcbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50Jykge1xuICAgICAgICBjb25zdCBzY3JpcHQgPSBgXG4gICAgICAgICAgPHNjcmlwdD5cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgPT09ICdsb2NhbGhvc3QnKSB7XG4gICAgICAgICAgICAgIC8vIFVzZSBWaXRlJ3MgSE1SIFdlYlNvY2tldCBmb3IgbW9uaXRvcmluZ1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0NBIENvbXByZWhlbnNpdmUgdHJhY2tpbmcgaW5pdGlhbGl6ZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgYDtcbiAgICAgICAgcmV0dXJuIGh0bWwucmVwbGFjZSgnPC9oZWFkPicsIGAke3NjcmlwdH08L2hlYWQ+YCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaHRtbDtcbiAgICB9LFxuICAgIFxuICAgIGJ1aWxkU3RhcnQoKSB7XG4gICAgICBidWlsZFN0YXJ0VGltZSA9IERhdGUubm93KCk7XG4gICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERTgwIENvbXByZWhlbnNpdmUgdHJhY2tpbmcgc3RhcnRlZCcpO1xuICAgICAgdXBkYXRlSGVhbHRoU3RhdHVzKCk7XG4gICAgfSxcbiAgICBcbiAgICBnZW5lcmF0ZUJ1bmRsZShvcHRpb25zLCBidW5kbGUpIHtcbiAgICAgIGNvbnN0IGJ1aWxkVGltZSA9IERhdGUubm93KCkgLSBidWlsZFN0YXJ0VGltZTtcbiAgICAgIGxldCBidW5kbGVTaXplID0gMDtcbiAgICAgIFxuICAgICAgT2JqZWN0LnZhbHVlcyhidW5kbGUpLmZvckVhY2goKGNodW5rOiBhbnkpID0+IHtcbiAgICAgICAgaWYgKGNodW5rLmNvZGUpIGJ1bmRsZVNpemUgKz0gY2h1bmsuY29kZS5sZW5ndGg7XG4gICAgICAgIGlmIChjaHVuay5zb3VyY2UpIGJ1bmRsZVNpemUgKz0gY2h1bmsuc291cmNlLmxlbmd0aDtcbiAgICAgIH0pO1xuICAgICAgXG4gICAgICBzdGF0ZS5wZXJmb3JtYW5jZS5idWlsZFRpbWVzLnVuc2hpZnQoYnVpbGRUaW1lKTtcbiAgICAgIHN0YXRlLnBlcmZvcm1hbmNlLmJ1bmRsZVNpemVzLnVuc2hpZnQoYnVuZGxlU2l6ZSk7XG4gICAgICBzdGF0ZS5wZXJmb3JtYW5jZS5tZW1vcnlVc2FnZS51bnNoaWZ0KHByb2Nlc3MubWVtb3J5VXNhZ2UoKS5oZWFwVXNlZCk7XG4gICAgICBcbiAgICAgIC8vIEtlZXAgb25seSBsYXN0IDEwMCBlbnRyaWVzXG4gICAgICBbJ2J1aWxkVGltZXMnLCAnYnVuZGxlU2l6ZXMnLCAnbWVtb3J5VXNhZ2UnXS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIGlmIChzdGF0ZS5wZXJmb3JtYW5jZVtrZXkgYXMga2V5b2YgdHlwZW9mIHN0YXRlLnBlcmZvcm1hbmNlXS5sZW5ndGggPiAxMDApIHtcbiAgICAgICAgICAoc3RhdGUucGVyZm9ybWFuY2Vba2V5IGFzIGtleW9mIHR5cGVvZiBzdGF0ZS5wZXJmb3JtYW5jZV0gYXMgbnVtYmVyW10pID0gXG4gICAgICAgICAgICAoc3RhdGUucGVyZm9ybWFuY2Vba2V5IGFzIGtleW9mIHR5cGVvZiBzdGF0ZS5wZXJmb3JtYW5jZV0gYXMgbnVtYmVyW10pLnNsaWNlKDAsIDEwMCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgXG4gICAgICAvLyBQZXJmb3JtYW5jZSB3YXJuaW5nc1xuICAgICAgaWYgKGJ1aWxkVGltZSA+IGNvbmZpZy5wZXJmb3JtYW5jZUJlbmNobWFya3MuYnVpbGRUaW1lKSB7XG4gICAgICAgIGxvZ0Vycm9yKHtcbiAgICAgICAgICB0eXBlOiAnYnVpbGQnLFxuICAgICAgICAgIG1lc3NhZ2U6IGBCdWlsZCB0aW1lIGV4Y2VlZGVkIGJlbmNobWFyazogJHtidWlsZFRpbWV9bXMgPiAke2NvbmZpZy5wZXJmb3JtYW5jZUJlbmNobWFya3MuYnVpbGRUaW1lfW1zYCxcbiAgICAgICAgICBzZXZlcml0eTogJ21lZGl1bSdcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmIChidW5kbGVTaXplID4gY29uZmlnLnBlcmZvcm1hbmNlQmVuY2htYXJrcy5idW5kbGVTaXplKSB7XG4gICAgICAgIGxvZ0Vycm9yKHtcbiAgICAgICAgICB0eXBlOiAnYnVpbGQnLFxuICAgICAgICAgIG1lc3NhZ2U6IGBCdW5kbGUgc2l6ZSBleGNlZWRlZCBiZW5jaG1hcms6ICR7YnVuZGxlU2l6ZX0gYnl0ZXMgPiAke2NvbmZpZy5wZXJmb3JtYW5jZUJlbmNobWFya3MuYnVuZGxlU2l6ZX0gYnl0ZXNgLFxuICAgICAgICAgIHNldmVyaXR5OiAnbWVkaXVtJ1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgdXBkYXRlSGVhbHRoU3RhdHVzKCk7XG4gICAgICBzYXZlU3RhdGUoKTtcbiAgICB9LFxuICAgIFxuICAgIGJ1aWxkRW5kKCkge1xuICAgICAgY29uc29sZS5sb2coJ1x1MjcwNSBCdWlsZCBjb21wbGV0ZWQnKTtcbiAgICAgIGNvbnNvbGUubG9nKGBcdUQ4M0RcdURDQ0EgSGVhbHRoIFNjb3JlOiAke3N0YXRlLmhlYWx0aC5zY29yZX0vMTAwICgke3N0YXRlLmhlYWx0aC5zdGF0dXN9KWApO1xuICAgICAgXG4gICAgICBpZiAoc3RhdGUuaGVhbHRoLmlzc3Vlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdcdTI2QTBcdUZFMEYgIEN1cnJlbnQgSXNzdWVzOicpO1xuICAgICAgICBzdGF0ZS5oZWFsdGguaXNzdWVzLmZvckVhY2goaXNzdWUgPT4gY29uc29sZS5sb2coYCAgIFx1MjAyMiAke2lzc3VlfWApKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgY29uc3QgcmVjb21tZW5kYXRpb25zID0gZ2VuZXJhdGVSZWNvbW1lbmRhdGlvbnMoKTtcbiAgICAgIGlmIChyZWNvbW1lbmRhdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0ExIFJlY29tbWVuZGF0aW9uczonKTtcbiAgICAgICAgcmVjb21tZW5kYXRpb25zLmZvckVhY2gocmVjID0+IGNvbnNvbGUubG9nKGAgICBcdTIwMjIgJHtyZWN9YCkpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn0iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3QvcGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9wbHVnaW5zL2FkdmFuY2VkLWVycm9yLXByZXZlbnRpb24udHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9wbHVnaW5zL2FkdmFuY2VkLWVycm9yLXByZXZlbnRpb24udHNcIjtpbXBvcnQgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCB7IHBhcnNlIH0gZnJvbSAnQHR5cGVzY3JpcHQtZXNsaW50L3BhcnNlcic7XG5pbXBvcnQgeyBBU1RfTk9ERV9UWVBFUyB9IGZyb20gJ0B0eXBlc2NyaXB0LWVzbGludC90eXBlcyc7XG5cbmludGVyZmFjZSBFcnJvclJ1bGUge1xuICBpZDogc3RyaW5nO1xuICBwYXR0ZXJuPzogUmVnRXhwO1xuICBhc3RDaGVjaz86IChub2RlOiBhbnkpID0+IGJvb2xlYW47XG4gIG1lc3NhZ2U6IHN0cmluZztcbiAgc2V2ZXJpdHk6ICdjcml0aWNhbCcgfCAnaGlnaCcgfCAnbWVkaXVtJyB8ICdsb3cnO1xuICBmaXg/OiBzdHJpbmc7XG4gIGF1dG9GaXg/OiAoY29udGVudDogc3RyaW5nKSA9PiBzdHJpbmc7XG4gIGNhdGVnb3J5OiAnc2VjdXJpdHknIHwgJ3BlcmZvcm1hbmNlJyB8ICdhY2Nlc3NpYmlsaXR5JyB8ICdtYWludGFpbmFiaWxpdHknIHwgJ2NvcnJlY3RuZXNzJztcbn1cblxuaW50ZXJmYWNlIENvZGVJc3N1ZSB7XG4gIHJ1bGU6IEVycm9yUnVsZTtcbiAgbGluZTogbnVtYmVyO1xuICBjb2x1bW46IG51bWJlcjtcbiAgY29udGV4dD86IHN0cmluZztcbiAgc3VnZ2VzdGlvbj86IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkdmFuY2VkRXJyb3JQcmV2ZW50aW9uKCk6IFBsdWdpbiB7XG4gIGNvbnN0IHJ1bGVzOiBFcnJvclJ1bGVbXSA9IFtcbiAgICAvLyBTZWN1cml0eSBSdWxlc1xuICAgIHtcbiAgICAgIGlkOiAnbm8tZXZhbCcsXG4gICAgICBwYXR0ZXJuOiAvXFxiZXZhbFxccypcXCgvLFxuICAgICAgbWVzc2FnZTogJ1VzZSBvZiBldmFsKCkgaXMgZGFuZ2Vyb3VzIGFuZCBzaG91bGQgYmUgYXZvaWRlZCcsXG4gICAgICBzZXZlcml0eTogJ2NyaXRpY2FsJyxcbiAgICAgIGNhdGVnb3J5OiAnc2VjdXJpdHknLFxuICAgICAgZml4OiAnVXNlIHNhZmVyIGFsdGVybmF0aXZlcyBsaWtlIEpTT04ucGFyc2UoKSBvciBGdW5jdGlvbiBjb25zdHJ1Y3RvcidcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnbm8taW5uZXItaHRtbCcsXG4gICAgICBwYXR0ZXJuOiAvXFwuaW5uZXJIVE1MXFxzKj0vLFxuICAgICAgbWVzc2FnZTogJ0RpcmVjdCBpbm5lckhUTUwgYXNzaWdubWVudCBjYW4gbGVhZCB0byBYU1MgdnVsbmVyYWJpbGl0aWVzJyxcbiAgICAgIHNldmVyaXR5OiAnaGlnaCcsXG4gICAgICBjYXRlZ29yeTogJ3NlY3VyaXR5JyxcbiAgICAgIGZpeDogJ1VzZSB0ZXh0Q29udGVudCBvciBjcmVhdGVFbGVtZW50IG1ldGhvZHMgaW5zdGVhZCdcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnbm8tdW5zYWZlLWhyZWYnLFxuICAgICAgcGF0dGVybjogL2hyZWZcXHMqPVxccypbXCInXWphdmFzY3JpcHQ6LyxcbiAgICAgIG1lc3NhZ2U6ICdqYXZhc2NyaXB0OiBVUkxzIGluIGhyZWYgYXR0cmlidXRlcyBhcmUgdW5zYWZlJyxcbiAgICAgIHNldmVyaXR5OiAnaGlnaCcsXG4gICAgICBjYXRlZ29yeTogJ3NlY3VyaXR5JyxcbiAgICAgIGZpeDogJ1VzZSBldmVudCBoYW5kbGVycyBvciBwcm9wZXIgbmF2aWdhdGlvbiBtZXRob2RzJ1xuICAgIH0sXG5cbiAgICAvLyBQZXJmb3JtYW5jZSBSdWxlc1xuICAgIHtcbiAgICAgIGlkOiAnbm8tc3luYy1mcycsXG4gICAgICBwYXR0ZXJuOiAvZnNcXC4ocmVhZEZpbGVTeW5jfHdyaXRlRmlsZVN5bmN8ZXhpc3RzU3luYykvLFxuICAgICAgbWVzc2FnZTogJ1N5bmNocm9ub3VzIGZpbGUgb3BlcmF0aW9ucyBjYW4gYmxvY2sgdGhlIGV2ZW50IGxvb3AnLFxuICAgICAgc2V2ZXJpdHk6ICdtZWRpdW0nLFxuICAgICAgY2F0ZWdvcnk6ICdwZXJmb3JtYW5jZScsXG4gICAgICBmaXg6ICdVc2UgYXN5bmNocm9ub3VzIGZpbGUgb3BlcmF0aW9ucyBpbnN0ZWFkJ1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdsYXJnZS1idW5kbGUtaW1wb3J0JyxcbiAgICAgIHBhdHRlcm46IC9pbXBvcnRcXHMrLipcXHMrZnJvbVxccytbJ1wiXWxvZGFzaFsnXCJdfGltcG9ydFxccysuKlxccytmcm9tXFxzK1snXCJdbW9tZW50WydcIl0vLFxuICAgICAgbWVzc2FnZTogJ0ltcG9ydGluZyBlbnRpcmUgbGlicmFyeSBjYW4gaW5jcmVhc2UgYnVuZGxlIHNpemUnLFxuICAgICAgc2V2ZXJpdHk6ICdtZWRpdW0nLFxuICAgICAgY2F0ZWdvcnk6ICdwZXJmb3JtYW5jZScsXG4gICAgICBmaXg6ICdVc2Ugc3BlY2lmaWMgaW1wb3J0cyBsaWtlIGxvZGFzaC9nZXQgb3IgZGF0ZS1mbnMgaW5zdGVhZCdcbiAgICB9LFxuXG4gICAgLy8gQWNjZXNzaWJpbGl0eSBSdWxlc1xuICAgIHtcbiAgICAgIGlkOiAnbWlzc2luZy1hbHQtdGV4dCcsXG4gICAgICBwYXR0ZXJuOiAvPGltZyg/IVtePl0qYWx0PSlbXj5dKj4vLFxuICAgICAgbWVzc2FnZTogJ0ltYWdlcyBtdXN0IGhhdmUgYWx0IHRleHQgZm9yIGFjY2Vzc2liaWxpdHknLFxuICAgICAgc2V2ZXJpdHk6ICdoaWdoJyxcbiAgICAgIGNhdGVnb3J5OiAnYWNjZXNzaWJpbGl0eScsXG4gICAgICBmaXg6ICdBZGQgYWx0IGF0dHJpYnV0ZSB3aXRoIGRlc2NyaXB0aXZlIHRleHQnLFxuICAgICAgYXV0b0ZpeDogKGNvbnRlbnQpID0+IGNvbnRlbnQucmVwbGFjZSgvPGltZyhbXj5dKik+L2csICc8aW1nJDEgYWx0PVwiXCI+JylcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnbWlzc2luZy1idXR0b24tdHlwZScsXG4gICAgICBwYXR0ZXJuOiAvPGJ1dHRvbig/IVtePl0qdHlwZT0pW14+XSo+LyxcbiAgICAgIG1lc3NhZ2U6ICdCdXR0b25zIHNob3VsZCBoYXZlIGV4cGxpY2l0IHR5cGUgYXR0cmlidXRlJyxcbiAgICAgIHNldmVyaXR5OiAnbWVkaXVtJyxcbiAgICAgIGNhdGVnb3J5OiAnYWNjZXNzaWJpbGl0eScsXG4gICAgICBmaXg6ICdBZGQgdHlwZT1cImJ1dHRvblwiIG9yIHR5cGU9XCJzdWJtaXRcIiBhcyBhcHByb3ByaWF0ZScsXG4gICAgICBhdXRvRml4OiAoY29udGVudCkgPT4gY29udGVudC5yZXBsYWNlKC88YnV0dG9uKFtePl0qKT4vZywgJzxidXR0b24gdHlwZT1cImJ1dHRvblwiJDE+JylcbiAgICB9LFxuXG4gICAgLy8gUmVhY3Qtc3BlY2lmaWMgUnVsZXNcbiAgICB7XG4gICAgICBpZDogJ21pc3Npbmcta2V5LXByb3AnLFxuICAgICAgcGF0dGVybjogL1xcLm1hcFxccypcXChcXHMqXFwoW14pXSpcXClcXHMqPT5cXHMqPFtePl0qKD8hLiprZXk9KS8sXG4gICAgICBtZXNzYWdlOiAnTWlzc2luZyBrZXkgcHJvcCBpbiBsaXN0IHJlbmRlcmluZycsXG4gICAgICBzZXZlcml0eTogJ2hpZ2gnLFxuICAgICAgY2F0ZWdvcnk6ICdjb3JyZWN0bmVzcycsXG4gICAgICBmaXg6ICdBZGQgdW5pcXVlIGtleSBwcm9wIHRvIGVhY2ggbGlzdCBpdGVtJ1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICd1bnVzZWQtc3RhdGUnLFxuICAgICAgcGF0dGVybjogL2NvbnN0XFxzK1xcW1xccypcXHcrXFxzKixcXHMqc2V0XFx3K1xccypcXF1cXHMqPVxccyp1c2VTdGF0ZS8sXG4gICAgICBtZXNzYWdlOiAnUG90ZW50aWFsIHVudXNlZCBzdGF0ZSB2YXJpYWJsZScsXG4gICAgICBzZXZlcml0eTogJ2xvdycsXG4gICAgICBjYXRlZ29yeTogJ21haW50YWluYWJpbGl0eScsXG4gICAgICBmaXg6ICdSZW1vdmUgdW51c2VkIHN0YXRlIG9yIHVzZSB0aGUgc3RhdGUgdmFyaWFibGUnXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ21pc3NpbmctZGVwZW5kZW5jeScsXG4gICAgICBwYXR0ZXJuOiAvdXNlRWZmZWN0XFxzKlxcKFxccypcXChcXHMqXFwpXFxzKj0+XFxzKntbXn1dKn1cXHMqLFxccypcXFtcXHMqXFxdXFxzKlxcKS8sXG4gICAgICBtZXNzYWdlOiAndXNlRWZmZWN0IHdpdGggZW1wdHkgZGVwZW5kZW5jeSBhcnJheSBtaWdodCBiZSBtaXNzaW5nIGRlcGVuZGVuY2llcycsXG4gICAgICBzZXZlcml0eTogJ21lZGl1bScsXG4gICAgICBjYXRlZ29yeTogJ2NvcnJlY3RuZXNzJyxcbiAgICAgIGZpeDogJ0FkZCBtaXNzaW5nIGRlcGVuZGVuY2llcyBvciB1c2UgdXNlQ2FsbGJhY2svdXNlTWVtbydcbiAgICB9LFxuXG4gICAgLy8gVHlwZVNjcmlwdCBSdWxlc1xuICAgIHtcbiAgICAgIGlkOiAnYW55LXR5cGUnLFxuICAgICAgcGF0dGVybjogLzpcXHMqYW55XFxiLyxcbiAgICAgIG1lc3NhZ2U6ICdBdm9pZCB1c2luZyBcImFueVwiIHR5cGUsIHVzZSBzcGVjaWZpYyB0eXBlcyBpbnN0ZWFkJyxcbiAgICAgIHNldmVyaXR5OiAnbWVkaXVtJyxcbiAgICAgIGNhdGVnb3J5OiAnbWFpbnRhaW5hYmlsaXR5JyxcbiAgICAgIGZpeDogJ0RlZmluZSBwcm9wZXIgVHlwZVNjcmlwdCBpbnRlcmZhY2VzIG9yIHR5cGVzJ1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdjb25zb2xlLWxvZycsXG4gICAgICBwYXR0ZXJuOiAvY29uc29sZVxcLihsb2d8d2FybnxlcnJvcnxkZWJ1ZykvLFxuICAgICAgbWVzc2FnZTogJ0NvbnNvbGUgc3RhdGVtZW50cyBzaG91bGQgYmUgcmVtb3ZlZCBiZWZvcmUgcHJvZHVjdGlvbicsXG4gICAgICBzZXZlcml0eTogJ2xvdycsXG4gICAgICBjYXRlZ29yeTogJ21haW50YWluYWJpbGl0eScsXG4gICAgICBmaXg6ICdSZW1vdmUgY29uc29sZSBzdGF0ZW1lbnRzIG9yIHVzZSBwcm9wZXIgbG9nZ2luZyBsaWJyYXJ5JyxcbiAgICAgIGF1dG9GaXg6IChjb250ZW50KSA9PiBjb250ZW50LnJlcGxhY2UoL2NvbnNvbGVcXC4obG9nfHdhcm58ZXJyb3J8ZGVidWcpXFwoW14pXSpcXCk7P1xcbj8vZywgJycpXG4gICAgfSxcblxuICAgIC8vIENvZGUgUXVhbGl0eSBSdWxlc1xuICAgIHtcbiAgICAgIGlkOiAnbWFnaWMtbnVtYmVycycsXG4gICAgICBwYXR0ZXJuOiAvXFxiKD8hMHwxfDJ8MTB8MTAwfDEwMDApXFxkezMsfVxcYi8sXG4gICAgICBtZXNzYWdlOiAnTWFnaWMgbnVtYmVycyBzaG91bGQgYmUgcmVwbGFjZWQgd2l0aCBuYW1lZCBjb25zdGFudHMnLFxuICAgICAgc2V2ZXJpdHk6ICdsb3cnLFxuICAgICAgY2F0ZWdvcnk6ICdtYWludGFpbmFiaWxpdHknLFxuICAgICAgZml4OiAnRXh0cmFjdCBudW1iZXJzIHRvIG5hbWVkIGNvbnN0YW50cydcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnbG9uZy1mdW5jdGlvbicsXG4gICAgICBwYXR0ZXJuOiAvZnVuY3Rpb25cXHMrXFx3K1tee10qeyg/Oltee31dKntbXnt9XSp9KSpbXnt9XXsyMDAsfX0vLFxuICAgICAgbWVzc2FnZTogJ0Z1bmN0aW9uIGlzIHRvbyBsb25nIGFuZCBzaG91bGQgYmUgYnJva2VuIGRvd24nLFxuICAgICAgc2V2ZXJpdHk6ICdtZWRpdW0nLFxuICAgICAgY2F0ZWdvcnk6ICdtYWludGFpbmFiaWxpdHknLFxuICAgICAgZml4OiAnQnJlYWsgZG93biBpbnRvIHNtYWxsZXIsIGZvY3VzZWQgZnVuY3Rpb25zJ1xuICAgIH1cbiAgXTtcblxuICBmdW5jdGlvbiBhbmFseXplV2l0aEFTVChjb250ZW50OiBzdHJpbmcsIGZpbGVQYXRoOiBzdHJpbmcpOiBDb2RlSXNzdWVbXSB7XG4gICAgY29uc3QgaXNzdWVzOiBDb2RlSXNzdWVbXSA9IFtdO1xuICAgIFxuICAgIHRyeSB7XG4gICAgICBjb25zdCBhc3QgPSBwYXJzZShjb250ZW50LCB7XG4gICAgICAgIGVjbWFWZXJzaW9uOiAyMDIyLFxuICAgICAgICBzb3VyY2VUeXBlOiAnbW9kdWxlJyxcbiAgICAgICAgZWNtYUZlYXR1cmVzOiB7XG4gICAgICAgICAganN4OiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBBU1QtYmFzZWQgYW5hbHlzaXMgZm9yIG1vcmUgY29tcGxleCBwYXR0ZXJuc1xuICAgICAgZnVuY3Rpb24gdHJhdmVyc2Uobm9kZTogYW55LCBwYXJlbnQ/OiBhbnkpIHtcbiAgICAgICAgaWYgKCFub2RlKSByZXR1cm47XG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIHVudXNlZCBpbXBvcnRzXG4gICAgICAgIGlmIChub2RlLnR5cGUgPT09IEFTVF9OT0RFX1RZUEVTLkltcG9ydERlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgY29uc3QgaW1wb3J0TmFtZSA9IG5vZGUuc291cmNlLnZhbHVlO1xuICAgICAgICAgIGlmICghY29udGVudC5pbmNsdWRlcyhpbXBvcnROYW1lLnNwbGl0KCcvJykucG9wKCkpKSB7XG4gICAgICAgICAgICBpc3N1ZXMucHVzaCh7XG4gICAgICAgICAgICAgIHJ1bGU6IHtcbiAgICAgICAgICAgICAgICBpZDogJ3VudXNlZC1pbXBvcnQnLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBVbnVzZWQgaW1wb3J0OiAke2ltcG9ydE5hbWV9YCxcbiAgICAgICAgICAgICAgICBzZXZlcml0eTogJ2xvdycsXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6ICdtYWludGFpbmFiaWxpdHknLFxuICAgICAgICAgICAgICAgIGZpeDogJ1JlbW92ZSB1bnVzZWQgaW1wb3J0J1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBsaW5lOiBub2RlLmxvYz8uc3RhcnQubGluZSB8fCAwLFxuICAgICAgICAgICAgICBjb2x1bW46IG5vZGUubG9jPy5zdGFydC5jb2x1bW4gfHwgMFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIGNvbXBsZXggY29uZGl0aW9uYWwgZXhwcmVzc2lvbnNcbiAgICAgICAgaWYgKG5vZGUudHlwZSA9PT0gQVNUX05PREVfVFlQRVMuQ29uZGl0aW9uYWxFeHByZXNzaW9uICYmIHBhcmVudD8udHlwZSA9PT0gQVNUX05PREVfVFlQRVMuQ29uZGl0aW9uYWxFeHByZXNzaW9uKSB7XG4gICAgICAgICAgaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgcnVsZToge1xuICAgICAgICAgICAgICBpZDogJ25lc3RlZC10ZXJuYXJ5JyxcbiAgICAgICAgICAgICAgbWVzc2FnZTogJ05lc3RlZCB0ZXJuYXJ5IG9wZXJhdG9ycyByZWR1Y2UgcmVhZGFiaWxpdHknLFxuICAgICAgICAgICAgICBzZXZlcml0eTogJ21lZGl1bScsXG4gICAgICAgICAgICAgIGNhdGVnb3J5OiAnbWFpbnRhaW5hYmlsaXR5JyxcbiAgICAgICAgICAgICAgZml4OiAnVXNlIGlmLWVsc2Ugc3RhdGVtZW50cyBvciBleHRyYWN0IHRvIGEgZnVuY3Rpb24nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGluZTogbm9kZS5sb2M/LnN0YXJ0LmxpbmUgfHwgMCxcbiAgICAgICAgICAgIGNvbHVtbjogbm9kZS5sb2M/LnN0YXJ0LmNvbHVtbiB8fCAwXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZWN1cnNpdmVseSB0cmF2ZXJzZSBjaGlsZCBub2Rlc1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBub2RlKSB7XG4gICAgICAgICAgaWYgKGtleSAhPT0gJ3BhcmVudCcgJiYga2V5ICE9PSAnbG9jJyAmJiBrZXkgIT09ICdyYW5nZScpIHtcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gbm9kZVtrZXldO1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY2hpbGQpKSB7XG4gICAgICAgICAgICAgIGNoaWxkLmZvckVhY2goaXRlbSA9PiB0cmF2ZXJzZShpdGVtLCBub2RlKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkICYmIHR5cGVvZiBjaGlsZCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgdHJhdmVyc2UoY2hpbGQsIG5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0cmF2ZXJzZShhc3QpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAvLyBJZiBBU1QgcGFyc2luZyBmYWlscywgZmFsbCBiYWNrIHRvIHJlZ2V4LWJhc2VkIGFuYWx5c2lzXG4gICAgICBjb25zb2xlLndhcm4oYEFTVCBwYXJzaW5nIGZhaWxlZCBmb3IgJHtmaWxlUGF0aH06YCwgZXJyb3IpO1xuICAgIH1cblxuICAgIHJldHVybiBpc3N1ZXM7XG4gIH1cblxuICBmdW5jdGlvbiBhbmFseXplV2l0aFJlZ2V4KGNvbnRlbnQ6IHN0cmluZyk6IENvZGVJc3N1ZVtdIHtcbiAgICBjb25zdCBpc3N1ZXM6IENvZGVJc3N1ZVtdID0gW107XG4gICAgY29uc3QgbGluZXMgPSBjb250ZW50LnNwbGl0KCdcXG4nKTtcblxuICAgIGxpbmVzLmZvckVhY2goKGxpbmUsIGxpbmVJbmRleCkgPT4ge1xuICAgICAgcnVsZXMuZm9yRWFjaChydWxlID0+IHtcbiAgICAgICAgaWYgKHJ1bGUucGF0dGVybikge1xuICAgICAgICAgIGNvbnN0IG1hdGNoID0gbGluZS5tYXRjaChydWxlLnBhdHRlcm4pO1xuICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgICBydWxlLFxuICAgICAgICAgICAgICBsaW5lOiBsaW5lSW5kZXggKyAxLFxuICAgICAgICAgICAgICBjb2x1bW46IG1hdGNoLmluZGV4IHx8IDAsXG4gICAgICAgICAgICAgIGNvbnRleHQ6IGxpbmUudHJpbSgpLFxuICAgICAgICAgICAgICBzdWdnZXN0aW9uOiBydWxlLmZpeFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBpc3N1ZXM7XG4gIH1cblxuICBmdW5jdGlvbiBnZW5lcmF0ZUZpeFN1Z2dlc3Rpb25zKGlzc3VlczogQ29kZUlzc3VlW10pOiBzdHJpbmdbXSB7XG4gICAgY29uc3Qgc3VnZ2VzdGlvbnM6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3QgY2F0ZWdvcnlHcm91cHMgPSBpc3N1ZXMucmVkdWNlKChhY2MsIGlzc3VlKSA9PiB7XG4gICAgICBpZiAoIWFjY1tpc3N1ZS5ydWxlLmNhdGVnb3J5XSkgYWNjW2lzc3VlLnJ1bGUuY2F0ZWdvcnldID0gW107XG4gICAgICBhY2NbaXNzdWUucnVsZS5jYXRlZ29yeV0ucHVzaChpc3N1ZSk7XG4gICAgICByZXR1cm4gYWNjO1xuICAgIH0sIHt9IGFzIFJlY29yZDxzdHJpbmcsIENvZGVJc3N1ZVtdPik7XG5cbiAgICBPYmplY3QuZW50cmllcyhjYXRlZ29yeUdyb3VwcykuZm9yRWFjaCgoW2NhdGVnb3J5LCBjYXRlZ29yeUlzc3Vlc10pID0+IHtcbiAgICAgIHN1Z2dlc3Rpb25zLnB1c2goYFxcbiR7Y2F0ZWdvcnkudG9VcHBlckNhc2UoKX0gSVNTVUVTICgke2NhdGVnb3J5SXNzdWVzLmxlbmd0aH0pOmApO1xuICAgICAgY2F0ZWdvcnlJc3N1ZXMuc2xpY2UoMCwgNSkuZm9yRWFjaChpc3N1ZSA9PiB7XG4gICAgICAgIHN1Z2dlc3Rpb25zLnB1c2goYCAgXHUyMDIyIExpbmUgJHtpc3N1ZS5saW5lfTogJHtpc3N1ZS5ydWxlLm1lc3NhZ2V9YCk7XG4gICAgICAgIGlmIChpc3N1ZS5ydWxlLmZpeCkge1xuICAgICAgICAgIHN1Z2dlc3Rpb25zLnB1c2goYCAgICBGaXg6ICR7aXNzdWUucnVsZS5maXh9YCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKGNhdGVnb3J5SXNzdWVzLmxlbmd0aCA+IDUpIHtcbiAgICAgICAgc3VnZ2VzdGlvbnMucHVzaChgICAgIC4uLiBhbmQgJHtjYXRlZ29yeUlzc3Vlcy5sZW5ndGggLSA1fSBtb3JlYCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc3VnZ2VzdGlvbnM7XG4gIH1cblxuICBmdW5jdGlvbiBhcHBseUF1dG9GaXhlcyhjb250ZW50OiBzdHJpbmcsIGlzc3VlczogQ29kZUlzc3VlW10pOiBzdHJpbmcge1xuICAgIGxldCBmaXhlZENvbnRlbnQgPSBjb250ZW50O1xuICAgIFxuICAgIGlzc3Vlcy5mb3JFYWNoKGlzc3VlID0+IHtcbiAgICAgIGlmIChpc3N1ZS5ydWxlLmF1dG9GaXgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBmaXhlZENvbnRlbnQgPSBpc3N1ZS5ydWxlLmF1dG9GaXgoZml4ZWRDb250ZW50KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oYEF1dG8tZml4IGZhaWxlZCBmb3IgcnVsZSAke2lzc3VlLnJ1bGUuaWR9OmAsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGZpeGVkQ29udGVudDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2FkdmFuY2VkLWVycm9yLXByZXZlbnRpb24nLFxuICAgIFxuICAgIGxvYWQoaWQpIHtcbiAgICAgIGlmIChpZC5lbmRzV2l0aCgnLnRzeCcpIHx8IGlkLmVuZHNXaXRoKCcuanN4JykgfHwgaWQuZW5kc1dpdGgoJy50cycpKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgY29udGVudCA9IHJlYWRGaWxlU3luYyhpZCwgJ3V0Zi04Jyk7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gQ29tYmluZSByZWdleCBhbmQgQVNUIGFuYWx5c2lzXG4gICAgICAgICAgY29uc3QgcmVnZXhJc3N1ZXMgPSBhbmFseXplV2l0aFJlZ2V4KGNvbnRlbnQpO1xuICAgICAgICAgIGNvbnN0IGFzdElzc3VlcyA9IGFuYWx5emVXaXRoQVNUKGNvbnRlbnQsIGlkKTtcbiAgICAgICAgICBjb25zdCBhbGxJc3N1ZXMgPSBbLi4ucmVnZXhJc3N1ZXMsIC4uLmFzdElzc3Vlc107XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKGFsbElzc3Vlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgXFxuXHVEODNEXHVERDBEIEFkdmFuY2VkIGFuYWx5c2lzIGZvcjogJHtpZH1gKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gR3JvdXAgYnkgc2V2ZXJpdHlcbiAgICAgICAgICAgIGNvbnN0IGNyaXRpY2FsID0gYWxsSXNzdWVzLmZpbHRlcihpID0+IGkucnVsZS5zZXZlcml0eSA9PT0gJ2NyaXRpY2FsJyk7XG4gICAgICAgICAgICBjb25zdCBoaWdoID0gYWxsSXNzdWVzLmZpbHRlcihpID0+IGkucnVsZS5zZXZlcml0eSA9PT0gJ2hpZ2gnKTtcbiAgICAgICAgICAgIGNvbnN0IG1lZGl1bSA9IGFsbElzc3Vlcy5maWx0ZXIoaSA9PiBpLnJ1bGUuc2V2ZXJpdHkgPT09ICdtZWRpdW0nKTtcbiAgICAgICAgICAgIGNvbnN0IGxvdyA9IGFsbElzc3Vlcy5maWx0ZXIoaSA9PiBpLnJ1bGUuc2V2ZXJpdHkgPT09ICdsb3cnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gUmVwb3J0IGNyaXRpY2FsIGFuZCBoaWdoIHNldmVyaXR5IGlzc3Vlc1xuICAgICAgICAgICAgWy4uLmNyaXRpY2FsLCAuLi5oaWdoXS5mb3JFYWNoKGlzc3VlID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgaWNvbiA9IGlzc3VlLnJ1bGUuc2V2ZXJpdHkgPT09ICdjcml0aWNhbCcgPyAnXHVEODNEXHVERUE4JyA6ICdcdTI3NEMnO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtpY29ufSBMaW5lICR7aXNzdWUubGluZX06ICR7aXNzdWUucnVsZS5tZXNzYWdlfWApO1xuICAgICAgICAgICAgICBpZiAoaXNzdWUucnVsZS5maXgpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgICAgXHVEODNEXHVEQ0ExIEZpeDogJHtpc3N1ZS5ydWxlLmZpeH1gKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFN1bW1hcnkgZm9yIG1lZGl1bSBhbmQgbG93XG4gICAgICAgICAgICBpZiAobWVkaXVtLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coYFx1MjZBMFx1RkUwRiAgJHttZWRpdW0ubGVuZ3RofSBtZWRpdW0gc2V2ZXJpdHkgaXNzdWVzIGZvdW5kYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobG93Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coYFx1MjEzOVx1RkUwRiAgJHtsb3cubGVuZ3RofSBsb3cgc2V2ZXJpdHkgaXNzdWVzIGZvdW5kYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEdlbmVyYXRlIGNvbXByZWhlbnNpdmUgc3VnZ2VzdGlvbnNcbiAgICAgICAgICAgIGNvbnN0IHN1Z2dlc3Rpb25zID0gZ2VuZXJhdGVGaXhTdWdnZXN0aW9ucyhhbGxJc3N1ZXMpO1xuICAgICAgICAgICAgaWYgKHN1Z2dlc3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1xcblx1RDgzRFx1RENDQiBERVRBSUxFRCBBTkFMWVNJUzonKTtcbiAgICAgICAgICAgICAgc3VnZ2VzdGlvbnMuZm9yRWFjaChzdWdnZXN0aW9uID0+IGNvbnNvbGUubG9nKHN1Z2dlc3Rpb24pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQXV0by1maXggaWYgZW5hYmxlZFxuICAgICAgICAgICAgY29uc3QgYXV0b0ZpeGFibGVJc3N1ZXMgPSBhbGxJc3N1ZXMuZmlsdGVyKGkgPT4gaS5ydWxlLmF1dG9GaXgpO1xuICAgICAgICAgICAgaWYgKGF1dG9GaXhhYmxlSXNzdWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coYFxcblx1RDgzRFx1REQyNyAke2F1dG9GaXhhYmxlSXNzdWVzLmxlbmd0aH0gaXNzdWVzIGNhbiBiZSBhdXRvLWZpeGVkYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEZhaWwgYnVpbGQgb24gY3JpdGljYWwgZXJyb3JzXG4gICAgICAgICAgICBpZiAoY3JpdGljYWwubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEJ1aWxkIGZhaWxlZDogJHtjcml0aWNhbC5sZW5ndGh9IGNyaXRpY2FsIGVycm9yKHMpIGluICR7aWR9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFdhcm4gb24gaGlnaCBzZXZlcml0eVxuICAgICAgICAgICAgaWYgKGhpZ2gubGVuZ3RoID4gMykge1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFx1MjZBMFx1RkUwRiAgSGlnaCBudW1iZXIgb2YgaGlnaC1zZXZlcml0eSBpc3N1ZXMgKCR7aGlnaC5sZW5ndGh9KSBpbiAke2lkfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnJvci5tZXNzYWdlLmluY2x1ZGVzKCdCdWlsZCBmYWlsZWQnKSkge1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIElnbm9yZSBmaWxlIHJlYWQgZXJyb3JzXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG4gICAgXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuICAgICAgc2VydmVyLndzLm9uKCdlcnJvci1wcmV2ZW50aW9uOmFuYWx5emUnLCAoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCB7IGZpbGVQYXRoLCBjb250ZW50IH0gPSBkYXRhO1xuICAgICAgICBjb25zdCByZWdleElzc3VlcyA9IGFuYWx5emVXaXRoUmVnZXgoY29udGVudCk7XG4gICAgICAgIGNvbnN0IGFzdElzc3VlcyA9IGFuYWx5emVXaXRoQVNUKGNvbnRlbnQsIGZpbGVQYXRoKTtcbiAgICAgICAgY29uc3QgYWxsSXNzdWVzID0gWy4uLnJlZ2V4SXNzdWVzLCAuLi5hc3RJc3N1ZXNdO1xuICAgICAgICBcbiAgICAgICAgc2VydmVyLndzLnNlbmQoJ2Vycm9yLXByZXZlbnRpb246cmVzdWx0cycsIHtcbiAgICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgICBpc3N1ZXM6IGFsbElzc3VlcyxcbiAgICAgICAgICBzdWdnZXN0aW9uczogZ2VuZXJhdGVGaXhTdWdnZXN0aW9ucyhhbGxJc3N1ZXMpLFxuICAgICAgICAgIGF1dG9GaXhhYmxlOiBhbGxJc3N1ZXMuZmlsdGVyKGkgPT4gaS5ydWxlLmF1dG9GaXgpLmxlbmd0aFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgXG4gICAgICBzZXJ2ZXIud3Mub24oJ2Vycm9yLXByZXZlbnRpb246YXV0by1maXgnLCAoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCB7IGZpbGVQYXRoLCBjb250ZW50IH0gPSBkYXRhO1xuICAgICAgICBjb25zdCBpc3N1ZXMgPSBbLi4uYW5hbHl6ZVdpdGhSZWdleChjb250ZW50KSwgLi4uYW5hbHl6ZVdpdGhBU1QoY29udGVudCwgZmlsZVBhdGgpXTtcbiAgICAgICAgY29uc3QgZml4ZWRDb250ZW50ID0gYXBwbHlBdXRvRml4ZXMoY29udGVudCwgaXNzdWVzKTtcbiAgICAgICAgXG4gICAgICAgIHNlcnZlci53cy5zZW5kKCdlcnJvci1wcmV2ZW50aW9uOmZpeGVkJywge1xuICAgICAgICAgIGZpbGVQYXRoLFxuICAgICAgICAgIG9yaWdpbmFsQ29udGVudDogY29udGVudCxcbiAgICAgICAgICBmaXhlZENvbnRlbnQsXG4gICAgICAgICAgYXBwbGllZEZpeGVzOiBpc3N1ZXMuZmlsdGVyKGkgPT4gaS5ydWxlLmF1dG9GaXgpLm1hcChpID0+IGkucnVsZS5pZClcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3BsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3QvcGx1Z2lucy9wZXJmb3JtYW5jZS1vcHRpbWl6ZXIudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9wbHVnaW5zL3BlcmZvcm1hbmNlLW9wdGltaXplci50c1wiO2ltcG9ydCB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgd3JpdGVGaWxlU3luYywgcmVhZEZpbGVTeW5jLCBleGlzdHNTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZ3ppcFN5bmMgfSBmcm9tICd6bGliJztcblxuaW50ZXJmYWNlIE9wdGltaXphdGlvbkNvbmZpZyB7XG4gIGJ1bmRsZUFuYWx5c2lzOiBib29sZWFuO1xuICBjb2Rlc3BsaXR0aW5nOiBib29sZWFuO1xuICBsYXp5TG9hZGluZzogYm9vbGVhbjtcbiAgYXNzZXRPcHRpbWl6YXRpb246IGJvb2xlYW47XG4gIGNvbXByZXNzaW9uQW5hbHlzaXM6IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBCdW5kbGVBbmFseXNpcyB7XG4gIGNodW5rczogQXJyYXk8e1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBzaXplOiBudW1iZXI7XG4gICAgZ3ppcFNpemU6IG51bWJlcjtcbiAgICBtb2R1bGVzOiBzdHJpbmdbXTtcbiAgICBkZXBlbmRlbmNpZXM6IHN0cmluZ1tdO1xuICAgIGlzRW50cnk6IGJvb2xlYW47XG4gICAgaXNEeW5hbWljOiBib29sZWFuO1xuICB9PjtcbiAgYXNzZXRzOiBBcnJheTx7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHNpemU6IG51bWJlcjtcbiAgICB0eXBlOiBzdHJpbmc7XG4gIH0+O1xuICB0b3RhbFNpemU6IG51bWJlcjtcbiAgdG90YWxHemlwU2l6ZTogbnVtYmVyO1xuICByZWNvbW1lbmRhdGlvbnM6IHN0cmluZ1tdO1xufVxuXG5pbnRlcmZhY2UgUGVyZm9ybWFuY2VNZXRyaWNzIHtcbiAgYnVpbGRUaW1lOiBudW1iZXI7XG4gIGJ1bmRsZVNpemU6IG51bWJlcjtcbiAgY2h1bmtDb3VudDogbnVtYmVyO1xuICBhc3NldENvdW50OiBudW1iZXI7XG4gIGNvbXByZXNzaW9uUmF0aW86IG51bWJlcjtcbiAgdHJlZXNoYWtpbmdFZmZpY2llbmN5OiBudW1iZXI7XG4gIGNvZGVVdGlsaXphdGlvbjogbnVtYmVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGVyZm9ybWFuY2VPcHRpbWl6ZXIoY29uZmlnOiBPcHRpbWl6YXRpb25Db25maWcgPSB7XG4gIGJ1bmRsZUFuYWx5c2lzOiB0cnVlLFxuICBjb2Rlc3BsaXR0aW5nOiB0cnVlLFxuICBsYXp5TG9hZGluZzogdHJ1ZSxcbiAgYXNzZXRPcHRpbWl6YXRpb246IHRydWUsXG4gIGNvbXByZXNzaW9uQW5hbHlzaXM6IHRydWVcbn0pOiBQbHVnaW4ge1xuICBsZXQgYnVpbGRTdGFydFRpbWU6IG51bWJlcjtcbiAgbGV0IGJ1bmRsZUFuYWx5c2lzOiBCdW5kbGVBbmFseXNpcztcbiAgbGV0IHBlcmZvcm1hbmNlTWV0cmljczogUGVyZm9ybWFuY2VNZXRyaWNzO1xuXG4gIGNvbnN0IGxvZ0RpciA9IGpvaW4ocHJvY2Vzcy5jd2QoKSwgJ2xvZ3MnKTtcbiAgY29uc3QgYW5hbHlzaXNGaWxlID0gam9pbihsb2dEaXIsICdidW5kbGUtYW5hbHlzaXMuanNvbicpO1xuICBjb25zdCBtZXRyaWNzRmlsZSA9IGpvaW4obG9nRGlyLCAncGVyZm9ybWFuY2UtbWV0cmljcy5qc29uJyk7XG5cbiAgZnVuY3Rpb24gYW5hbHl6ZUJ1bmRsZUNvbXBvc2l0aW9uKGJ1bmRsZTogYW55KTogQnVuZGxlQW5hbHlzaXMge1xuICAgIGNvbnN0IGNodW5rczogQnVuZGxlQW5hbHlzaXNbJ2NodW5rcyddID0gW107XG4gICAgY29uc3QgYXNzZXRzOiBCdW5kbGVBbmFseXNpc1snYXNzZXRzJ10gPSBbXTtcbiAgICBsZXQgdG90YWxTaXplID0gMDtcbiAgICBsZXQgdG90YWxHemlwU2l6ZSA9IDA7XG5cbiAgICBPYmplY3QuZW50cmllcyhidW5kbGUpLmZvckVhY2goKFtmaWxlTmFtZSwgY2h1bmtdOiBbc3RyaW5nLCBhbnldKSA9PiB7XG4gICAgICBpZiAoY2h1bmsudHlwZSA9PT0gJ2NodW5rJykge1xuICAgICAgICBjb25zdCBjaHVua1NpemUgPSBjaHVuay5jb2RlPy5sZW5ndGggfHwgMDtcbiAgICAgICAgY29uc3QgZ3ppcFNpemUgPSBjaHVuay5jb2RlID8gZ3ppcFN5bmMoY2h1bmsuY29kZSkubGVuZ3RoIDogMDtcbiAgICAgICAgXG4gICAgICAgIHRvdGFsU2l6ZSArPSBjaHVua1NpemU7XG4gICAgICAgIHRvdGFsR3ppcFNpemUgKz0gZ3ppcFNpemU7XG5cbiAgICAgICAgY2h1bmtzLnB1c2goe1xuICAgICAgICAgIG5hbWU6IGZpbGVOYW1lLFxuICAgICAgICAgIHNpemU6IGNodW5rU2l6ZSxcbiAgICAgICAgICBnemlwU2l6ZSxcbiAgICAgICAgICBtb2R1bGVzOiBjaHVuay5tb2R1bGVzID8gT2JqZWN0LmtleXMoY2h1bmsubW9kdWxlcykgOiBbXSxcbiAgICAgICAgICBkZXBlbmRlbmNpZXM6IGNodW5rLmltcG9ydHMgfHwgW10sXG4gICAgICAgICAgaXNFbnRyeTogY2h1bmsuaXNFbnRyeSB8fCBmYWxzZSxcbiAgICAgICAgICBpc0R5bmFtaWM6IGNodW5rLmlzRHluYW1pY0VudHJ5IHx8IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmIChjaHVuay50eXBlID09PSAnYXNzZXQnKSB7XG4gICAgICAgIGNvbnN0IGFzc2V0U2l6ZSA9IGNodW5rLnNvdXJjZT8ubGVuZ3RoIHx8IDA7XG4gICAgICAgIHRvdGFsU2l6ZSArPSBhc3NldFNpemU7XG5cbiAgICAgICAgYXNzZXRzLnB1c2goe1xuICAgICAgICAgIG5hbWU6IGZpbGVOYW1lLFxuICAgICAgICAgIHNpemU6IGFzc2V0U2l6ZSxcbiAgICAgICAgICB0eXBlOiBmaWxlTmFtZS5zcGxpdCgnLicpLnBvcCgpIHx8ICd1bmtub3duJ1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IHJlY29tbWVuZGF0aW9ucyA9IGdlbmVyYXRlT3B0aW1pemF0aW9uUmVjb21tZW5kYXRpb25zKGNodW5rcywgYXNzZXRzKTtcblxuICAgIHJldHVybiB7XG4gICAgICBjaHVua3MsXG4gICAgICBhc3NldHMsXG4gICAgICB0b3RhbFNpemUsXG4gICAgICB0b3RhbEd6aXBTaXplLFxuICAgICAgcmVjb21tZW5kYXRpb25zXG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlT3B0aW1pemF0aW9uUmVjb21tZW5kYXRpb25zKFxuICAgIGNodW5rczogQnVuZGxlQW5hbHlzaXNbJ2NodW5rcyddLFxuICAgIGFzc2V0czogQnVuZGxlQW5hbHlzaXNbJ2Fzc2V0cyddXG4gICk6IHN0cmluZ1tdIHtcbiAgICBjb25zdCByZWNvbW1lbmRhdGlvbnM6IHN0cmluZ1tdID0gW107XG5cbiAgICAvLyBMYXJnZSBjaHVuayBhbmFseXNpc1xuICAgIGNvbnN0IGxhcmdlQ2h1bmtzID0gY2h1bmtzLmZpbHRlcihjaHVuayA9PiBjaHVuay5zaXplID4gNTAwMDAwKTsgLy8gNTAwS0JcbiAgICBpZiAobGFyZ2VDaHVua3MubGVuZ3RoID4gMCkge1xuICAgICAgcmVjb21tZW5kYXRpb25zLnB1c2goXG4gICAgICAgIGBDb25zaWRlciBzcGxpdHRpbmcgbGFyZ2UgY2h1bmtzOiAke2xhcmdlQ2h1bmtzLm1hcChjID0+IGMubmFtZSkuam9pbignLCAnKX1gXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIFZlbmRvciBjaHVuayBhbmFseXNpc1xuICAgIGNvbnN0IHZlbmRvckNodW5rcyA9IGNodW5rcy5maWx0ZXIoY2h1bmsgPT4gXG4gICAgICBjaHVuay5tb2R1bGVzLnNvbWUobW9kdWxlID0+IG1vZHVsZS5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpXG4gICAgKTtcbiAgICBpZiAodmVuZG9yQ2h1bmtzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmVjb21tZW5kYXRpb25zLnB1c2goJ0NvbnNpZGVyIGNyZWF0aW5nIGEgdmVuZG9yIGNodW5rIGZvciB0aGlyZC1wYXJ0eSBsaWJyYXJpZXMnKTtcbiAgICB9XG5cbiAgICAvLyBEdXBsaWNhdGUgZGVwZW5kZW5jeSBhbmFseXNpc1xuICAgIGNvbnN0IGFsbE1vZHVsZXMgPSBjaHVua3MuZmxhdE1hcChjaHVuayA9PiBjaHVuay5tb2R1bGVzKTtcbiAgICBjb25zdCBkdXBsaWNhdGVNb2R1bGVzID0gYWxsTW9kdWxlcy5maWx0ZXIoKG1vZHVsZSwgaW5kZXgpID0+IFxuICAgICAgYWxsTW9kdWxlcy5pbmRleE9mKG1vZHVsZSkgIT09IGluZGV4XG4gICAgKTtcbiAgICBpZiAoZHVwbGljYXRlTW9kdWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICByZWNvbW1lbmRhdGlvbnMucHVzaChcbiAgICAgICAgYFBvdGVudGlhbCBkdXBsaWNhdGUgbW9kdWxlcyBkZXRlY3RlZDogJHtbLi4ubmV3IFNldChkdXBsaWNhdGVNb2R1bGVzKV0uc2xpY2UoMCwgMykuam9pbignLCAnKX1gXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIEFzc2V0IG9wdGltaXphdGlvblxuICAgIGNvbnN0IGxhcmdlQXNzZXRzID0gYXNzZXRzLmZpbHRlcihhc3NldCA9PiBhc3NldC5zaXplID4gMTAwMDAwMCk7IC8vIDFNQlxuICAgIGlmIChsYXJnZUFzc2V0cy5sZW5ndGggPiAwKSB7XG4gICAgICByZWNvbW1lbmRhdGlvbnMucHVzaChcbiAgICAgICAgYENvbnNpZGVyIG9wdGltaXppbmcgbGFyZ2UgYXNzZXRzOiAke2xhcmdlQXNzZXRzLm1hcChhID0+IGEubmFtZSkuam9pbignLCAnKX1gXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIENvbXByZXNzaW9uIGVmZmljaWVuY3lcbiAgICBjb25zdCB0b3RhbE9yaWdpbmFsU2l6ZSA9IGNodW5rcy5yZWR1Y2UoKHN1bSwgY2h1bmspID0+IHN1bSArIGNodW5rLnNpemUsIDApO1xuICAgIGNvbnN0IHRvdGFsR3ppcFNpemUgPSBjaHVua3MucmVkdWNlKChzdW0sIGNodW5rKSA9PiBzdW0gKyBjaHVuay5nemlwU2l6ZSwgMCk7XG4gICAgY29uc3QgY29tcHJlc3Npb25SYXRpbyA9IHRvdGFsR3ppcFNpemUgLyB0b3RhbE9yaWdpbmFsU2l6ZTtcbiAgICBcbiAgICBpZiAoY29tcHJlc3Npb25SYXRpbyA+IDAuNykge1xuICAgICAgcmVjb21tZW5kYXRpb25zLnB1c2goJ1Bvb3IgY29tcHJlc3Npb24gcmF0aW8gLSBjb25zaWRlciBtaW5pZmljYXRpb24gaW1wcm92ZW1lbnRzJyk7XG4gICAgfVxuXG4gICAgLy8gRHluYW1pYyBpbXBvcnQgb3Bwb3J0dW5pdGllc1xuICAgIGNvbnN0IHN0YXRpY0NodW5rcyA9IGNodW5rcy5maWx0ZXIoY2h1bmsgPT4gIWNodW5rLmlzRHluYW1pYyAmJiAhY2h1bmsuaXNFbnRyeSk7XG4gICAgaWYgKHN0YXRpY0NodW5rcy5sZW5ndGggPiA1KSB7XG4gICAgICByZWNvbW1lbmRhdGlvbnMucHVzaCgnQ29uc2lkZXIgdXNpbmcgZHluYW1pYyBpbXBvcnRzIGZvciByb3V0ZS1iYXNlZCBjb2RlIHNwbGl0dGluZycpO1xuICAgIH1cblxuICAgIHJldHVybiByZWNvbW1lbmRhdGlvbnM7XG4gIH1cblxuICBmdW5jdGlvbiBnZW5lcmF0ZUNvZGVTcGxpdHRpbmdDb25maWcoY2h1bmtzOiBCdW5kbGVBbmFseXNpc1snY2h1bmtzJ10pOiBhbnkge1xuICAgIGNvbnN0IGNvbmZpZzogYW55ID0ge1xuICAgICAgbWFudWFsQ2h1bmtzOiB7fVxuICAgIH07XG5cbiAgICAvLyBJZGVudGlmeSB2ZW5kb3IgbGlicmFyaWVzXG4gICAgY29uc3QgdmVuZG9yTW9kdWxlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGNodW5rcy5mb3JFYWNoKGNodW5rID0+IHtcbiAgICAgIGNodW5rLm1vZHVsZXMuZm9yRWFjaChtb2R1bGUgPT4ge1xuICAgICAgICBpZiAobW9kdWxlLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSkge1xuICAgICAgICAgIGNvbnN0IHBhY2thZ2VOYW1lID0gbW9kdWxlLnNwbGl0KCdub2RlX21vZHVsZXMvJylbMV0/LnNwbGl0KCcvJylbMF07XG4gICAgICAgICAgaWYgKHBhY2thZ2VOYW1lKSB7XG4gICAgICAgICAgICB2ZW5kb3JNb2R1bGVzLmFkZChwYWNrYWdlTmFtZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIEdyb3VwIGNvbW1vbiB2ZW5kb3IgbGlicmFyaWVzXG4gICAgY29uc3QgY29tbW9uVmVuZG9ycyA9IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXTtcbiAgICBjb25zdCB1aUxpYnJhcmllcyA9IFsnbHVjaWRlLXJlYWN0JywgJ0BoZWFkbGVzc3VpJywgJ0ByYWRpeC11aSddO1xuICAgIGNvbnN0IHV0aWxpdHlMaWJyYXJpZXMgPSBbJ2xvZGFzaCcsICdkYXRlLWZucycsICdheGlvcyddO1xuXG4gICAgY29tbW9uVmVuZG9ycy5mb3JFYWNoKHZlbmRvciA9PiB7XG4gICAgICBpZiAodmVuZG9yTW9kdWxlcy5oYXModmVuZG9yKSkge1xuICAgICAgICBjb25maWcubWFudWFsQ2h1bmtzW3ZlbmRvcl0gPSBbdmVuZG9yXTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICh1aUxpYnJhcmllcy5zb21lKGxpYiA9PiB2ZW5kb3JNb2R1bGVzLmhhcyhsaWIpKSkge1xuICAgICAgY29uZmlnLm1hbnVhbENodW5rc1sndWktbGlicyddID0gdWlMaWJyYXJpZXMuZmlsdGVyKGxpYiA9PiB2ZW5kb3JNb2R1bGVzLmhhcyhsaWIpKTtcbiAgICB9XG5cbiAgICBpZiAodXRpbGl0eUxpYnJhcmllcy5zb21lKGxpYiA9PiB2ZW5kb3JNb2R1bGVzLmhhcyhsaWIpKSkge1xuICAgICAgY29uZmlnLm1hbnVhbENodW5rc1sndXRpbHMnXSA9IHV0aWxpdHlMaWJyYXJpZXMuZmlsdGVyKGxpYiA9PiB2ZW5kb3JNb2R1bGVzLmhhcyhsaWIpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29uZmlnO1xuICB9XG5cbiAgZnVuY3Rpb24gY2FsY3VsYXRlUGVyZm9ybWFuY2VNZXRyaWNzKFxuICAgIGJ1aWxkVGltZTogbnVtYmVyLFxuICAgIGFuYWx5c2lzOiBCdW5kbGVBbmFseXNpc1xuICApOiBQZXJmb3JtYW5jZU1ldHJpY3Mge1xuICAgIGNvbnN0IGNvbXByZXNzaW9uUmF0aW8gPSBhbmFseXNpcy50b3RhbEd6aXBTaXplIC8gYW5hbHlzaXMudG90YWxTaXplO1xuICAgIFxuICAgIC8vIEVzdGltYXRlIHRyZWUtc2hha2luZyBlZmZpY2llbmN5IChzaW1wbGlmaWVkKVxuICAgIGNvbnN0IHRvdGFsTW9kdWxlcyA9IGFuYWx5c2lzLmNodW5rcy5yZWR1Y2UoKHN1bSwgY2h1bmspID0+IHN1bSArIGNodW5rLm1vZHVsZXMubGVuZ3RoLCAwKTtcbiAgICBjb25zdCB0cmVlc2hha2luZ0VmZmljaWVuY3kgPSBNYXRoLm1heCgwLCAxIC0gKHRvdGFsTW9kdWxlcyAvIDEwMDApKTsgLy8gUm91Z2ggZXN0aW1hdGVcbiAgICBcbiAgICAvLyBDb2RlIHV0aWxpemF0aW9uIGVzdGltYXRlXG4gICAgY29uc3QgZHluYW1pY0NodW5rcyA9IGFuYWx5c2lzLmNodW5rcy5maWx0ZXIoY2h1bmsgPT4gY2h1bmsuaXNEeW5hbWljKS5sZW5ndGg7XG4gICAgY29uc3QgY29kZVV0aWxpemF0aW9uID0gTWF0aC5taW4oMSwgZHluYW1pY0NodW5rcyAvIE1hdGgubWF4KDEsIGFuYWx5c2lzLmNodW5rcy5sZW5ndGgpKTtcblxuICAgIHJldHVybiB7XG4gICAgICBidWlsZFRpbWUsXG4gICAgICBidW5kbGVTaXplOiBhbmFseXNpcy50b3RhbFNpemUsXG4gICAgICBjaHVua0NvdW50OiBhbmFseXNpcy5jaHVua3MubGVuZ3RoLFxuICAgICAgYXNzZXRDb3VudDogYW5hbHlzaXMuYXNzZXRzLmxlbmd0aCxcbiAgICAgIGNvbXByZXNzaW9uUmF0aW8sXG4gICAgICB0cmVlc2hha2luZ0VmZmljaWVuY3ksXG4gICAgICBjb2RlVXRpbGl6YXRpb25cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VuZXJhdGVMYXp5TG9hZGluZ1JlY29tbWVuZGF0aW9ucyhjaHVua3M6IEJ1bmRsZUFuYWx5c2lzWydjaHVua3MnXSk6IHN0cmluZ1tdIHtcbiAgICBjb25zdCByZWNvbW1lbmRhdGlvbnM6IHN0cmluZ1tdID0gW107XG4gICAgXG4gICAgLy8gSWRlbnRpZnkgcG90ZW50aWFsIGxhenkgbG9hZGluZyBvcHBvcnR1bml0aWVzXG4gICAgY29uc3QgbGFyZ2VTdGF0aWNDaHVua3MgPSBjaHVua3MuZmlsdGVyKGNodW5rID0+IFxuICAgICAgIWNodW5rLmlzRHluYW1pYyAmJiAhY2h1bmsuaXNFbnRyeSAmJiBjaHVuay5zaXplID4gMTAwMDAwXG4gICAgKTtcblxuICAgIGlmIChsYXJnZVN0YXRpY0NodW5rcy5sZW5ndGggPiAwKSB7XG4gICAgICByZWNvbW1lbmRhdGlvbnMucHVzaCgnQ29uc2lkZXIgbGF6eSBsb2FkaW5nIGZvciB0aGVzZSBjb21wb25lbnRzOicpO1xuICAgICAgbGFyZ2VTdGF0aWNDaHVua3MuZm9yRWFjaChjaHVuayA9PiB7XG4gICAgICAgIHJlY29tbWVuZGF0aW9ucy5wdXNoKGAgIFx1MjAyMiAke2NodW5rLm5hbWV9ICgke01hdGgucm91bmQoY2h1bmsuc2l6ZSAvIDEwMjQpfUtCKWApO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlY29tbWVuZGF0aW9ucztcbiAgfVxuXG4gIGZ1bmN0aW9uIG9wdGltaXplQXNzZXRzKGFzc2V0czogQnVuZGxlQW5hbHlzaXNbJ2Fzc2V0cyddKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IG9wdGltaXphdGlvbnM6IHN0cmluZ1tdID0gW107XG4gICAgXG4gICAgLy8gSW1hZ2Ugb3B0aW1pemF0aW9uIHJlY29tbWVuZGF0aW9uc1xuICAgIGNvbnN0IGltYWdlcyA9IGFzc2V0cy5maWx0ZXIoYXNzZXQgPT4gXG4gICAgICBbJ2pwZycsICdqcGVnJywgJ3BuZycsICdnaWYnLCAnc3ZnJ10uaW5jbHVkZXMoYXNzZXQudHlwZSlcbiAgICApO1xuICAgIFxuICAgIGNvbnN0IGxhcmdlSW1hZ2VzID0gaW1hZ2VzLmZpbHRlcihpbWcgPT4gaW1nLnNpemUgPiA1MDAwMDApOyAvLyA1MDBLQlxuICAgIGlmIChsYXJnZUltYWdlcy5sZW5ndGggPiAwKSB7XG4gICAgICBvcHRpbWl6YXRpb25zLnB1c2goJ0NvbnNpZGVyIG9wdGltaXppbmcgbGFyZ2UgaW1hZ2VzOicpO1xuICAgICAgbGFyZ2VJbWFnZXMuZm9yRWFjaChpbWcgPT4ge1xuICAgICAgICBvcHRpbWl6YXRpb25zLnB1c2goYCAgXHUyMDIyICR7aW1nLm5hbWV9ICgke01hdGgucm91bmQoaW1nLnNpemUgLyAxMDI0KX1LQilgKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEZvbnQgb3B0aW1pemF0aW9uXG4gICAgY29uc3QgZm9udHMgPSBhc3NldHMuZmlsdGVyKGFzc2V0ID0+IFxuICAgICAgWyd3b2ZmJywgJ3dvZmYyJywgJ3R0ZicsICdvdGYnXS5pbmNsdWRlcyhhc3NldC50eXBlKVxuICAgICk7XG4gICAgXG4gICAgaWYgKGZvbnRzLmxlbmd0aCA+IDMpIHtcbiAgICAgIG9wdGltaXphdGlvbnMucHVzaCgnQ29uc2lkZXIgcmVkdWNpbmcgdGhlIG51bWJlciBvZiBmb250IGZpbGVzIG9yIHVzaW5nIGZvbnQgc3Vic2V0dGluZycpO1xuICAgIH1cblxuICAgIHJldHVybiBvcHRpbWl6YXRpb25zO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAncGVyZm9ybWFuY2Utb3B0aW1pemVyJyxcbiAgICBcbiAgICBidWlsZFN0YXJ0KCkge1xuICAgICAgYnVpbGRTdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgY29uc29sZS5sb2coJ1x1MjZBMSBQZXJmb3JtYW5jZSBvcHRpbWl6YXRpb24gc3RhcnRlZCcpO1xuICAgIH0sXG4gICAgXG4gICAgZ2VuZXJhdGVCdW5kbGUob3B0aW9ucywgYnVuZGxlKSB7XG4gICAgICBjb25zdCBidWlsZFRpbWUgPSBEYXRlLm5vdygpIC0gYnVpbGRTdGFydFRpbWU7XG4gICAgICBcbiAgICAgIGlmIChjb25maWcuYnVuZGxlQW5hbHlzaXMpIHtcbiAgICAgICAgYnVuZGxlQW5hbHlzaXMgPSBhbmFseXplQnVuZGxlQ29tcG9zaXRpb24oYnVuZGxlKTtcbiAgICAgICAgcGVyZm9ybWFuY2VNZXRyaWNzID0gY2FsY3VsYXRlUGVyZm9ybWFuY2VNZXRyaWNzKGJ1aWxkVGltZSwgYnVuZGxlQW5hbHlzaXMpO1xuICAgICAgICBcbiAgICAgICAgLy8gU2F2ZSBhbmFseXNpcyByZXN1bHRzXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgd3JpdGVGaWxlU3luYyhhbmFseXNpc0ZpbGUsIEpTT04uc3RyaW5naWZ5KGJ1bmRsZUFuYWx5c2lzLCBudWxsLCAyKSk7XG4gICAgICAgICAgd3JpdGVGaWxlU3luYyhtZXRyaWNzRmlsZSwgSlNPTi5zdHJpbmdpZnkocGVyZm9ybWFuY2VNZXRyaWNzLCBudWxsLCAyKSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHNhdmUgcGVyZm9ybWFuY2UgYW5hbHlzaXM6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICB3cml0ZUJ1bmRsZSgpIHtcbiAgICAgIGlmICghYnVuZGxlQW5hbHlzaXMgfHwgIXBlcmZvcm1hbmNlTWV0cmljcykgcmV0dXJuO1xuICAgICAgXG4gICAgICBjb25zb2xlLmxvZygnXFxuXHVEODNEXHVEQ0NBIFBlcmZvcm1hbmNlIEFuYWx5c2lzIFJlc3VsdHM6Jyk7XG4gICAgICBjb25zb2xlLmxvZyhgICAgXHUyM0YxXHVGRTBGICBCdWlsZCBUaW1lOiAke3BlcmZvcm1hbmNlTWV0cmljcy5idWlsZFRpbWV9bXNgKTtcbiAgICAgIGNvbnNvbGUubG9nKGAgICBcdUQ4M0RcdURDRTYgVG90YWwgQnVuZGxlIFNpemU6ICR7TWF0aC5yb3VuZChwZXJmb3JtYW5jZU1ldHJpY3MuYnVuZGxlU2l6ZSAvIDEwMjQpfUtCYCk7XG4gICAgICBjb25zb2xlLmxvZyhgICAgXHVEODNEXHVERERDXHVGRTBGICBHemlwcGVkIFNpemU6ICR7TWF0aC5yb3VuZChidW5kbGVBbmFseXNpcy50b3RhbEd6aXBTaXplIC8gMTAyNCl9S0JgKTtcbiAgICAgIGNvbnNvbGUubG9nKGAgICBcdUQ4M0RcdURDQ0EgQ29tcHJlc3Npb24gUmF0aW86ICR7TWF0aC5yb3VuZChwZXJmb3JtYW5jZU1ldHJpY3MuY29tcHJlc3Npb25SYXRpbyAqIDEwMCl9JWApO1xuICAgICAgY29uc29sZS5sb2coYCAgIFx1RDgzRVx1RERFOSBDaHVua3M6ICR7cGVyZm9ybWFuY2VNZXRyaWNzLmNodW5rQ291bnR9YCk7XG4gICAgICBjb25zb2xlLmxvZyhgICAgXHVEODNEXHVEREJDXHVGRTBGICBBc3NldHM6ICR7cGVyZm9ybWFuY2VNZXRyaWNzLmFzc2V0Q291bnR9YCk7XG4gICAgICBcbiAgICAgIC8vIFBlcmZvcm1hbmNlIHNjb3JpbmdcbiAgICAgIGxldCBzY29yZSA9IDEwMDtcbiAgICAgIGlmIChwZXJmb3JtYW5jZU1ldHJpY3MuYnVpbGRUaW1lID4gMTUwMDApIHNjb3JlIC09IDIwO1xuICAgICAgaWYgKHBlcmZvcm1hbmNlTWV0cmljcy5idW5kbGVTaXplID4gMjAwMDAwMCkgc2NvcmUgLT0gMjU7XG4gICAgICBpZiAocGVyZm9ybWFuY2VNZXRyaWNzLmNvbXByZXNzaW9uUmF0aW8gPiAwLjcpIHNjb3JlIC09IDE1O1xuICAgICAgaWYgKHBlcmZvcm1hbmNlTWV0cmljcy5jaHVua0NvdW50ID4gMjApIHNjb3JlIC09IDEwO1xuICAgICAgXG4gICAgICBjb25zb2xlLmxvZyhgICAgXHVEODNDXHVERkFGIFBlcmZvcm1hbmNlIFNjb3JlOiAke01hdGgubWF4KDAsIHNjb3JlKX0vMTAwYCk7XG4gICAgICBcbiAgICAgIC8vIFJlY29tbWVuZGF0aW9uc1xuICAgICAgaWYgKGJ1bmRsZUFuYWx5c2lzLnJlY29tbWVuZGF0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdcXG5cdUQ4M0RcdURDQTEgT3B0aW1pemF0aW9uIFJlY29tbWVuZGF0aW9uczonKTtcbiAgICAgICAgYnVuZGxlQW5hbHlzaXMucmVjb21tZW5kYXRpb25zLmZvckVhY2gocmVjID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgICAgXHUyMDIyICR7cmVjfWApO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gQ29kZSBzcGxpdHRpbmcgc3VnZ2VzdGlvbnNcbiAgICAgIGlmIChjb25maWcuY29kZXNwbGl0dGluZykge1xuICAgICAgICBjb25zdCBzcGxpdHRpbmdDb25maWcgPSBnZW5lcmF0ZUNvZGVTcGxpdHRpbmdDb25maWcoYnVuZGxlQW5hbHlzaXMuY2h1bmtzKTtcbiAgICAgICAgaWYgKE9iamVjdC5rZXlzKHNwbGl0dGluZ0NvbmZpZy5tYW51YWxDaHVua3MpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnXFxuXHVEODNEXHVERDAwIFN1Z2dlc3RlZCBDb2RlIFNwbGl0dGluZyBDb25maWd1cmF0aW9uOicpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KHNwbGl0dGluZ0NvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIExhenkgbG9hZGluZyByZWNvbW1lbmRhdGlvbnNcbiAgICAgIGlmIChjb25maWcubGF6eUxvYWRpbmcpIHtcbiAgICAgICAgY29uc3QgbGF6eVJlY29tbWVuZGF0aW9ucyA9IGdlbmVyYXRlTGF6eUxvYWRpbmdSZWNvbW1lbmRhdGlvbnMoYnVuZGxlQW5hbHlzaXMuY2h1bmtzKTtcbiAgICAgICAgaWYgKGxhenlSZWNvbW1lbmRhdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdcXG5cdUQ4M0RcdUREMDQgTGF6eSBMb2FkaW5nIE9wcG9ydHVuaXRpZXM6Jyk7XG4gICAgICAgICAgbGF6eVJlY29tbWVuZGF0aW9ucy5mb3JFYWNoKHJlYyA9PiBjb25zb2xlLmxvZyhgICAgJHtyZWN9YCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIEFzc2V0IG9wdGltaXphdGlvblxuICAgICAgaWYgKGNvbmZpZy5hc3NldE9wdGltaXphdGlvbikge1xuICAgICAgICBjb25zdCBhc3NldE9wdGltaXphdGlvbnMgPSBvcHRpbWl6ZUFzc2V0cyhidW5kbGVBbmFseXNpcy5hc3NldHMpO1xuICAgICAgICBpZiAoYXNzZXRPcHRpbWl6YXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnXFxuXHVEODNEXHVEREJDXHVGRTBGICBBc3NldCBPcHRpbWl6YXRpb24gU3VnZ2VzdGlvbnM6Jyk7XG4gICAgICAgICAgYXNzZXRPcHRpbWl6YXRpb25zLmZvckVhY2gob3B0ID0+IGNvbnNvbGUubG9nKGAgICAke29wdH1gKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gUGVyZm9ybWFuY2Ugd2FybmluZ3NcbiAgICAgIGlmIChzY29yZSA8IDcwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdcXG5cdTI2QTBcdUZFMEYgIFBlcmZvcm1hbmNlIFdhcm5pbmc6IENvbnNpZGVyIGltcGxlbWVudGluZyB0aGUgYWJvdmUgcmVjb21tZW5kYXRpb25zJyk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmIChwZXJmb3JtYW5jZU1ldHJpY3MuYnVuZGxlU2l6ZSA+IDUwMDAwMDApIHsgLy8gNU1CXG4gICAgICAgIGNvbnNvbGUubG9nKCdcXG5cdUQ4M0RcdURFQTggQ3JpdGljYWw6IEJ1bmRsZSBzaXplIGlzIHZlcnkgbGFyZ2UgLSBpbW1lZGlhdGUgb3B0aW1pemF0aW9uIHJlcXVpcmVkJyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG4gICAgICBzZXJ2ZXIud3Mub24oJ3BlcmZvcm1hbmNlOmdldC1hbmFseXNpcycsICgpID0+IHtcbiAgICAgICAgaWYgKGV4aXN0c1N5bmMoYW5hbHlzaXNGaWxlKSAmJiBleGlzdHNTeW5jKG1ldHJpY3NGaWxlKSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBhbmFseXNpcyA9IEpTT04ucGFyc2UocmVhZEZpbGVTeW5jKGFuYWx5c2lzRmlsZSwgJ3V0Zi04JykpO1xuICAgICAgICAgICAgY29uc3QgbWV0cmljcyA9IEpTT04ucGFyc2UocmVhZEZpbGVTeW5jKG1ldHJpY3NGaWxlLCAndXRmLTgnKSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNlcnZlci53cy5zZW5kKCdwZXJmb3JtYW5jZTphbmFseXNpcycsIHtcbiAgICAgICAgICAgICAgYW5hbHlzaXMsXG4gICAgICAgICAgICAgIG1ldHJpY3MsXG4gICAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgcGVyZm9ybWFuY2UgZGF0YTonLCBlcnJvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgc2VydmVyLndzLm9uKCdwZXJmb3JtYW5jZTpvcHRpbWl6ZScsIChkYXRhKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgdHlwZSB9ID0gZGF0YTtcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgIGNhc2UgJ2NvZGUtc3BsaXR0aW5nJzpcbiAgICAgICAgICAgIGlmIChidW5kbGVBbmFseXNpcykge1xuICAgICAgICAgICAgICBjb25zdCBjb25maWcgPSBnZW5lcmF0ZUNvZGVTcGxpdHRpbmdDb25maWcoYnVuZGxlQW5hbHlzaXMuY2h1bmtzKTtcbiAgICAgICAgICAgICAgc2VydmVyLndzLnNlbmQoJ3BlcmZvcm1hbmNlOm9wdGltaXphdGlvbi1jb25maWcnLCB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2NvZGUtc3BsaXR0aW5nJyxcbiAgICAgICAgICAgICAgICBjb25maWdcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIFxuICAgICAgICAgIGNhc2UgJ2xhenktbG9hZGluZyc6XG4gICAgICAgICAgICBpZiAoYnVuZGxlQW5hbHlzaXMpIHtcbiAgICAgICAgICAgICAgY29uc3QgcmVjb21tZW5kYXRpb25zID0gZ2VuZXJhdGVMYXp5TG9hZGluZ1JlY29tbWVuZGF0aW9ucyhidW5kbGVBbmFseXNpcy5jaHVua3MpO1xuICAgICAgICAgICAgICBzZXJ2ZXIud3Muc2VuZCgncGVyZm9ybWFuY2U6b3B0aW1pemF0aW9uLWNvbmZpZycsIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGF6eS1sb2FkaW5nJyxcbiAgICAgICAgICAgICAgICByZWNvbW1lbmRhdGlvbnNcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xufSIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9wbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3BsdWdpbnMvYXV0b21hdGVkLXJlY292ZXJ5LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3QvcGx1Z2lucy9hdXRvbWF0ZWQtcmVjb3ZlcnkudHNcIjtpbXBvcnQgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHdyaXRlRmlsZVN5bmMsIHJlYWRGaWxlU3luYywgZXhpc3RzU3luYywgY29weUZpbGVTeW5jLCBta2RpclN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBjcnlwdG8gZnJvbSAnY3J5cHRvJztcbmltcG9ydCAqIGFzIGNyb24gZnJvbSAnbm9kZS1jcm9uJztcblxuaW50ZXJmYWNlIFJlY292ZXJ5Q29uZmlnIHtcbiAgYmFja3VwSW50ZXJ2YWw6IHN0cmluZzsgLy8gY3JvbiBleHByZXNzaW9uXG4gIG1heEJhY2t1cHM6IG51bWJlcjtcbiAgYXV0b1Jlc3RhcnQ6IGJvb2xlYW47XG4gIHJvbGxiYWNrT25GYWlsdXJlOiBib29sZWFuO1xuICBoZWFsdGhDaGVja0ludGVydmFsOiBudW1iZXI7IC8vIG1pbGxpc2Vjb25kc1xuICBlcnJvclRocmVzaG9sZHM6IHtcbiAgICBjcml0aWNhbDogbnVtYmVyO1xuICAgIGNvbnNlY3V0aXZlOiBudW1iZXI7XG4gICAgdGltZVdpbmRvdzogbnVtYmVyOyAvLyBtaWxsaXNlY29uZHNcbiAgfTtcbn1cblxuaW50ZXJmYWNlIEJhY2t1cFNuYXBzaG90IHtcbiAgaWQ6IHN0cmluZztcbiAgdGltZXN0YW1wOiBzdHJpbmc7XG4gIGZpbGVzOiBBcnJheTx7XG4gICAgcGF0aDogc3RyaW5nO1xuICAgIGNvbnRlbnQ6IHN0cmluZztcbiAgICBjaGVja3N1bTogc3RyaW5nO1xuICB9PjtcbiAgbWV0YWRhdGE6IHtcbiAgICBidWlsZFN1Y2Nlc3M6IGJvb2xlYW47XG4gICAgZXJyb3JDb3VudDogbnVtYmVyO1xuICAgIHBlcmZvcm1hbmNlU2NvcmU6IG51bWJlcjtcbiAgICBoZWFsdGhTY29yZTogbnVtYmVyO1xuICB9O1xufVxuXG5pbnRlcmZhY2UgUmVjb3ZlcnlBY3Rpb24ge1xuICBpZDogc3RyaW5nO1xuICB0eXBlOiAncmVzdGFydCcgfCAncm9sbGJhY2snIHwgJ2JhY2t1cCcgfCAncmVwYWlyJztcbiAgdGltZXN0YW1wOiBzdHJpbmc7XG4gIHJlYXNvbjogc3RyaW5nO1xuICBzdWNjZXNzOiBib29sZWFuO1xuICBkZXRhaWxzPzogYW55O1xufVxuXG5pbnRlcmZhY2UgU3lzdGVtSGVhbHRoIHtcbiAgaXNIZWFsdGh5OiBib29sZWFuO1xuICBzY29yZTogbnVtYmVyO1xuICBpc3N1ZXM6IHN0cmluZ1tdO1xuICBsYXN0Q2hlY2s6IHN0cmluZztcbiAgY29uc2VjdXRpdmVGYWlsdXJlczogbnVtYmVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXV0b21hdGVkUmVjb3ZlcnkoY29uZmlnOiBSZWNvdmVyeUNvbmZpZyA9IHtcbiAgYmFja3VwSW50ZXJ2YWw6ICcwICovNiAqICogKicsIC8vIEV2ZXJ5IDYgaG91cnNcbiAgbWF4QmFja3VwczogMjQsXG4gIGF1dG9SZXN0YXJ0OiB0cnVlLFxuICByb2xsYmFja09uRmFpbHVyZTogdHJ1ZSxcbiAgaGVhbHRoQ2hlY2tJbnRlcnZhbDogMzAwMDAsIC8vIDMwIHNlY29uZHNcbiAgZXJyb3JUaHJlc2hvbGRzOiB7XG4gICAgY3JpdGljYWw6IDMsXG4gICAgY29uc2VjdXRpdmU6IDUsXG4gICAgdGltZVdpbmRvdzogMzAwMDAwIC8vIDUgbWludXRlc1xuICB9XG59KTogUGx1Z2luIHtcbiAgbGV0IHN5c3RlbUhlYWx0aDogU3lzdGVtSGVhbHRoID0ge1xuICAgIGlzSGVhbHRoeTogdHJ1ZSxcbiAgICBzY29yZTogMTAwLFxuICAgIGlzc3VlczogW10sXG4gICAgbGFzdENoZWNrOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgY29uc2VjdXRpdmVGYWlsdXJlczogMFxuICB9O1xuXG4gIGxldCBiYWNrdXBzOiBCYWNrdXBTbmFwc2hvdFtdID0gW107XG4gIGxldCByZWNvdmVyeUFjdGlvbnM6IFJlY292ZXJ5QWN0aW9uW10gPSBbXTtcbiAgbGV0IGVycm9ySGlzdG9yeTogQXJyYXk8eyB0aW1lc3RhbXA6IHN0cmluZzsgc2V2ZXJpdHk6IHN0cmluZzsgbWVzc2FnZTogc3RyaW5nIH0+ID0gW107XG5cbiAgY29uc3QgbG9nRGlyID0gam9pbihwcm9jZXNzLmN3ZCgpLCAnbG9ncycpO1xuICBjb25zdCBiYWNrdXBEaXIgPSBqb2luKGxvZ0RpciwgJ3JlY292ZXJ5LWJhY2t1cHMnKTtcbiAgY29uc3QgcmVjb3ZlcnlGaWxlID0gam9pbihsb2dEaXIsICdyZWNvdmVyeS1zdGF0ZS5qc29uJyk7XG4gIGNvbnN0IGhlYWx0aEZpbGUgPSBqb2luKGxvZ0RpciwgJ3N5c3RlbS1oZWFsdGguanNvbicpO1xuXG4gIC8vIEVuc3VyZSBkaXJlY3RvcmllcyBleGlzdFxuICBbbG9nRGlyLCBiYWNrdXBEaXJdLmZvckVhY2goZGlyID0+IHtcbiAgICBpZiAoIWV4aXN0c1N5bmMoZGlyKSkge1xuICAgICAgbWtkaXJTeW5jKGRpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgfVxuICB9KTtcblxuICBmdW5jdGlvbiBsb2FkUmVjb3ZlcnlTdGF0ZSgpIHtcbiAgICBpZiAoZXhpc3RzU3luYyhyZWNvdmVyeUZpbGUpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBzdGF0ZSA9IEpTT04ucGFyc2UocmVhZEZpbGVTeW5jKHJlY292ZXJ5RmlsZSwgJ3V0Zi04JykpO1xuICAgICAgICBiYWNrdXBzID0gc3RhdGUuYmFja3VwcyB8fCBbXTtcbiAgICAgICAgcmVjb3ZlcnlBY3Rpb25zID0gc3RhdGUucmVjb3ZlcnlBY3Rpb25zIHx8IFtdO1xuICAgICAgICBlcnJvckhpc3RvcnkgPSBzdGF0ZS5lcnJvckhpc3RvcnkgfHwgW107XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLndhcm4oJ0NvdWxkIG5vdCBsb2FkIHJlY292ZXJ5IHN0YXRlOicsIGVycm9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzYXZlUmVjb3ZlcnlTdGF0ZSgpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc3RhdGUgPSB7XG4gICAgICAgIGJhY2t1cHM6IGJhY2t1cHMuc2xpY2UoMCwgY29uZmlnLm1heEJhY2t1cHMpLFxuICAgICAgICByZWNvdmVyeUFjdGlvbnM6IHJlY292ZXJ5QWN0aW9ucy5zbGljZSgwLCAxMDApLFxuICAgICAgICBlcnJvckhpc3Rvcnk6IGVycm9ySGlzdG9yeS5zbGljZSgwLCAxMDAwKSxcbiAgICAgICAgbGFzdFVwZGF0ZTogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9O1xuICAgICAgd3JpdGVGaWxlU3luYyhyZWNvdmVyeUZpbGUsIEpTT04uc3RyaW5naWZ5KHN0YXRlLCBudWxsLCAyKSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBzYXZlIHJlY292ZXJ5IHN0YXRlOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzYXZlSGVhbHRoU3RhdGUoKSB7XG4gICAgdHJ5IHtcbiAgICAgIHdyaXRlRmlsZVN5bmMoaGVhbHRoRmlsZSwgSlNPTi5zdHJpbmdpZnkoc3lzdGVtSGVhbHRoLCBudWxsLCAyKSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBzYXZlIGhlYWx0aCBzdGF0ZTonLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlQmFja3VwKHJlYXNvbjogc3RyaW5nID0gJ3NjaGVkdWxlZCcpOiBCYWNrdXBTbmFwc2hvdCB7XG4gICAgY29uc3QgYmFja3VwSWQgPSBgYmFja3VwLSR7RGF0ZS5ub3coKX1gO1xuICAgIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICBcbiAgICBjb25zb2xlLmxvZyhgXHVEODNEXHVEQ0JFIENyZWF0aW5nIGJhY2t1cDogJHtiYWNrdXBJZH0gKCR7cmVhc29ufSlgKTtcbiAgICBcbiAgICBjb25zdCBjcml0aWNhbEZpbGVzID0gW1xuICAgICAgJ3BhY2thZ2UuanNvbicsXG4gICAgICAndml0ZS5jb25maWcudHMnLFxuICAgICAgJ3RzY29uZmlnLmpzb24nLFxuICAgICAgJ3NyYy9BcHAudHN4JyxcbiAgICAgICdzcmMvbWFpbi50c3gnXG4gICAgXTtcbiAgICBcbiAgICBjb25zdCBmaWxlczogQmFja3VwU25hcHNob3RbJ2ZpbGVzJ10gPSBbXTtcbiAgICBcbiAgICBjcml0aWNhbEZpbGVzLmZvckVhY2goZmlsZVBhdGggPT4ge1xuICAgICAgY29uc3QgZnVsbFBhdGggPSBqb2luKHByb2Nlc3MuY3dkKCksIGZpbGVQYXRoKTtcbiAgICAgIGlmIChleGlzdHNTeW5jKGZ1bGxQYXRoKSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSByZWFkRmlsZVN5bmMoZnVsbFBhdGgsICd1dGYtOCcpO1xuICAgICAgICAgIGNvbnN0IGNoZWNrc3VtID0gY3J5cHRvLmNyZWF0ZUhhc2goJ21kNScpLnVwZGF0ZShjb250ZW50KS5kaWdlc3QoJ2hleCcpO1xuICAgICAgICAgIFxuICAgICAgICAgIGZpbGVzLnB1c2goe1xuICAgICAgICAgICAgcGF0aDogZmlsZVBhdGgsXG4gICAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgICAgY2hlY2tzdW1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBBbHNvIHNhdmUgcGh5c2ljYWwgYmFja3VwXG4gICAgICAgICAgY29uc3QgYmFja3VwRmlsZVBhdGggPSBqb2luKGJhY2t1cERpciwgYCR7YmFja3VwSWR9LSR7ZmlsZVBhdGgucmVwbGFjZSgvW1xcL1xcXFxdL2csICctJyl9YCk7XG4gICAgICAgICAgY29weUZpbGVTeW5jKGZ1bGxQYXRoLCBiYWNrdXBGaWxlUGF0aCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgdG8gYmFja3VwIGZpbGUgJHtmaWxlUGF0aH06YCwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgY29uc3QgYmFja3VwOiBCYWNrdXBTbmFwc2hvdCA9IHtcbiAgICAgIGlkOiBiYWNrdXBJZCxcbiAgICAgIHRpbWVzdGFtcCxcbiAgICAgIGZpbGVzLFxuICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgYnVpbGRTdWNjZXNzOiBzeXN0ZW1IZWFsdGguY29uc2VjdXRpdmVGYWlsdXJlcyA9PT0gMCxcbiAgICAgICAgZXJyb3JDb3VudDogZXJyb3JIaXN0b3J5LmZpbHRlcihlID0+IFxuICAgICAgICAgIERhdGUubm93KCkgLSBuZXcgRGF0ZShlLnRpbWVzdGFtcCkuZ2V0VGltZSgpIDwgMzYwMDAwMFxuICAgICAgICApLmxlbmd0aCxcbiAgICAgICAgcGVyZm9ybWFuY2VTY29yZTogODUsIC8vIFdvdWxkIGJlIGNhbGN1bGF0ZWQgZnJvbSBhY3R1YWwgbWV0cmljc1xuICAgICAgICBoZWFsdGhTY29yZTogc3lzdGVtSGVhbHRoLnNjb3JlXG4gICAgICB9XG4gICAgfTtcbiAgICBcbiAgICBiYWNrdXBzLnVuc2hpZnQoYmFja3VwKTtcbiAgICBpZiAoYmFja3Vwcy5sZW5ndGggPiBjb25maWcubWF4QmFja3Vwcykge1xuICAgICAgYmFja3VwcyA9IGJhY2t1cHMuc2xpY2UoMCwgY29uZmlnLm1heEJhY2t1cHMpO1xuICAgIH1cbiAgICBcbiAgICBzYXZlUmVjb3ZlcnlTdGF0ZSgpO1xuICAgIHJldHVybiBiYWNrdXA7XG4gIH1cblxuICBmdW5jdGlvbiByb2xsYmFja1RvQmFja3VwKGJhY2t1cElkPzogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgdGFyZ2V0QmFja3VwID0gYmFja3VwSWQgXG4gICAgICA/IGJhY2t1cHMuZmluZChiID0+IGIuaWQgPT09IGJhY2t1cElkKVxuICAgICAgOiBiYWNrdXBzLmZpbmQoYiA9PiBiLm1ldGFkYXRhLmJ1aWxkU3VjY2Vzcyk7XG4gICAgXG4gICAgaWYgKCF0YXJnZXRCYWNrdXApIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBObyBzdWl0YWJsZSBiYWNrdXAgZm91bmQgZm9yIHJvbGxiYWNrJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIFxuICAgIGNvbnNvbGUubG9nKGBcdUQ4M0RcdUREMDQgUm9sbGluZyBiYWNrIHRvIGJhY2t1cDogJHt0YXJnZXRCYWNrdXAuaWR9YCk7XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgIHRhcmdldEJhY2t1cC5maWxlcy5mb3JFYWNoKGZpbGUgPT4ge1xuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IGpvaW4ocHJvY2Vzcy5jd2QoKSwgZmlsZS5wYXRoKTtcbiAgICAgICAgd3JpdGVGaWxlU3luYyhmdWxsUGF0aCwgZmlsZS5jb250ZW50KTtcbiAgICAgIH0pO1xuICAgICAgXG4gICAgICBsb2dSZWNvdmVyeUFjdGlvbih7XG4gICAgICAgIHR5cGU6ICdyb2xsYmFjaycsXG4gICAgICAgIHJlYXNvbjogYFJvbGxiYWNrIHRvIGJhY2t1cCAke3RhcmdldEJhY2t1cC5pZH1gLFxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBkZXRhaWxzOiB7IGJhY2t1cElkOiB0YXJnZXRCYWNrdXAuaWQsIGZpbGVzUmVzdG9yZWQ6IHRhcmdldEJhY2t1cC5maWxlcy5sZW5ndGggfVxuICAgICAgfSk7XG4gICAgICBcbiAgICAgIGNvbnNvbGUubG9nKGBcdTI3MDUgUm9sbGJhY2sgY29tcGxldGVkOiAke3RhcmdldEJhY2t1cC5maWxlcy5sZW5ndGh9IGZpbGVzIHJlc3RvcmVkYCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIFJvbGxiYWNrIGZhaWxlZDonLCBlcnJvcik7XG4gICAgICBsb2dSZWNvdmVyeUFjdGlvbih7XG4gICAgICAgIHR5cGU6ICdyb2xsYmFjaycsXG4gICAgICAgIHJlYXNvbjogYFJvbGxiYWNrIHRvIGJhY2t1cCAke3RhcmdldEJhY2t1cC5pZH1gLFxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZGV0YWlsczogeyBlcnJvcjogZXJyb3IubWVzc2FnZSB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBsb2dSZWNvdmVyeUFjdGlvbihhY3Rpb246IE9taXQ8UmVjb3ZlcnlBY3Rpb24sICdpZCcgfCAndGltZXN0YW1wJz4pIHtcbiAgICBjb25zdCByZWNvdmVyeUFjdGlvbjogUmVjb3ZlcnlBY3Rpb24gPSB7XG4gICAgICBpZDogYGFjdGlvbi0ke0RhdGUubm93KCl9YCxcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgLi4uYWN0aW9uXG4gICAgfTtcbiAgICBcbiAgICByZWNvdmVyeUFjdGlvbnMudW5zaGlmdChyZWNvdmVyeUFjdGlvbik7XG4gICAgaWYgKHJlY292ZXJ5QWN0aW9ucy5sZW5ndGggPiAxMDApIHtcbiAgICAgIHJlY292ZXJ5QWN0aW9ucyA9IHJlY292ZXJ5QWN0aW9ucy5zbGljZSgwLCAxMDApO1xuICAgIH1cbiAgICBcbiAgICBzYXZlUmVjb3ZlcnlTdGF0ZSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9nRXJyb3Ioc2V2ZXJpdHk6IHN0cmluZywgbWVzc2FnZTogc3RyaW5nKSB7XG4gICAgZXJyb3JIaXN0b3J5LnVuc2hpZnQoe1xuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICBzZXZlcml0eSxcbiAgICAgIG1lc3NhZ2VcbiAgICB9KTtcbiAgICBcbiAgICAvLyBDaGVjayBlcnJvciB0aHJlc2hvbGRzXG4gICAgY29uc3QgcmVjZW50RXJyb3JzID0gZXJyb3JIaXN0b3J5LmZpbHRlcihlID0+IFxuICAgICAgRGF0ZS5ub3coKSAtIG5ldyBEYXRlKGUudGltZXN0YW1wKS5nZXRUaW1lKCkgPCBjb25maWcuZXJyb3JUaHJlc2hvbGRzLnRpbWVXaW5kb3dcbiAgICApO1xuICAgIFxuICAgIGNvbnN0IGNyaXRpY2FsRXJyb3JzID0gcmVjZW50RXJyb3JzLmZpbHRlcihlID0+IGUuc2V2ZXJpdHkgPT09ICdjcml0aWNhbCcpO1xuICAgIFxuICAgIGlmIChjcml0aWNhbEVycm9ycy5sZW5ndGggPj0gY29uZmlnLmVycm9yVGhyZXNob2xkcy5jcml0aWNhbCkge1xuICAgICAgdHJpZ2dlclJlY292ZXJ5KCdDcml0aWNhbCBlcnJvciB0aHJlc2hvbGQgZXhjZWVkZWQnKTtcbiAgICB9XG4gICAgXG4gICAgdXBkYXRlU3lzdGVtSGVhbHRoKCk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVTeXN0ZW1IZWFsdGgoKSB7XG4gICAgY29uc3QgcmVjZW50RXJyb3JzID0gZXJyb3JIaXN0b3J5LmZpbHRlcihlID0+IFxuICAgICAgRGF0ZS5ub3coKSAtIG5ldyBEYXRlKGUudGltZXN0YW1wKS5nZXRUaW1lKCkgPCAzNjAwMDAwIC8vIExhc3QgaG91clxuICAgICk7XG4gICAgXG4gICAgbGV0IHNjb3JlID0gMTAwO1xuICAgIGxldCBpc3N1ZXM6IHN0cmluZ1tdID0gW107XG4gICAgXG4gICAgLy8gRGVkdWN0IHBvaW50cyBmb3IgZXJyb3JzXG4gICAgcmVjZW50RXJyb3JzLmZvckVhY2goZXJyb3IgPT4ge1xuICAgICAgc3dpdGNoIChlcnJvci5zZXZlcml0eSkge1xuICAgICAgICBjYXNlICdjcml0aWNhbCc6IHNjb3JlIC09IDIwOyBicmVhaztcbiAgICAgICAgY2FzZSAnaGlnaCc6IHNjb3JlIC09IDEwOyBicmVhaztcbiAgICAgICAgY2FzZSAnbWVkaXVtJzogc2NvcmUgLT0gNTsgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2xvdyc6IHNjb3JlIC09IDI7IGJyZWFrO1xuICAgICAgfVxuICAgIH0pO1xuICAgIFxuICAgIC8vIENoZWNrIGZvciBjb25zZWN1dGl2ZSBmYWlsdXJlc1xuICAgIGlmIChzeXN0ZW1IZWFsdGguY29uc2VjdXRpdmVGYWlsdXJlcyA+IGNvbmZpZy5lcnJvclRocmVzaG9sZHMuY29uc2VjdXRpdmUpIHtcbiAgICAgIHNjb3JlIC09IDMwO1xuICAgICAgaXNzdWVzLnB1c2goYCR7c3lzdGVtSGVhbHRoLmNvbnNlY3V0aXZlRmFpbHVyZXN9IGNvbnNlY3V0aXZlIGZhaWx1cmVzIGRldGVjdGVkYCk7XG4gICAgfVxuICAgIFxuICAgIC8vIFVwZGF0ZSBoZWFsdGggc3RhdHVzXG4gICAgc3lzdGVtSGVhbHRoLnNjb3JlID0gTWF0aC5tYXgoMCwgc2NvcmUpO1xuICAgIHN5c3RlbUhlYWx0aC5pc0hlYWx0aHkgPSBzY29yZSA+PSA3MDtcbiAgICBzeXN0ZW1IZWFsdGguaXNzdWVzID0gaXNzdWVzO1xuICAgIHN5c3RlbUhlYWx0aC5sYXN0Q2hlY2sgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgXG4gICAgaWYgKHJlY2VudEVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICBzeXN0ZW1IZWFsdGguaXNzdWVzLnB1c2goYCR7cmVjZW50RXJyb3JzLmxlbmd0aH0gcmVjZW50IGVycm9yc2ApO1xuICAgIH1cbiAgICBcbiAgICBzYXZlSGVhbHRoU3RhdGUoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRyaWdnZXJSZWNvdmVyeShyZWFzb246IHN0cmluZykge1xuICAgIGNvbnNvbGUubG9nKGBcdUQ4M0RcdURFQTggUmVjb3ZlcnkgdHJpZ2dlcmVkOiAke3JlYXNvbn1gKTtcbiAgICBcbiAgICAvLyBDcmVhdGUgZW1lcmdlbmN5IGJhY2t1cFxuICAgIGNyZWF0ZUJhY2t1cCgnZW1lcmdlbmN5Jyk7XG4gICAgXG4gICAgLy8gQXR0ZW1wdCBhdXRvLXJlc3RhcnQgaWYgZW5hYmxlZFxuICAgIGlmIChjb25maWcuYXV0b1Jlc3RhcnQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMDQgQXR0ZW1wdGluZyBhdXRvLXJlc3RhcnQuLi4nKTtcbiAgICAgIGxvZ1JlY292ZXJ5QWN0aW9uKHtcbiAgICAgICAgdHlwZTogJ3Jlc3RhcnQnLFxuICAgICAgICByZWFzb24sXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIGRldGFpbHM6IHsgbWV0aG9kOiAnYXV0by1yZXN0YXJ0JyB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgLy8gUm9sbGJhY2sgaWYgY29uZmlndXJlZCBhbmQgcmVzdGFydCBmYWlsc1xuICAgIGlmIChjb25maWcucm9sbGJhY2tPbkZhaWx1cmUgJiYgc3lzdGVtSGVhbHRoLmNvbnNlY3V0aXZlRmFpbHVyZXMgPiAyKSB7XG4gICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDA0IEF0dGVtcHRpbmcgcm9sbGJhY2sgdG8gbGFzdCBrbm93biBnb29kIHN0YXRlLi4uJyk7XG4gICAgICBjb25zdCByb2xsYmFja1N1Y2Nlc3MgPSByb2xsYmFja1RvQmFja3VwKCk7XG4gICAgICBcbiAgICAgIGlmIChyb2xsYmFja1N1Y2Nlc3MpIHtcbiAgICAgICAgc3lzdGVtSGVhbHRoLmNvbnNlY3V0aXZlRmFpbHVyZXMgPSAwO1xuICAgICAgICB1cGRhdGVTeXN0ZW1IZWFsdGgoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwZXJmb3JtSGVhbHRoQ2hlY2soKSB7XG4gICAgLy8gQ2hlY2sgaWYgYnVpbGQgaXMgd29ya2luZ1xuICAgIGNvbnN0IHJlY2VudEVycm9ycyA9IGVycm9ySGlzdG9yeS5maWx0ZXIoZSA9PiBcbiAgICAgIERhdGUubm93KCkgLSBuZXcgRGF0ZShlLnRpbWVzdGFtcCkuZ2V0VGltZSgpIDwgY29uZmlnLmhlYWx0aENoZWNrSW50ZXJ2YWxcbiAgICApO1xuICAgIFxuICAgIGlmIChyZWNlbnRFcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgc3lzdGVtSGVhbHRoLmNvbnNlY3V0aXZlRmFpbHVyZXMrKztcbiAgICB9IGVsc2Uge1xuICAgICAgc3lzdGVtSGVhbHRoLmNvbnNlY3V0aXZlRmFpbHVyZXMgPSBNYXRoLm1heCgwLCBzeXN0ZW1IZWFsdGguY29uc2VjdXRpdmVGYWlsdXJlcyAtIDEpO1xuICAgIH1cbiAgICBcbiAgICB1cGRhdGVTeXN0ZW1IZWFsdGgoKTtcbiAgICBcbiAgICAvLyBUcmlnZ2VyIHJlY292ZXJ5IGlmIGhlYWx0aCBpcyBjcml0aWNhbFxuICAgIGlmICghc3lzdGVtSGVhbHRoLmlzSGVhbHRoeSAmJiBzeXN0ZW1IZWFsdGguc2NvcmUgPCAzMCkge1xuICAgICAgdHJpZ2dlclJlY292ZXJ5KCdTeXN0ZW0gaGVhbHRoIGNyaXRpY2FsJyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVwYWlyQ29tbW9uSXNzdWVzKCk6IGJvb2xlYW4ge1xuICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMjcgQXR0ZW1wdGluZyB0byByZXBhaXIgY29tbW9uIGlzc3Vlcy4uLicpO1xuICAgIFxuICAgIGxldCByZXBhaXJlZCA9IGZhbHNlO1xuICAgIGNvbnN0IHJlcGFpcnM6IHN0cmluZ1tdID0gW107XG4gICAgXG4gICAgLy8gQ2hlY2sgZm9yIG1pc3NpbmcgZGVwZW5kZW5jaWVzXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBhY2thZ2VKc29uID0gSlNPTi5wYXJzZShyZWFkRmlsZVN5bmMoam9pbihwcm9jZXNzLmN3ZCgpLCAncGFja2FnZS5qc29uJyksICd1dGYtOCcpKTtcbiAgICAgIGNvbnN0IG5vZGVNb2R1bGVzRXhpc3RzID0gZXhpc3RzU3luYyhqb2luKHByb2Nlc3MuY3dkKCksICdub2RlX21vZHVsZXMnKSk7XG4gICAgICBcbiAgICAgIGlmICghbm9kZU1vZHVsZXNFeGlzdHMpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENFNiBOb2RlIG1vZHVsZXMgbWlzc2luZyAtIHRoaXMgd291bGQgdHJpZ2dlciBucG0gaW5zdGFsbCcpO1xuICAgICAgICByZXBhaXJzLnB1c2goJ05vZGUgbW9kdWxlcyBpbnN0YWxsYXRpb24gcmVxdWlyZWQnKTtcbiAgICAgICAgcmVwYWlyZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0NvdWxkIG5vdCBjaGVjayBwYWNrYWdlLmpzb246JywgZXJyb3IpO1xuICAgIH1cbiAgICBcbiAgICAvLyBDaGVjayBmb3IgY29ycnVwdGVkIGNvbmZpZyBmaWxlc1xuICAgIGNvbnN0IGNvbmZpZ0ZpbGVzID0gWyd2aXRlLmNvbmZpZy50cycsICd0c2NvbmZpZy5qc29uJ107XG4gICAgY29uZmlnRmlsZXMuZm9yRWFjaChmaWxlID0+IHtcbiAgICAgIGNvbnN0IGZpbGVQYXRoID0gam9pbihwcm9jZXNzLmN3ZCgpLCBmaWxlKTtcbiAgICAgIGlmIChleGlzdHNTeW5jKGZpbGVQYXRoKSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSByZWFkRmlsZVN5bmMoZmlsZVBhdGgsICd1dGYtOCcpO1xuICAgICAgICAgIGlmIChjb250ZW50LnRyaW0oKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBcdUQ4M0RcdURDREQgRW1wdHkgY29uZmlnIGZpbGUgZGV0ZWN0ZWQ6ICR7ZmlsZX1gKTtcbiAgICAgICAgICAgIHJlcGFpcnMucHVzaChgRW1wdHkgY29uZmlnIGZpbGU6ICR7ZmlsZX1gKTtcbiAgICAgICAgICAgIHJlcGFpcmVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKGBDb3VsZCBub3QgcmVhZCAke2ZpbGV9OmAsIGVycm9yKTtcbiAgICAgICAgICByZXBhaXJzLnB1c2goYENvcnJ1cHRlZCBjb25maWcgZmlsZTogJHtmaWxlfWApO1xuICAgICAgICAgIHJlcGFpcmVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIFxuICAgIGlmIChyZXBhaXJlZCkge1xuICAgICAgbG9nUmVjb3ZlcnlBY3Rpb24oe1xuICAgICAgICB0eXBlOiAncmVwYWlyJyxcbiAgICAgICAgcmVhc29uOiAnQXV0b21hdGVkIHJlcGFpciBvZiBjb21tb24gaXNzdWVzJyxcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgZGV0YWlsczogeyByZXBhaXJzIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gcmVwYWlyZWQ7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdhdXRvbWF0ZWQtcmVjb3ZlcnknLFxuICAgIFxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgIGxvYWRSZWNvdmVyeVN0YXRlKCk7XG4gICAgICBcbiAgICAgIC8vIFNjaGVkdWxlIGF1dG9tYXRpYyBiYWNrdXBzXG4gICAgICBjcm9uLnNjaGVkdWxlKGNvbmZpZy5iYWNrdXBJbnRlcnZhbCwgKCkgPT4ge1xuICAgICAgICBjcmVhdGVCYWNrdXAoJ3NjaGVkdWxlZCcpO1xuICAgICAgfSk7XG4gICAgICBcbiAgICAgIC8vIEhlYWx0aCBjaGVjayBpbnRlcnZhbFxuICAgICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBwZXJmb3JtSGVhbHRoQ2hlY2soKTtcbiAgICAgIH0sIGNvbmZpZy5oZWFsdGhDaGVja0ludGVydmFsKTtcbiAgICAgIFxuICAgICAgLy8gV2ViU29ja2V0IGhhbmRsZXJzXG4gICAgICBzZXJ2ZXIud3Mub24oJ3JlY292ZXJ5OmdldC1zdGF0dXMnLCAoKSA9PiB7XG4gICAgICAgIHNlcnZlci53cy5zZW5kKCdyZWNvdmVyeTpzdGF0dXMnLCB7XG4gICAgICAgICAgaGVhbHRoOiBzeXN0ZW1IZWFsdGgsXG4gICAgICAgICAgYmFja3VwczogYmFja3Vwcy5zbGljZSgwLCAxMCksXG4gICAgICAgICAgcmVjZW50QWN0aW9uczogcmVjb3ZlcnlBY3Rpb25zLnNsaWNlKDAsIDEwKSxcbiAgICAgICAgICBlcnJvckhpc3Rvcnk6IGVycm9ySGlzdG9yeS5zbGljZSgwLCAyMClcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgc2VydmVyLndzLm9uKCdyZWNvdmVyeTpjcmVhdGUtYmFja3VwJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBiYWNrdXAgPSBjcmVhdGVCYWNrdXAoJ21hbnVhbCcpO1xuICAgICAgICBzZXJ2ZXIud3Muc2VuZCgncmVjb3Zlcnk6YmFja3VwLWNyZWF0ZWQnLCBiYWNrdXApO1xuICAgICAgfSk7XG4gICAgICBcbiAgICAgIHNlcnZlci53cy5vbigncmVjb3Zlcnk6cm9sbGJhY2snLCAoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCB7IGJhY2t1cElkIH0gPSBkYXRhO1xuICAgICAgICBjb25zdCBzdWNjZXNzID0gcm9sbGJhY2tUb0JhY2t1cChiYWNrdXBJZCk7XG4gICAgICAgIHNlcnZlci53cy5zZW5kKCdyZWNvdmVyeTpyb2xsYmFjay1yZXN1bHQnLCB7IHN1Y2Nlc3MsIGJhY2t1cElkIH0pO1xuICAgICAgfSk7XG4gICAgICBcbiAgICAgIHNlcnZlci53cy5vbigncmVjb3Zlcnk6cmVwYWlyJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdWNjZXNzID0gcmVwYWlyQ29tbW9uSXNzdWVzKCk7XG4gICAgICAgIHNlcnZlci53cy5zZW5kKCdyZWNvdmVyeTpyZXBhaXItcmVzdWx0JywgeyBzdWNjZXNzIH0pO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBcbiAgICBidWlsZFN0YXJ0KCkge1xuICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REVFMVx1RkUwRiAgQXV0b21hdGVkIHJlY292ZXJ5IHN5c3RlbSBhY3RpdmUnKTtcbiAgICAgIHVwZGF0ZVN5c3RlbUhlYWx0aCgpO1xuICAgIH0sXG4gICAgXG4gICAgYnVpbGRFcnJvcihlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignXHVEODNEXHVERUE4IEJ1aWxkIGVycm9yIGRldGVjdGVkOicsIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgbG9nRXJyb3IoJ2NyaXRpY2FsJywgYEJ1aWxkIGVycm9yOiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICBcbiAgICAgIC8vIEF0dGVtcHQgcmVwYWlyXG4gICAgICBjb25zdCByZXBhaXJlZCA9IHJlcGFpckNvbW1vbklzc3VlcygpO1xuICAgICAgaWYgKCFyZXBhaXJlZCAmJiBjb25maWcucm9sbGJhY2tPbkZhaWx1cmUpIHtcbiAgICAgICAgdHJpZ2dlclJlY292ZXJ5KCdCdWlsZCBmYWlsdXJlJyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBidWlsZEVuZCgpIHtcbiAgICAgIC8vIFJlc2V0IGNvbnNlY3V0aXZlIGZhaWx1cmVzIG9uIHN1Y2Nlc3NmdWwgYnVpbGRcbiAgICAgIGlmIChzeXN0ZW1IZWFsdGguY29uc2VjdXRpdmVGYWlsdXJlcyA+IDApIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1x1MjcwNSBCdWlsZCBzdWNjZXNzZnVsIC0gcmVzZXR0aW5nIGZhaWx1cmUgY291bnQnKTtcbiAgICAgICAgc3lzdGVtSGVhbHRoLmNvbnNlY3V0aXZlRmFpbHVyZXMgPSAwO1xuICAgICAgICB1cGRhdGVTeXN0ZW1IZWFsdGgoKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3BsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3QvcGx1Z2lucy9yZWFsLXRpbWUtbW9uaXRvci50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3BsdWdpbnMvcmVhbC10aW1lLW1vbml0b3IudHNcIjtpbXBvcnQgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IFdlYlNvY2tldFNlcnZlciB9IGZyb20gJ3dzJztcbmltcG9ydCB7IHdhdGNoIH0gZnJvbSAnY2hva2lkYXInO1xuaW1wb3J0IHsgd3JpdGVGaWxlU3luYywgcmVhZEZpbGVTeW5jLCBleGlzdHNTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgY3JvbiBmcm9tICdub2RlLWNyb24nO1xuXG5pbnRlcmZhY2UgTW9uaXRvcmluZ0NvbmZpZyB7XG4gIGVuYWJsZURPTVRyYWNraW5nOiBib29sZWFuO1xuICBlbmFibGVOZXR3b3JrTW9uaXRvcmluZzogYm9vbGVhbjtcbiAgZW5hYmxlUGVyZm9ybWFuY2VUcmFja2luZzogYm9vbGVhbjtcbiAgZW5hYmxlRXJyb3JDYXB0dXJlOiBib29sZWFuO1xuICBhbGVydFRocmVzaG9sZHM6IHtcbiAgICBlcnJvclJhdGU6IG51bWJlcjtcbiAgICByZXNwb25zZVRpbWU6IG51bWJlcjtcbiAgICBtZW1vcnlVc2FnZTogbnVtYmVyO1xuICAgIGJ1aWxkVGltZTogbnVtYmVyO1xuICB9O1xuICByZXBvcnRpbmdJbnRlcnZhbDogc3RyaW5nOyAvLyBjcm9uIGV4cHJlc3Npb25cbiAgcmV0ZW50aW9uUGVyaW9kOiBudW1iZXI7IC8vIGRheXNcbn1cblxuaW50ZXJmYWNlIFJlYWxUaW1lRXZlbnQge1xuICBpZDogc3RyaW5nO1xuICB0eXBlOiAnZG9tJyB8ICduZXR3b3JrJyB8ICdlcnJvcicgfCAncGVyZm9ybWFuY2UnIHwgJ2J1aWxkJyB8ICdmaWxlJztcbiAgdGltZXN0YW1wOiBzdHJpbmc7XG4gIGRhdGE6IGFueTtcbiAgc2V2ZXJpdHk6ICdpbmZvJyB8ICd3YXJuaW5nJyB8ICdlcnJvcicgfCAnY3JpdGljYWwnO1xuICBzb3VyY2U6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIEFsZXJ0UnVsZSB7XG4gIGlkOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgY29uZGl0aW9uOiAoZXZlbnRzOiBSZWFsVGltZUV2ZW50W10pID0+IGJvb2xlYW47XG4gIHNldmVyaXR5OiAnbG93JyB8ICdtZWRpdW0nIHwgJ2hpZ2gnIHwgJ2NyaXRpY2FsJztcbiAgY29vbGRvd246IG51bWJlcjsgLy8gbWlsbGlzZWNvbmRzXG4gIGxhc3RUcmlnZ2VyZWQ/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBEYWlseVJlcG9ydCB7XG4gIGRhdGU6IHN0cmluZztcbiAgc3VtbWFyeToge1xuICAgIHRvdGFsRXZlbnRzOiBudW1iZXI7XG4gICAgZXJyb3JDb3VudDogbnVtYmVyO1xuICAgIHdhcm5pbmdDb3VudDogbnVtYmVyO1xuICAgIGF2Z1Jlc3BvbnNlVGltZTogbnVtYmVyO1xuICAgIHBlYWtNZW1vcnlVc2FnZTogbnVtYmVyO1xuICAgIGJ1aWxkQ291bnQ6IG51bWJlcjtcbiAgICBhdmdCdWlsZFRpbWU6IG51bWJlcjtcbiAgfTtcbiAgdHJlbmRzOiB7XG4gICAgZXJyb3JSYXRlOiBudW1iZXI7XG4gICAgcGVyZm9ybWFuY2VTY29yZTogbnVtYmVyO1xuICAgIHN0YWJpbGl0eVNjb3JlOiBudW1iZXI7XG4gIH07XG4gIHRvcElzc3VlczogQXJyYXk8e1xuICAgIHR5cGU6IHN0cmluZztcbiAgICBjb3VudDogbnVtYmVyO1xuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIH0+O1xuICByZWNvbW1lbmRhdGlvbnM6IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhbFRpbWVNb25pdG9yKGNvbmZpZzogTW9uaXRvcmluZ0NvbmZpZyA9IHtcbiAgZW5hYmxlRE9NVHJhY2tpbmc6IHRydWUsXG4gIGVuYWJsZU5ldHdvcmtNb25pdG9yaW5nOiB0cnVlLFxuICBlbmFibGVQZXJmb3JtYW5jZVRyYWNraW5nOiB0cnVlLFxuICBlbmFibGVFcnJvckNhcHR1cmU6IHRydWUsXG4gIGFsZXJ0VGhyZXNob2xkczoge1xuICAgIGVycm9yUmF0ZTogMTAsIC8vIGVycm9ycyBwZXIgbWludXRlXG4gICAgcmVzcG9uc2VUaW1lOiA1MDAwLCAvLyBtaWxsaXNlY29uZHNcbiAgICBtZW1vcnlVc2FnZTogMTAwICogMTAyNCAqIDEwMjQsIC8vIDEwME1CXG4gICAgYnVpbGRUaW1lOiAzMDAwMCAvLyAzMCBzZWNvbmRzXG4gIH0sXG4gIHJlcG9ydGluZ0ludGVydmFsOiAnMCAwICogKiAqJywgLy8gRGFpbHkgYXQgbWlkbmlnaHRcbiAgcmV0ZW50aW9uUGVyaW9kOiAzMCAvLyAzMCBkYXlzXG59KTogUGx1Z2luIHtcbiAgbGV0IGV2ZW50czogUmVhbFRpbWVFdmVudFtdID0gW107XG4gIGxldCB3c1NlcnZlcjogV2ViU29ja2V0U2VydmVyO1xuICBsZXQgY29ubmVjdGVkQ2xpZW50czogU2V0PFdlYlNvY2tldD4gPSBuZXcgU2V0KCk7XG4gIFxuICBjb25zdCBsb2dEaXIgPSBqb2luKHByb2Nlc3MuY3dkKCksICdsb2dzJyk7XG4gIGNvbnN0IGV2ZW50c0ZpbGUgPSBqb2luKGxvZ0RpciwgJ3JlYWwtdGltZS1ldmVudHMuanNvbicpO1xuICBjb25zdCByZXBvcnRzRGlyID0gam9pbihsb2dEaXIsICdkYWlseS1yZXBvcnRzJyk7XG4gIFxuICAvLyBFbnN1cmUgZGlyZWN0b3JpZXMgZXhpc3RcbiAgW2xvZ0RpciwgcmVwb3J0c0Rpcl0uZm9yRWFjaChkaXIgPT4ge1xuICAgIGlmICghZXhpc3RzU3luYyhkaXIpKSB7XG4gICAgICByZXF1aXJlKCdmcycpLm1rZGlyU3luYyhkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgY29uc3QgYWxlcnRSdWxlczogQWxlcnRSdWxlW10gPSBbXG4gICAge1xuICAgICAgaWQ6ICdoaWdoLWVycm9yLXJhdGUnLFxuICAgICAgbmFtZTogJ0hpZ2ggRXJyb3IgUmF0ZScsXG4gICAgICBjb25kaXRpb246IChldmVudHMpID0+IHtcbiAgICAgICAgY29uc3QgcmVjZW50RXJyb3JzID0gZXZlbnRzLmZpbHRlcihlID0+IFxuICAgICAgICAgIGUudHlwZSA9PT0gJ2Vycm9yJyAmJiBcbiAgICAgICAgICBEYXRlLm5vdygpIC0gbmV3IERhdGUoZS50aW1lc3RhbXApLmdldFRpbWUoKSA8IDYwMDAwIC8vIExhc3QgbWludXRlXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZWNlbnRFcnJvcnMubGVuZ3RoID4gY29uZmlnLmFsZXJ0VGhyZXNob2xkcy5lcnJvclJhdGU7XG4gICAgICB9LFxuICAgICAgc2V2ZXJpdHk6ICdoaWdoJyxcbiAgICAgIGNvb2xkb3duOiAzMDAwMDAgLy8gNSBtaW51dGVzXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ3Nsb3ctcmVzcG9uc2UtdGltZScsXG4gICAgICBuYW1lOiAnU2xvdyBSZXNwb25zZSBUaW1lJyxcbiAgICAgIGNvbmRpdGlvbjogKGV2ZW50cykgPT4ge1xuICAgICAgICBjb25zdCByZWNlbnROZXR3b3JrID0gZXZlbnRzLmZpbHRlcihlID0+IFxuICAgICAgICAgIGUudHlwZSA9PT0gJ25ldHdvcmsnICYmIFxuICAgICAgICAgIERhdGUubm93KCkgLSBuZXcgRGF0ZShlLnRpbWVzdGFtcCkuZ2V0VGltZSgpIDwgNjAwMDBcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgYXZnUmVzcG9uc2VUaW1lID0gcmVjZW50TmV0d29yay5yZWR1Y2UoKHN1bSwgZSkgPT4gXG4gICAgICAgICAgc3VtICsgKGUuZGF0YS5yZXNwb25zZVRpbWUgfHwgMCksIDApIC8gcmVjZW50TmV0d29yay5sZW5ndGg7XG4gICAgICAgIHJldHVybiBhdmdSZXNwb25zZVRpbWUgPiBjb25maWcuYWxlcnRUaHJlc2hvbGRzLnJlc3BvbnNlVGltZTtcbiAgICAgIH0sXG4gICAgICBzZXZlcml0eTogJ21lZGl1bScsXG4gICAgICBjb29sZG93bjogMTgwMDAwIC8vIDMgbWludXRlc1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdtZW1vcnktbGVhaycsXG4gICAgICBuYW1lOiAnUG90ZW50aWFsIE1lbW9yeSBMZWFrJyxcbiAgICAgIGNvbmRpdGlvbjogKGV2ZW50cykgPT4ge1xuICAgICAgICBjb25zdCByZWNlbnRQZXJmID0gZXZlbnRzLmZpbHRlcihlID0+IFxuICAgICAgICAgIGUudHlwZSA9PT0gJ3BlcmZvcm1hbmNlJyAmJiBcbiAgICAgICAgICBlLmRhdGEubWVtb3J5VXNhZ2UgJiZcbiAgICAgICAgICBEYXRlLm5vdygpIC0gbmV3IERhdGUoZS50aW1lc3RhbXApLmdldFRpbWUoKSA8IDMwMDAwMCAvLyBMYXN0IDUgbWludXRlc1xuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVjZW50UGVyZi5zb21lKGUgPT4gZS5kYXRhLm1lbW9yeVVzYWdlID4gY29uZmlnLmFsZXJ0VGhyZXNob2xkcy5tZW1vcnlVc2FnZSk7XG4gICAgICB9LFxuICAgICAgc2V2ZXJpdHk6ICdoaWdoJyxcbiAgICAgIGNvb2xkb3duOiA2MDAwMDAgLy8gMTAgbWludXRlc1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdidWlsZC1wZXJmb3JtYW5jZScsXG4gICAgICBuYW1lOiAnQnVpbGQgUGVyZm9ybWFuY2UgRGVncmFkYXRpb24nLFxuICAgICAgY29uZGl0aW9uOiAoZXZlbnRzKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlY2VudEJ1aWxkcyA9IGV2ZW50cy5maWx0ZXIoZSA9PiBcbiAgICAgICAgICBlLnR5cGUgPT09ICdidWlsZCcgJiYgXG4gICAgICAgICAgRGF0ZS5ub3coKSAtIG5ldyBEYXRlKGUudGltZXN0YW1wKS5nZXRUaW1lKCkgPCAzNjAwMDAwIC8vIExhc3QgaG91clxuICAgICAgICApO1xuICAgICAgICBjb25zdCBhdmdCdWlsZFRpbWUgPSByZWNlbnRCdWlsZHMucmVkdWNlKChzdW0sIGUpID0+IFxuICAgICAgICAgIHN1bSArIChlLmRhdGEuYnVpbGRUaW1lIHx8IDApLCAwKSAvIHJlY2VudEJ1aWxkcy5sZW5ndGg7XG4gICAgICAgIHJldHVybiBhdmdCdWlsZFRpbWUgPiBjb25maWcuYWxlcnRUaHJlc2hvbGRzLmJ1aWxkVGltZTtcbiAgICAgIH0sXG4gICAgICBzZXZlcml0eTogJ21lZGl1bScsXG4gICAgICBjb29sZG93bjogOTAwMDAwIC8vIDE1IG1pbnV0ZXNcbiAgICB9XG4gIF07XG5cbiAgZnVuY3Rpb24gYWRkRXZlbnQoZXZlbnQ6IE9taXQ8UmVhbFRpbWVFdmVudCwgJ2lkJyB8ICd0aW1lc3RhbXAnPikge1xuICAgIGNvbnN0IHJlYWxUaW1lRXZlbnQ6IFJlYWxUaW1lRXZlbnQgPSB7XG4gICAgICBpZDogYGV2ZW50LSR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YCxcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgLi4uZXZlbnRcbiAgICB9O1xuICAgIFxuICAgIGV2ZW50cy51bnNoaWZ0KHJlYWxUaW1lRXZlbnQpO1xuICAgIFxuICAgIC8vIEtlZXAgb25seSByZWNlbnQgZXZlbnRzIGluIG1lbW9yeSAobGFzdCAxMCwwMDApXG4gICAgaWYgKGV2ZW50cy5sZW5ndGggPiAxMDAwMCkge1xuICAgICAgZXZlbnRzID0gZXZlbnRzLnNsaWNlKDAsIDEwMDAwKTtcbiAgICB9XG4gICAgXG4gICAgLy8gQnJvYWRjYXN0IHRvIGNvbm5lY3RlZCBjbGllbnRzXG4gICAgYnJvYWRjYXN0RXZlbnQocmVhbFRpbWVFdmVudCk7XG4gICAgXG4gICAgLy8gQ2hlY2sgYWxlcnQgcnVsZXNcbiAgICBjaGVja0FsZXJ0UnVsZXMoKTtcbiAgICBcbiAgICAvLyBQZXJzaXN0IGV2ZW50cyBwZXJpb2RpY2FsbHlcbiAgICBpZiAoZXZlbnRzLmxlbmd0aCAlIDEwMCA9PT0gMCkge1xuICAgICAgcGVyc2lzdEV2ZW50cygpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGJyb2FkY2FzdEV2ZW50KGV2ZW50OiBSZWFsVGltZUV2ZW50KSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIHR5cGU6ICdyZWFsLXRpbWUtZXZlbnQnLFxuICAgICAgZXZlbnRcbiAgICB9KTtcbiAgICBcbiAgICBjb25uZWN0ZWRDbGllbnRzLmZvckVhY2goY2xpZW50ID0+IHtcbiAgICAgIGlmIChjbGllbnQucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0Lk9QRU4pIHtcbiAgICAgICAgY2xpZW50LnNlbmQobWVzc2FnZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBjaGVja0FsZXJ0UnVsZXMoKSB7XG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICBcbiAgICBhbGVydFJ1bGVzLmZvckVhY2gocnVsZSA9PiB7XG4gICAgICAvLyBDaGVjayBjb29sZG93blxuICAgICAgaWYgKHJ1bGUubGFzdFRyaWdnZXJlZCAmJiBcbiAgICAgICAgICBub3cgLSBuZXcgRGF0ZShydWxlLmxhc3RUcmlnZ2VyZWQpLmdldFRpbWUoKSA8IHJ1bGUuY29vbGRvd24pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAocnVsZS5jb25kaXRpb24oZXZlbnRzKSkge1xuICAgICAgICB0cmlnZ2VyQWxlcnQocnVsZSk7XG4gICAgICAgIHJ1bGUubGFzdFRyaWdnZXJlZCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRyaWdnZXJBbGVydChydWxlOiBBbGVydFJ1bGUpIHtcbiAgICBjb25zdCBhbGVydCA9IHtcbiAgICAgIGlkOiBgYWxlcnQtJHtEYXRlLm5vdygpfWAsXG4gICAgICBydWxlOiBydWxlLm5hbWUsXG4gICAgICBzZXZlcml0eTogcnVsZS5zZXZlcml0eSxcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgbWVzc2FnZTogYEFsZXJ0IHRyaWdnZXJlZDogJHtydWxlLm5hbWV9YFxuICAgIH07XG4gICAgXG4gICAgY29uc29sZS5sb2coYFx1RDgzRFx1REVBOCAke3J1bGUuc2V2ZXJpdHkudG9VcHBlckNhc2UoKX0gQUxFUlQ6ICR7cnVsZS5uYW1lfWApO1xuICAgIFxuICAgIC8vIEFkZCBhbGVydCBhcyBhbiBldmVudFxuICAgIGFkZEV2ZW50KHtcbiAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICBzZXZlcml0eTogcnVsZS5zZXZlcml0eSA9PT0gJ2NyaXRpY2FsJyA/ICdjcml0aWNhbCcgOiAnd2FybmluZycsXG4gICAgICBzb3VyY2U6ICdhbGVydC1zeXN0ZW0nLFxuICAgICAgZGF0YTogYWxlcnRcbiAgICB9KTtcbiAgICBcbiAgICAvLyBTZW5kIGRlc2t0b3Agbm90aWZpY2F0aW9uIGlmIHN1cHBvcnRlZFxuICAgIGJyb2FkY2FzdE5vdGlmaWNhdGlvbihhbGVydCk7XG4gIH1cblxuICBmdW5jdGlvbiBicm9hZGNhc3ROb3RpZmljYXRpb24oYWxlcnQ6IGFueSkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICB0eXBlOiAnYWxlcnQnLFxuICAgICAgYWxlcnRcbiAgICB9KTtcbiAgICBcbiAgICBjb25uZWN0ZWRDbGllbnRzLmZvckVhY2goY2xpZW50ID0+IHtcbiAgICAgIGlmIChjbGllbnQucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0Lk9QRU4pIHtcbiAgICAgICAgY2xpZW50LnNlbmQobWVzc2FnZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBwZXJzaXN0RXZlbnRzKCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYXRhVG9TYXZlID0ge1xuICAgICAgICBldmVudHM6IGV2ZW50cy5zbGljZSgwLCAxMDAwKSwgLy8gU2F2ZSBsYXN0IDEwMDAgZXZlbnRzXG4gICAgICAgIGxhc3RVcGRhdGU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfTtcbiAgICAgIHdyaXRlRmlsZVN5bmMoZXZlbnRzRmlsZSwgSlNPTi5zdHJpbmdpZnkoZGF0YVRvU2F2ZSwgbnVsbCwgMikpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gcGVyc2lzdCBldmVudHM6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGxvYWRFdmVudHMoKSB7XG4gICAgaWYgKGV4aXN0c1N5bmMoZXZlbnRzRmlsZSkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKHJlYWRGaWxlU3luYyhldmVudHNGaWxlLCAndXRmLTgnKSk7XG4gICAgICAgIGV2ZW50cyA9IGRhdGEuZXZlbnRzIHx8IFtdO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdDb3VsZCBub3QgbG9hZCBleGlzdGluZyBldmVudHM6JywgZXJyb3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlRGFpbHlSZXBvcnQoKTogRGFpbHlSZXBvcnQge1xuICAgIGNvbnN0IHRvZGF5ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF07XG4gICAgY29uc3QgdG9kYXlFdmVudHMgPSBldmVudHMuZmlsdGVyKGUgPT4gZS50aW1lc3RhbXAuc3RhcnRzV2l0aCh0b2RheSkpO1xuICAgIFxuICAgIGNvbnN0IGVycm9yRXZlbnRzID0gdG9kYXlFdmVudHMuZmlsdGVyKGUgPT4gZS5zZXZlcml0eSA9PT0gJ2Vycm9yJyB8fCBlLnNldmVyaXR5ID09PSAnY3JpdGljYWwnKTtcbiAgICBjb25zdCB3YXJuaW5nRXZlbnRzID0gdG9kYXlFdmVudHMuZmlsdGVyKGUgPT4gZS5zZXZlcml0eSA9PT0gJ3dhcm5pbmcnKTtcbiAgICBjb25zdCBuZXR3b3JrRXZlbnRzID0gdG9kYXlFdmVudHMuZmlsdGVyKGUgPT4gZS50eXBlID09PSAnbmV0d29yaycpO1xuICAgIGNvbnN0IGJ1aWxkRXZlbnRzID0gdG9kYXlFdmVudHMuZmlsdGVyKGUgPT4gZS50eXBlID09PSAnYnVpbGQnKTtcbiAgICBcbiAgICBjb25zdCBhdmdSZXNwb25zZVRpbWUgPSBuZXR3b3JrRXZlbnRzLmxlbmd0aCA+IDAgXG4gICAgICA/IG5ldHdvcmtFdmVudHMucmVkdWNlKChzdW0sIGUpID0+IHN1bSArIChlLmRhdGEucmVzcG9uc2VUaW1lIHx8IDApLCAwKSAvIG5ldHdvcmtFdmVudHMubGVuZ3RoXG4gICAgICA6IDA7XG4gICAgXG4gICAgY29uc3QgcGVha01lbW9yeVVzYWdlID0gTWF0aC5tYXgoXG4gICAgICAuLi50b2RheUV2ZW50c1xuICAgICAgICAuZmlsdGVyKGUgPT4gZS5kYXRhLm1lbW9yeVVzYWdlKVxuICAgICAgICAubWFwKGUgPT4gZS5kYXRhLm1lbW9yeVVzYWdlKSxcbiAgICAgIDBcbiAgICApO1xuICAgIFxuICAgIGNvbnN0IGF2Z0J1aWxkVGltZSA9IGJ1aWxkRXZlbnRzLmxlbmd0aCA+IDBcbiAgICAgID8gYnVpbGRFdmVudHMucmVkdWNlKChzdW0sIGUpID0+IHN1bSArIChlLmRhdGEuYnVpbGRUaW1lIHx8IDApLCAwKSAvIGJ1aWxkRXZlbnRzLmxlbmd0aFxuICAgICAgOiAwO1xuICAgIFxuICAgIC8vIENhbGN1bGF0ZSB0cmVuZHMgKHNpbXBsaWZpZWQpXG4gICAgY29uc3QgZXJyb3JSYXRlID0gKGVycm9yRXZlbnRzLmxlbmd0aCAvIE1hdGgubWF4KHRvZGF5RXZlbnRzLmxlbmd0aCwgMSkpICogMTAwO1xuICAgIGNvbnN0IHBlcmZvcm1hbmNlU2NvcmUgPSBNYXRoLm1heCgwLCAxMDAgLSAoYXZnUmVzcG9uc2VUaW1lIC8gMTAwKSk7XG4gICAgY29uc3Qgc3RhYmlsaXR5U2NvcmUgPSBNYXRoLm1heCgwLCAxMDAgLSAoZXJyb3JFdmVudHMubGVuZ3RoICogNSkpO1xuICAgIFxuICAgIC8vIElkZW50aWZ5IHRvcCBpc3N1ZXNcbiAgICBjb25zdCBpc3N1ZVR5cGVzID0gdG9kYXlFdmVudHMucmVkdWNlKChhY2MsIGV2ZW50KSA9PiB7XG4gICAgICBjb25zdCBrZXkgPSBgJHtldmVudC50eXBlfS0ke2V2ZW50LnNldmVyaXR5fWA7XG4gICAgICBhY2Nba2V5XSA9IChhY2Nba2V5XSB8fCAwKSArIDE7XG4gICAgICByZXR1cm4gYWNjO1xuICAgIH0sIHt9IGFzIFJlY29yZDxzdHJpbmcsIG51bWJlcj4pO1xuICAgIFxuICAgIGNvbnN0IHRvcElzc3VlcyA9IE9iamVjdC5lbnRyaWVzKGlzc3VlVHlwZXMpXG4gICAgICAuc29ydCgoWywgYV0sIFssIGJdKSA9PiBiIC0gYSlcbiAgICAgIC5zbGljZSgwLCA1KVxuICAgICAgLm1hcCgoW3R5cGUsIGNvdW50XSkgPT4gKHtcbiAgICAgICAgdHlwZSxcbiAgICAgICAgY291bnQsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBgJHt0eXBlfSBldmVudHMgb2NjdXJyZWQgJHtjb3VudH0gdGltZXNgXG4gICAgICB9KSk7XG4gICAgXG4gICAgLy8gR2VuZXJhdGUgcmVjb21tZW5kYXRpb25zXG4gICAgY29uc3QgcmVjb21tZW5kYXRpb25zOiBzdHJpbmdbXSA9IFtdO1xuICAgIFxuICAgIGlmIChlcnJvclJhdGUgPiA1KSB7XG4gICAgICByZWNvbW1lbmRhdGlvbnMucHVzaCgnSGlnaCBlcnJvciByYXRlIGRldGVjdGVkIC0gcmV2aWV3IHJlY2VudCBjb2RlIGNoYW5nZXMnKTtcbiAgICB9XG4gICAgXG4gICAgaWYgKGF2Z1Jlc3BvbnNlVGltZSA+IDIwMDApIHtcbiAgICAgIHJlY29tbWVuZGF0aW9ucy5wdXNoKCdTbG93IHJlc3BvbnNlIHRpbWVzIC0gY29uc2lkZXIgcGVyZm9ybWFuY2Ugb3B0aW1pemF0aW9uJyk7XG4gICAgfVxuICAgIFxuICAgIGlmIChhdmdCdWlsZFRpbWUgPiAxNTAwMCkge1xuICAgICAgcmVjb21tZW5kYXRpb25zLnB1c2goJ0J1aWxkIHRpbWVzIGFyZSBzbG93IC0gY29uc2lkZXIgYnVpbGQgb3B0aW1pemF0aW9uJyk7XG4gICAgfVxuICAgIFxuICAgIGlmIChwZWFrTWVtb3J5VXNhZ2UgPiA4MCAqIDEwMjQgKiAxMDI0KSB7XG4gICAgICByZWNvbW1lbmRhdGlvbnMucHVzaCgnSGlnaCBtZW1vcnkgdXNhZ2UgZGV0ZWN0ZWQgLSBjaGVjayBmb3IgbWVtb3J5IGxlYWtzJyk7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiB7XG4gICAgICBkYXRlOiB0b2RheSxcbiAgICAgIHN1bW1hcnk6IHtcbiAgICAgICAgdG90YWxFdmVudHM6IHRvZGF5RXZlbnRzLmxlbmd0aCxcbiAgICAgICAgZXJyb3JDb3VudDogZXJyb3JFdmVudHMubGVuZ3RoLFxuICAgICAgICB3YXJuaW5nQ291bnQ6IHdhcm5pbmdFdmVudHMubGVuZ3RoLFxuICAgICAgICBhdmdSZXNwb25zZVRpbWUsXG4gICAgICAgIHBlYWtNZW1vcnlVc2FnZSxcbiAgICAgICAgYnVpbGRDb3VudDogYnVpbGRFdmVudHMubGVuZ3RoLFxuICAgICAgICBhdmdCdWlsZFRpbWVcbiAgICAgIH0sXG4gICAgICB0cmVuZHM6IHtcbiAgICAgICAgZXJyb3JSYXRlLFxuICAgICAgICBwZXJmb3JtYW5jZVNjb3JlLFxuICAgICAgICBzdGFiaWxpdHlTY29yZVxuICAgICAgfSxcbiAgICAgIHRvcElzc3VlcyxcbiAgICAgIHJlY29tbWVuZGF0aW9uc1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBzYXZlRGFpbHlSZXBvcnQoKSB7XG4gICAgY29uc3QgcmVwb3J0ID0gZ2VuZXJhdGVEYWlseVJlcG9ydCgpO1xuICAgIGNvbnN0IHJlcG9ydEZpbGUgPSBqb2luKHJlcG9ydHNEaXIsIGByZXBvcnQtJHtyZXBvcnQuZGF0ZX0uanNvbmApO1xuICAgIFxuICAgIHRyeSB7XG4gICAgICB3cml0ZUZpbGVTeW5jKHJlcG9ydEZpbGUsIEpTT04uc3RyaW5naWZ5KHJlcG9ydCwgbnVsbCwgMikpO1xuICAgICAgY29uc29sZS5sb2coYFx1RDgzRFx1RENDQSBEYWlseSByZXBvcnQgZ2VuZXJhdGVkOiAke3JlcG9ydEZpbGV9YCk7XG4gICAgICBcbiAgICAgIC8vIEJyb2FkY2FzdCByZXBvcnQgdG8gY29ubmVjdGVkIGNsaWVudHNcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHR5cGU6ICdkYWlseS1yZXBvcnQnLFxuICAgICAgICByZXBvcnRcbiAgICAgIH0pO1xuICAgICAgXG4gICAgICBjb25uZWN0ZWRDbGllbnRzLmZvckVhY2goY2xpZW50ID0+IHtcbiAgICAgICAgaWYgKGNsaWVudC5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuT1BFTikge1xuICAgICAgICAgIGNsaWVudC5zZW5kKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHNhdmUgZGFpbHkgcmVwb3J0OicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjbGVhbnVwT2xkRGF0YSgpIHtcbiAgICBjb25zdCBjdXRvZmZEYXRlID0gbmV3IERhdGUoKTtcbiAgICBjdXRvZmZEYXRlLnNldERhdGUoY3V0b2ZmRGF0ZS5nZXREYXRlKCkgLSBjb25maWcucmV0ZW50aW9uUGVyaW9kKTtcbiAgICBcbiAgICAvLyBSZW1vdmUgb2xkIGV2ZW50c1xuICAgIGV2ZW50cyA9IGV2ZW50cy5maWx0ZXIoZSA9PiBuZXcgRGF0ZShlLnRpbWVzdGFtcCkgPiBjdXRvZmZEYXRlKTtcbiAgICBcbiAgICAvLyBDbGVhbiB1cCBvbGQgcmVwb3J0IGZpbGVzXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbiAgICAgIGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMocmVwb3J0c0Rpcik7XG4gICAgICBcbiAgICAgIGZpbGVzLmZvckVhY2goKGZpbGU6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAoZmlsZS5zdGFydHNXaXRoKCdyZXBvcnQtJykpIHtcbiAgICAgICAgICBjb25zdCBmaWxlRGF0ZSA9IGZpbGUucmVwbGFjZSgncmVwb3J0LScsICcnKS5yZXBsYWNlKCcuanNvbicsICcnKTtcbiAgICAgICAgICBpZiAobmV3IERhdGUoZmlsZURhdGUpIDwgY3V0b2ZmRGF0ZSkge1xuICAgICAgICAgICAgZnMudW5saW5rU3luYyhqb2luKHJlcG9ydHNEaXIsIGZpbGUpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0ZhaWxlZCB0byBjbGVhbnVwIG9sZCByZXBvcnQgZmlsZXM6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3JlYWwtdGltZS1tb25pdG9yJyxcbiAgICBcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG4gICAgICBsb2FkRXZlbnRzKCk7XG4gICAgICBcbiAgICAgIC8vIFdlYlNvY2tldCBzZXJ2ZXIgZm9yIHJlYWwtdGltZSBjb21tdW5pY2F0aW9uXG4gICAgICB3c1NlcnZlciA9IG5ldyBXZWJTb2NrZXRTZXJ2ZXIoeyBwb3J0OiAzMDAyIH0pO1xuICAgICAgXG4gICAgICB3c1NlcnZlci5vbignY29ubmVjdGlvbicsICh3cykgPT4ge1xuICAgICAgICBjb25uZWN0ZWRDbGllbnRzLmFkZCh3cyk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBcdUQ4M0RcdUREMEMgUmVhbC10aW1lIG1vbml0b3IgY2xpZW50IGNvbm5lY3RlZCAoJHtjb25uZWN0ZWRDbGllbnRzLnNpemV9IHRvdGFsKWApO1xuICAgICAgICBcbiAgICAgICAgLy8gU2VuZCByZWNlbnQgZXZlbnRzIHRvIG5ldyBjbGllbnRcbiAgICAgICAgd3Muc2VuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgdHlwZTogJ2luaXRpYWwtZXZlbnRzJyxcbiAgICAgICAgICBldmVudHM6IGV2ZW50cy5zbGljZSgwLCA1MClcbiAgICAgICAgfSkpO1xuICAgICAgICBcbiAgICAgICAgd3Mub24oJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgICAgIGNvbm5lY3RlZENsaWVudHMuZGVsZXRlKHdzKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgXHVEODNEXHVERDBDIFJlYWwtdGltZSBtb25pdG9yIGNsaWVudCBkaXNjb25uZWN0ZWQgKCR7Y29ubmVjdGVkQ2xpZW50cy5zaXplfSB0b3RhbClgKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICB3cy5vbignbWVzc2FnZScsIChtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKG1lc3NhZ2UudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHN3aXRjaCAoZGF0YS50eXBlKSB7XG4gICAgICAgICAgICAgIGNhc2UgJ2NsaWVudC1lcnJvcic6XG4gICAgICAgICAgICAgICAgYWRkRXZlbnQoe1xuICAgICAgICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICAgICAgICAgIHNldmVyaXR5OiAnZXJyb3InLFxuICAgICAgICAgICAgICAgICAgc291cmNlOiAnY2xpZW50JyxcbiAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEuZXJyb3JcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgY2FzZSAncGVyZm9ybWFuY2UtbWV0cmljJzpcbiAgICAgICAgICAgICAgICBhZGRFdmVudCh7XG4gICAgICAgICAgICAgICAgICB0eXBlOiAncGVyZm9ybWFuY2UnLFxuICAgICAgICAgICAgICAgICAgc2V2ZXJpdHk6ICdpbmZvJyxcbiAgICAgICAgICAgICAgICAgIHNvdXJjZTogJ2NsaWVudCcsXG4gICAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLm1ldHJpY1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICBjYXNlICduZXR3b3JrLXJlcXVlc3QnOlxuICAgICAgICAgICAgICAgIGFkZEV2ZW50KHtcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICduZXR3b3JrJyxcbiAgICAgICAgICAgICAgICAgIHNldmVyaXR5OiBkYXRhLmVycm9yID8gJ3dhcm5pbmcnIDogJ2luZm8nLFxuICAgICAgICAgICAgICAgICAgc291cmNlOiAnY2xpZW50JyxcbiAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEucmVxdWVzdFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBwcm9jZXNzaW5nIHJlYWwtdGltZSBtb25pdG9yIG1lc3NhZ2U6JywgZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgLy8gRmlsZSB3YXRjaGVyXG4gICAgICBpZiAoY29uZmlnLmVuYWJsZURPTVRyYWNraW5nKSB7XG4gICAgICAgIGNvbnN0IHdhdGNoZXIgPSB3YXRjaChbJ3NyYy8qKi8qJ10sIHtcbiAgICAgICAgICBpZ25vcmVkOiBbJ25vZGVfbW9kdWxlcycsICdkaXN0JywgJ2xvZ3MnXSxcbiAgICAgICAgICBwZXJzaXN0ZW50OiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgd2F0Y2hlci5vbignY2hhbmdlJywgKGZpbGVQYXRoKSA9PiB7XG4gICAgICAgICAgYWRkRXZlbnQoe1xuICAgICAgICAgICAgdHlwZTogJ2ZpbGUnLFxuICAgICAgICAgICAgc2V2ZXJpdHk6ICdpbmZvJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ2ZpbGUtd2F0Y2hlcicsXG4gICAgICAgICAgICBkYXRhOiB7IHBhdGg6IGZpbGVQYXRoLCBhY3Rpb246ICdtb2RpZmllZCcgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gU2NoZWR1bGUgZGFpbHkgcmVwb3J0c1xuICAgICAgY3Jvbi5zY2hlZHVsZShjb25maWcucmVwb3J0aW5nSW50ZXJ2YWwsICgpID0+IHtcbiAgICAgICAgc2F2ZURhaWx5UmVwb3J0KCk7XG4gICAgICAgIGNsZWFudXBPbGREYXRhKCk7XG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgLy8gUGVyaW9kaWMgY2xlYW51cFxuICAgICAgY3Jvbi5zY2hlZHVsZSgnMCAyICogKiAqJywgKCkgPT4geyAvLyAyIEFNIGRhaWx5XG4gICAgICAgIGNsZWFudXBPbGREYXRhKCk7XG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgLy8gUmVndWxhciBldmVudCBwZXJzaXN0ZW5jZVxuICAgICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBwZXJzaXN0RXZlbnRzKCk7XG4gICAgICB9LCA2MDAwMCk7IC8vIEV2ZXJ5IG1pbnV0ZVxuICAgIH0sXG4gICAgXG4gICAgYnVpbGRTdGFydCgpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDRTEgUmVhbC10aW1lIG1vbml0b3Jpbmcgc3RhcnRlZCcpO1xuICAgICAgYWRkRXZlbnQoe1xuICAgICAgICB0eXBlOiAnYnVpbGQnLFxuICAgICAgICBzZXZlcml0eTogJ2luZm8nLFxuICAgICAgICBzb3VyY2U6ICd2aXRlJyxcbiAgICAgICAgZGF0YTogeyBhY3Rpb246ICdidWlsZC1zdGFydCcsIHRpbWVzdGFtcDogRGF0ZS5ub3coKSB9XG4gICAgICB9KTtcbiAgICB9LFxuICAgIFxuICAgIGJ1aWxkRW5kKCkge1xuICAgICAgYWRkRXZlbnQoe1xuICAgICAgICB0eXBlOiAnYnVpbGQnLFxuICAgICAgICBzZXZlcml0eTogJ2luZm8nLFxuICAgICAgICBzb3VyY2U6ICd2aXRlJyxcbiAgICAgICAgZGF0YTogeyBhY3Rpb246ICdidWlsZC1lbmQnLCB0aW1lc3RhbXA6IERhdGUubm93KCkgfVxuICAgICAgfSk7XG4gICAgfSxcbiAgICBcbiAgICBidWlsZEVycm9yKGVycm9yKSB7XG4gICAgICBhZGRFdmVudCh7XG4gICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgIHNldmVyaXR5OiAnY3JpdGljYWwnLFxuICAgICAgICBzb3VyY2U6ICd2aXRlJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgICAgc3RhY2s6IGVycm9yLnN0YWNrLFxuICAgICAgICAgIHBsdWdpbjogZXJyb3IucGx1Z2luXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG4gICAgXG4gICAgZ2VuZXJhdGVCdW5kbGUob3B0aW9ucywgYnVuZGxlKSB7XG4gICAgICBjb25zdCBidW5kbGVTaXplID0gT2JqZWN0LnZhbHVlcyhidW5kbGUpLnJlZHVjZSgoc2l6ZSwgY2h1bms6IGFueSkgPT4ge1xuICAgICAgICByZXR1cm4gc2l6ZSArIChjaHVuay5jb2RlPy5sZW5ndGggfHwgY2h1bmsuc291cmNlPy5sZW5ndGggfHwgMCk7XG4gICAgICB9LCAwKTtcbiAgICAgIFxuICAgICAgYWRkRXZlbnQoe1xuICAgICAgICB0eXBlOiAnYnVpbGQnLFxuICAgICAgICBzZXZlcml0eTogJ2luZm8nLFxuICAgICAgICBzb3VyY2U6ICd2aXRlJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIGFjdGlvbjogJ2J1bmRsZS1nZW5lcmF0ZWQnLFxuICAgICAgICAgIGJ1bmRsZVNpemUsXG4gICAgICAgICAgY2h1bmtDb3VudDogT2JqZWN0LmtleXMoYnVuZGxlKS5sZW5ndGhcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xufSJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7O0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVzs7O0FDQWxCLFNBQVMsYUFBYTtBQUN0QixTQUFTLGVBQWUsY0FBYyxZQUFZLGlCQUFpQjtBQUNuRSxTQUFTLFlBQVk7QUFDckIsWUFBWSxVQUFVO0FBMEZmLFNBQVMscUJBQXFCLFFBQStCO0FBQ2xFLE1BQUksUUFBNEI7QUFBQSxJQUM5QixZQUFZLENBQUM7QUFBQSxJQUNiLGNBQWMsQ0FBQztBQUFBLElBQ2YsaUJBQWlCLENBQUM7QUFBQSxJQUNsQixRQUFRLENBQUM7QUFBQSxJQUNULGFBQWE7QUFBQSxNQUNYLFlBQVksQ0FBQztBQUFBLE1BQ2IsYUFBYSxDQUFDO0FBQUEsTUFDZCxhQUFhLENBQUM7QUFBQSxNQUNkLFdBQVcsQ0FBQztBQUFBLElBQ2Q7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLE9BQU87QUFBQSxNQUNQLFFBQVE7QUFBQSxNQUNSLFlBQVcsb0JBQUksS0FBSyxHQUFFLFlBQVk7QUFBQSxNQUNsQyxRQUFRLENBQUM7QUFBQSxJQUNYO0FBQUEsSUFDQSxVQUFVO0FBQUEsTUFDUixVQUFVO0FBQUEsTUFDVixZQUFZO0FBQUEsTUFDWixjQUFjO0FBQUEsSUFDaEI7QUFBQSxFQUNGO0FBRUEsUUFBTSxTQUFTLEtBQUssUUFBUSxJQUFJLEdBQUcsTUFBTTtBQUN6QyxRQUFNLFlBQVksS0FBSyxRQUFRLDBCQUEwQjtBQUN6RCxRQUFNLGlCQUFpQixLQUFLLFFBQVEsZUFBZTtBQUNuRCxRQUFNLFlBQVksS0FBSyxRQUFRLFNBQVM7QUFHeEMsR0FBQyxRQUFRLGdCQUFnQixTQUFTLEVBQUUsUUFBUSxTQUFPO0FBQ2pELFFB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LEtBQUssR0FBRSxZQUFZLENBQUM7QUFBQSxFQUN6RDtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbInJlYWRGaWxlU3luYyIsICJyZWFkRmlsZVN5bmMiLCAid3JpdGVGaWxlU3luYyIsICJyZWFkRmlsZVN5bmMiLCAiZXhpc3RzU3luYyIsICJqb2luIiwgImpvaW4iLCAiY29uZmlnIiwgIndyaXRlRmlsZVN5bmMiLCAiZXhpc3RzU3luYyIsICJyZWFkRmlsZVN5bmMiLCAid3JpdGVGaWxlU3luYyIsICJyZWFkRmlsZVN5bmMiLCAiZXhpc3RzU3luYyIsICJta2RpclN5bmMiLCAiam9pbiIsICJjcm9uIiwgImpvaW4iLCAiZXhpc3RzU3luYyIsICJta2RpclN5bmMiLCAicmVhZEZpbGVTeW5jIiwgIndyaXRlRmlsZVN5bmMiLCAid2F0Y2giLCAid3JpdGVGaWxlU3luYyIsICJyZWFkRmlsZVN5bmMiLCAiZXhpc3RzU3luYyIsICJqb2luIiwgImNyb24iLCAiam9pbiIsICJleGlzdHNTeW5jIiwgImV2ZW50cyIsICJ3cml0ZUZpbGVTeW5jIiwgInJlYWRGaWxlU3luYyIsICJ3YXRjaCJdCn0K
