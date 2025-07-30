#!/usr/bin/env node

const IssueTracker = require('./issue-tracker.js');

/**
 * CLI script to track issues and create memories for repeated problems
 *
 * Usage:
 * node scripts/track-issue.js "error message" "file path" [line number] [solution] [root cause]
 *
 * Examples:
 * node scripts/track-issue.js "EPERM: operation not permitted" "next.config.mjs" "" "Killed Node processes" "Multiple Node processes"
 * node scripts/track-issue.js "Property 'VALIDATION_ERROR' does not exist" "app/actions/booking-actions.ts" "15" "Fixed error code name" "Incorrect ERROR_CODES reference"
 */

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
🔍 **ISSUE TRACKER CLI**

Track issues and automatically create memories for repeated problems.

Usage:
  node scripts/track-issue.js "error message" "file path" [line number] [solution] [root cause]

Examples:
  node scripts/track-issue.js "EPERM: operation not permitted" "next.config.mjs" "" "Killed Node processes" "Multiple Node processes"
  node scripts/track-issue.js "Property 'VALIDATION_ERROR' does not exist" "app/actions/booking-actions.ts" "15" "Fixed error code name" "Incorrect ERROR_CODES reference"

Options:
  -s, --stats    Show issue statistics
  -m, --memories Show recent memories
  -h, --help     Show this help message
    `);
    return;
  }

  const tracker = new IssueTracker();

  // Handle special commands
  if (args[0] === '--stats' || args[0] === '-s') {
    const stats = tracker.getIssueStats();
    console.log('\n📊 **ISSUE STATISTICS**');
    console.log(`Total Issues: ${stats.total}`);
    console.log(`Repeated Issues: ${stats.repeated}`);
    console.log('\n**By Type:**');
    Object.entries(stats.byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    return;
  }

  if (args[0] === '--memories' || args[0] === '-m') {
    const fs = require('fs');
    const path = require('path');
    const memoriesFile = path.join(process.cwd(), 'data', 'issue-memories.json');

    if (fs.existsSync(memoriesFile)) {
      const memories = JSON.parse(fs.readFileSync(memoriesFile, 'utf8'));
      console.log('\n🧠 **RECENT MEMORIES**');
      memories.slice(-5).forEach(memory => {
        console.log(`\n**${memory.title}**`);
        console.log(`Created: ${new Date(memory.created_at).toLocaleDateString()}`);
        console.log(`Occurrences: ${memory.occurrence_count}`);
        console.log(`Type: ${memory.issue_type}`);
      });
    } else {
      console.log('No memories found yet.');
    }
    return;
  }

  if (args[0] === '--help' || args[0] === '-h') {
    console.log(`
🔍 **ISSUE TRACKER CLI**

Track issues and automatically create memories for repeated problems.

Usage:
  node scripts/track-issue.js "error message" "file path" [line number] [solution] [root cause]

Examples:
  node scripts/track-issue.js "EPERM: operation not permitted" "next.config.mjs" "" "Killed Node processes" "Multiple Node processes"
  node scripts/track-issue.js "Property 'VALIDATION_ERROR' does not exist" "app/actions/booking-actions.ts" "15" "Fixed error code name" "Incorrect ERROR_CODES reference"

Options:
  -s, --stats    Show issue statistics
  -m, --memories Show recent memories
  -h, --help     Show this help message
    `);
    return;
  }

  // Parse arguments
  const [errorMessage, filePath, lineNumber, solution, rootCause] = args;

  if (!errorMessage || !filePath) {
    console.error('❌ Error: error message and file path are required');
    process.exit(1);
  }

  // Track the issue
  const result = tracker.trackIssue(
    errorMessage,
    filePath,
    lineNumber ? parseInt(lineNumber) : undefined,
    solution,
    rootCause
  );

  // Display results
  console.log('\n🔍 **ISSUE TRACKED**');
  console.log(`File: ${filePath}`);
  console.log(`Error: ${errorMessage}`);
  console.log(`Repeated: ${result.isRepeated ? 'Yes' : 'No'}`);
  console.log(`Occurrences: ${result.isRepeated ? 'Multiple' : 'First time'}`);

  if (result.shouldCreateMemory) {
    const memory = tracker.createMemory(result.issueId);
    if (memory) {
      console.log('\n🧠 **MEMORY CREATED**');
      console.log(`Title: ${memory.title}`);
      console.log(`Type: ${memory.issue_type}`);
      console.log(`Occurrences: ${memory.occurrence_count}`);
      console.log('\n**Prevention Strategy:**');
      memory.prevention_strategy.forEach(strategy => {
        console.log(`  - ${strategy}`);
      });
    }
  }

  // Show quick stats
  const stats = tracker.getIssueStats();
  console.log(`\n📊 **QUICK STATS**`);
  console.log(`Total Issues: ${stats.total}`);
  console.log(`Repeated Issues: ${stats.repeated}`);
}

// Run the script
main().catch(console.error); 