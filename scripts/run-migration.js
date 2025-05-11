// This script compiles and runs the TypeScript migration script
const { execSync } = require('child_process');
const path = require('path');

console.log('Compiling TypeScript migration script...');
try {
  // Compile the TypeScript file
  execSync('npx tsc --esModuleInterop scripts/migrate-data.ts', { stdio: 'inherit' });
  
  console.log('Running migration script...');
  // Run the compiled JavaScript file
  execSync('node scripts/migrate-data.js', { stdio: 'inherit' });
  
  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Error during migration:', error.message);
  process.exit(1);
}
