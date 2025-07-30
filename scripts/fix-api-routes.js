const fs = require('fs');
const path = require('path');

// List of API route files that need fixing
const apiRoutes = [
  'app/api/admin/bookings/route.ts',
  'app/api/admin/drivers/route.ts',
  'app/api/admin/driver-assignments/route.ts',
  'app/api/admin/airport-pickup-bookings/route.ts',
  'app/api/admin/stats/route.ts',
  'app/api/admin/tours/route.ts',
  'app/api/admin/images/route.ts',
  'app/api/admin/content/route.ts',
  'app/api/admin/customer-analytics/route.ts',
  'app/api/destinations/route.ts',
  'app/api/test-airport-pickup/route.ts',
];

function fixApiRoute(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Remove createErrorResponse from imports
  if (content.includes('createErrorResponse')) {
    content = content.replace(
      /import\s*{\s*([^}]*createErrorResponse[^}]*)\s*}\s*from\s*['"]@\/lib\/utils\/error-handling['"];?/g,
      (match, imports) => {
        const newImports = imports
          .split(',')
          .map(imp => imp.trim())
          .filter(imp => !imp.includes('createErrorResponse'))
          .join(', ');
        return `import { ${newImports} } from '@/lib/utils/error-handling';`;
      }
    );
    modified = true;
  }

  // Replace createErrorResponse calls with NextResponse.json
  content = content.replace(
    /createErrorResponse\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"](?:\s*,\s*([^)]+))?\s*\)/g,
    (match, errorCode, message, details) => {
      const errorObj = details ? 
        `{ success: false, error: '${message}', details: ${details} }` :
        `{ success: false, error: '${message}' }`;
      return errorObj;
    }
  );

  // Replace return statements that wrap createErrorResponse
  content = content.replace(
    /return\s+NextResponse\.json\s*\(\s*createErrorResponse\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"](?:\s*,\s*([^)]+))?\s*\)\s*,\s*{\s*status:\s*(\d+)\s*}\s*\)/g,
    (match, errorCode, message, details, status) => {
      const errorObj = details ? 
        `{ success: false, error: '${message}', details: ${details} }` :
        `{ success: false, error: '${message}' }`;
      return `return NextResponse.json(${errorObj}, { status: ${status} })`;
    }
  );

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
  } else {
    console.log(`No changes needed: ${filePath}`);
  }
}

// Fix all API routes
console.log('Fixing API routes...');
apiRoutes.forEach(fixApiRoute);
console.log('API route fixes completed!'); 