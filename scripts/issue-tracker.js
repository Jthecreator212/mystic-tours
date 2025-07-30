const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class IssueTracker {
  constructor() {
    this.issuesFile = path.join(process.cwd(), 'data', 'issue-tracker.json');
    this.memoriesFile = path.join(process.cwd(), 'data', 'issue-memories.json');
    this.issues = new Map();
    this.loadIssues();
  }

  loadIssues() {
    try {
      if (fs.existsSync(this.issuesFile)) {
        const data = JSON.parse(fs.readFileSync(this.issuesFile, 'utf8'));
        this.issues = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Error loading issues:', error);
    }
  }

  saveIssues() {
    try {
      const dataDir = path.dirname(this.issuesFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      const issuesObject = Object.fromEntries(this.issues);
      fs.writeFileSync(this.issuesFile, JSON.stringify(issuesObject, null, 2));
    } catch (error) {
      console.error('Error saving issues:', error);
    }
  }

  generateIssueId(errorMessage, filePath) {
    const hash = crypto.createHash('md5')
      .update(`${errorMessage}:${filePath}`)
      .digest('hex');
    return hash.substring(0, 8);
  }

  categorizeIssue(errorMessage) {
    const message = errorMessage.toLowerCase();
    
    if (message.includes('build') || message.includes('compilation')) return 'build_errors';
    if (message.includes('lint') || message.includes('eslint')) return 'linter_errors';
    if (message.includes('runtime') || message.includes('uncaught')) return 'runtime_errors';
    if (message.includes('database') || message.includes('sql') || message.includes('table')) return 'database_errors';
    if (message.includes('api') || message.includes('fetch') || message.includes('http')) return 'api_errors';
    if (message.includes('permission') || message.includes('access')) return 'permission_errors';
    if (message.includes('import') || message.includes('module')) return 'import_errors';
    if (message.includes('type') || message.includes('typescript')) return 'type_errors';
    if (message.includes('validation') || message.includes('schema')) return 'validation_errors';
    
    return 'unknown_error';
  }

  determineSeverity(issueType, errorMessage) {
    const message = errorMessage.toLowerCase();
    
    // Critical: Build failures, database corruption, security issues
    if (message.includes('build failed') || message.includes('database corruption') || message.includes('security')) {
      return 'critical';
    }
    
    // High: Runtime errors, API failures, data loss
    if (issueType === 'runtime_errors' || issueType === 'api_errors' || message.includes('data loss')) {
      return 'high';
    }
    
    // Medium: Linter errors, type errors, validation issues
    if (issueType === 'linter_errors' || issueType === 'type_errors' || issueType === 'validation_errors') {
      return 'medium';
    }
    
    return 'low';
  }

  trackIssue(errorMessage, filePath, lineNumber, solution, rootCause) {
    const issueId = this.generateIssueId(errorMessage, filePath);
    const issueType = this.categorizeIssue(errorMessage);
    const severity = this.determineSeverity(issueType, errorMessage);
    const now = new Date().toISOString();

    const existingIssue = this.issues.get(issueId);

    if (existingIssue) {
      // Update existing issue
      existingIssue.occurrence_count++;
      existingIssue.last_occurrence = now;
      if (solution) existingIssue.solution_applied = solution;
      if (rootCause) existingIssue.root_cause = rootCause;

      this.issues.set(issueId, existingIssue);
      this.saveIssues();

      const shouldCreateMemory = existingIssue.occurrence_count >= 2;

      return {
        isRepeated: true,
        shouldCreateMemory,
        issueId
      };
    } else {
      // Create new issue
      const newIssue = {
        id: issueId,
        issue_type: issueType,
        error_message: errorMessage,
        file_path: filePath,
        line_number: lineNumber,
        first_occurrence: now,
        occurrence_count: 1,
        last_occurrence: now,
        root_cause: rootCause,
        solution_applied: solution,
        prevention_measures: this.getPreventionMeasures(issueType),
        severity,
        environment_context: `${process.platform} ${process.version}`,
        related_files: [filePath]
      };

      this.issues.set(issueId, newIssue);
      this.saveIssues();

      return {
        isRepeated: false,
        shouldCreateMemory: false,
        issueId
      };
    }
  }

  getPreventionMeasures(issueType) {
    const preventionRules = {
      build_errors: [
        'Always run "pnpm lint" before committing',
        'Use TypeScript strict mode',
        'Add proper error boundaries',
        'Validate environment variables'
      ],
      linter_errors: [
        'Use ESLint auto-fix before committing',
        'Add proper TypeScript types',
        'Follow consistent naming conventions',
        'Use proper import statements'
      ],
      runtime_errors: [
        'Add comprehensive error handling',
        'Use try-catch blocks',
        'Validate user inputs',
        'Add proper fallbacks'
      ],
      database_errors: [
        'Add database connection pooling',
        'Use proper transaction handling',
        'Validate data before insertion',
        'Add database constraints'
      ],
      api_errors: [
        'Add proper HTTP status codes',
        'Use consistent error response format',
        'Add input validation',
        'Implement rate limiting'
      ],
      permission_errors: [
        'Check file permissions before operations',
        'Use proper error handling for file operations',
        'Validate user permissions',
        'Add proper access controls'
      ],
      import_errors: [
        'Use proper import statements',
        'Check file paths and extensions',
        'Update import paths when moving files',
        'Use index.ts files for clean imports'
      ],
      type_errors: [
        'Add proper TypeScript types',
        'Use strict TypeScript configuration',
        'Add type guards where needed',
        'Use proper interface definitions'
      ],
      validation_errors: [
        'Add input validation with Zod',
        'Validate data at both client and server',
        'Add proper error messages',
        'Use consistent validation patterns'
      ]
    };

    return preventionRules[issueType] || [
      'Add proper error handling',
      'Document the issue',
      'Create automated tests'
    ];
  }

  createMemory(issueId) {
    const issue = this.issues.get(issueId);
    if (!issue || issue.occurrence_count < 2) return null;

    const memory = {
      id: `memory_${issueId}`,
      title: `Repeated ${issue.issue_type.replace('_', ' ')}: ${issue.error_message.substring(0, 50)}...`,
      content: this.generateMemoryContent(issue),
      tags: [issue.issue_type, 'repeated_issue', 'prevention_needed'],
      created_at: new Date().toISOString(),
      issue_type: issue.issue_type,
      occurrence_count: issue.occurrence_count,
      prevention_strategy: issue.prevention_measures
    };

    this.saveMemory(memory);
    return memory;
  }

  generateMemoryContent(issue) {
    const timeframe = this.getTimeframe(issue.first_occurrence, issue.last_occurrence);

    return `
**Repeated Issue Detected**

**Error Type:** ${issue.issue_type.replace('_', ' ')}
**Occurrences:** ${issue.occurrence_count} times in ${timeframe}
**File:** ${issue.file_path}${issue.line_number ? `:${issue.line_number}` : ''}
**Error Message:** ${issue.error_message}

**Root Cause:** ${issue.root_cause || 'Not analyzed yet'}
**Solution Applied:** ${issue.solution_applied || 'No solution applied yet'}
**Severity:** ${issue.severity.toUpperCase()}

**Prevention Measures:**
${issue.prevention_measures.map(measure => `- ${measure}`).join('\n')}

**Environment:** ${issue.environment_context}
**Related Files:** ${issue.related_files.join(', ')}

**Action Required:** Implement prevention measures to avoid future occurrences.
    `.trim();
  }

  getTimeframe(first, last) {
    const firstDate = new Date(first);
    const lastDate = new Date(last);
    const diffDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'same day';
    if (diffDays === 1) return '1 day';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
    return `${Math.ceil(diffDays / 30)} months`;
  }

  saveMemory(memory) {
    try {
      const dataDir = path.dirname(this.memoriesFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      let memories = [];
      if (fs.existsSync(this.memoriesFile)) {
        memories = JSON.parse(fs.readFileSync(this.memoriesFile, 'utf8'));
      }

      memories.push(memory);
      fs.writeFileSync(this.memoriesFile, JSON.stringify(memories, null, 2));

      console.log(`✅ Memory created for repeated issue: ${memory.title}`);
    } catch (error) {
      console.error('Error saving memory:', error);
    }
  }

  getRepeatedIssues() {
    return Array.from(this.issues.values()).filter(issue => issue.occurrence_count >= 2);
  }

  getIssueStats() {
    const issues = Array.from(this.issues.values());
    const repeated = issues.filter(issue => issue.occurrence_count >= 2);

    const byType = {};
    issues.forEach(issue => {
      byType[issue.issue_type] = (byType[issue.issue_type] || 0) + 1;
    });

    return {
      total: issues.length,
      repeated: repeated.length,
      byType
    };
  }
}

module.exports = IssueTracker; 