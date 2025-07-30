const fs = require('fs');
const path = require('path');

// List of files with unused variable issues
const filesToFix = [
  'app/api/admin/drivers/route.ts',
  'app/api/admin/images/route.ts',
  'app/api/admin/stats/route.ts',
  'app/api/admin/tours/route.ts',
  'app/api/destinations/route.ts',
  'app/api/health/route.ts',
  'app/api/test-airport-pickup/route.ts',
  'lib/images/image-utils.ts',
  'lib/supabase/supabase.ts',
  'lib/utils/performance.ts',
];

function fixUnusedVariables(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix unused error variables in catch blocks
  content = content.replace(
    /catch\s*\(\s*(\w+)\s*\)\s*{/g,
    (match, varName) => {
      if (varName !== 'error' && varName !== '_error') {
        return `catch (_${varName}) {`;
      }
      return match;
    }
  );

  // Fix unused error variables in destructuring
  content = content.replace(
    /const\s*{\s*([^}]*)\s*}\s*=\s*await\s*supabase[^;]*;/g,
    (match, destructuring) => {
      const parts = destructuring.split(',');
      const newParts = parts.map(part => {
        const trimmed = part.trim();
        if (trimmed.includes('error:') && !trimmed.includes('dbError')) {
          return trimmed.replace('error:', 'error: dbError');
        }
        return trimmed;
      });
      return match.replace(destructuring, newParts.join(', '));
    }
  );

  // Fix unused variables in assignments
  content = content.replace(
    /const\s+(\w+)\s*=\s*createAppError[^;]*;/g,
    (match, varName) => {
      if (!content.includes(varName) || content.indexOf(varName) === content.lastIndexOf(varName)) {
        return match.replace(`const ${varName}`, '// const _unused');
      }
      return match;
    }
  );

  // Fix unused parseError variables
  content = content.replace(
    /catch\s*\(\s*parseError\s*\)\s*{/g,
    'catch (_parseError) {'
  );

  // Fix unused data variables
  content = content.replace(
    /const\s*{\s*data\s*}\s*=\s*await\s*supabase[^;]*;/g,
    (match) => {
      if (!content.includes('data') || content.indexOf('data') === content.lastIndexOf('data')) {
        return match.replace('data', '_data');
      }
      return match;
    }
  );

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
  } else {
    console.log(`No changes needed: ${filePath}`);
  }
}

// Fix all files
console.log('Fixing unused variable warnings...');
filesToFix.forEach(fixUnusedVariables);
console.log('✅ Unused variable fixes completed!'); 