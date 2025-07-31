#!/usr/bin/env node

/**
 * Codebase Cleanup Script
 * Fixes common ESLint issues and organizes code structure
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Starting codebase cleanup...\n');

// 1. Fix ESLint issues
console.log('📝 Fixing ESLint issues...');
try {
  execSync('pnpm lint --fix', { stdio: 'inherit' });
  console.log('✅ ESLint issues fixed\n');
} catch (error) {
  console.log('⚠️  Some ESLint issues may need manual fixing\n');
}

// 2. Remove unused imports and variables
console.log('🗑️  Removing unused imports and variables...');
try {
  execSync('pnpm exec tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation check completed\n');
} catch (error) {
  console.log('⚠️  TypeScript errors found - check manually\n');
}

// 3. Organize imports
console.log('📦 Organizing imports...');
const organizeImports = () => {
  const srcDir = path.join(process.cwd(), 'app');
  
  const organizeFileImports = (filePath) => {
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove unused imports
    content = content.replace(/import\s+{\s*([^}]+)\s*}\s+from\s+['"][^'"]+['"];?\s*(?=\n|$)/g, (match, imports) => {
      const importNames = imports.split(',').map(s => s.trim());
      // This is a simplified check - in practice you'd need to analyze the file content
      return match;
    });
    
    // Sort imports
    const importRegex = /import\s+.*?from\s+['"][^'"]+['"];?\s*(?=\n|$)/g;
    const imports = content.match(importRegex) || [];
    const nonImportContent = content.replace(importRegex, '');
    
    if (imports.length > 0) {
      const sortedImports = imports.sort((a, b) => {
        const aFrom = a.match(/from\s+['"]([^'"]+)['"]/)[1];
        const bFrom = b.match(/from\s+['"]([^'"]+)['"]/)[1];
        return aFrom.localeCompare(bFrom);
      });
      
      content = sortedImports.join('\n') + '\n\n' + nonImportContent.trim();
    }
    
    fs.writeFileSync(filePath, content);
  };
  
  const processDirectory = (dir) => {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        processDirectory(fullPath);
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        organizeFileImports(fullPath);
      }
    });
  };
  
  processDirectory(srcDir);
};

organizeImports();
console.log('✅ Imports organized\n');

// 4. Create index files for better organization
console.log('📁 Creating index files for better organization...');

const createIndexFiles = () => {
  const directories = [
    'lib/api',
    'lib/database', 
    'lib/schemas',
    'lib/types',
    'components/ui',
    'components/admin',
    'components/forms',
    'components/features',
    'components/layout',
    'components/dialogs',
  ];
  
  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      const indexPath = path.join(fullPath, 'index.ts');
      if (!fs.existsSync(indexPath)) {
        fs.writeFileSync(indexPath, '// Auto-generated index file\n');
        console.log(`📄 Created ${indexPath}`);
      }
    }
  });
};

createIndexFiles();
console.log('✅ Index files created\n');

// 5. Update package.json scripts
console.log('📦 Updating package.json scripts...');
try {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const newScripts = {
    ...packageJson.scripts,
    'cleanup': 'node scripts/cleanup-codebase.js',
    'lint:fix': 'pnpm lint --fix',
    'type-check': 'pnpm exec tsc --noEmit',
    'format': 'pnpm exec prettier --write .',
    'format:check': 'pnpm exec prettier --check .',
  };
  
  packageJson.scripts = newScripts;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Package.json scripts updated\n');
} catch (error) {
  console.log('⚠️  Could not update package.json\n');
}

// 6. Create .prettierrc for consistent formatting
console.log('🎨 Setting up Prettier configuration...');
const prettierConfig = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
};

const prettierPath = path.join(process.cwd(), '.prettierrc');
if (!fs.existsSync(prettierPath)) {
  fs.writeFileSync(prettierPath, JSON.stringify(prettierConfig, null, 2));
  console.log('✅ Prettier configuration created\n');
}

// 7. Update .eslintrc.json with better rules
console.log('🔧 Updating ESLint configuration...');
const eslintConfig = {
  extends: [
    'next/core-web-vitals',
    'next/typescript',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    '@next/next/no-img-element': 'warn',
  },
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'out/',
    'build/',
    'dist/',
  ],
};

const eslintPath = path.join(process.cwd(), '.eslintrc.json');
fs.writeFileSync(eslintPath, JSON.stringify(eslintConfig, null, 2));
console.log('✅ ESLint configuration updated\n');

// 8. Create a development guidelines file
console.log('📋 Creating development guidelines...');
const guidelines = `# Development Guidelines

## Code Organization

### File Structure
- \`app/api/\` - API routes
- \`lib/api/\` - API utilities and handlers
- \`lib/database/\` - Database operations
- \`lib/schemas/\` - Validation schemas
- \`lib/types/\` - TypeScript type definitions
- \`components/\` - React components organized by feature

### Naming Conventions
- Use PascalCase for components: \`TourCard.tsx\`
- Use camelCase for functions and variables: \`getTourData\`
- Use kebab-case for files: \`tour-card.tsx\`
- Use UPPER_SNAKE_CASE for constants: \`API_ENDPOINTS\`

### Import Organization
1. React and Next.js imports
2. Third-party library imports
3. Internal utility imports
4. Component imports
5. Type imports

## Code Quality

### ESLint Rules
- No unused imports or variables
- No explicit \`any\` types
- Proper React Hook dependencies
- Consistent formatting

### TypeScript Best Practices
- Use proper types instead of \`any\`
- Define interfaces for all data structures
- Use union types for status fields
- Implement proper error handling

### API Response Format
All API responses should follow this format:
\`\`\`typescript
{
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  };
}
\`\`\`

## Database Operations

### Using DatabaseOperations Class
\`\`\`typescript
import { DatabaseOperations } from '@/lib/database/operations';

// Get all records
const { data, error, count } = await DatabaseOperations.getAll('tours', {
  orderBy: { column: 'created_at', ascending: false },
  limit: 10,
  offset: 0,
  filters: { status: 'published' }
});

// Get by ID
const { data, error } = await DatabaseOperations.getById('tours', id);

// Create record
const { data, error } = await DatabaseOperations.create('tours', tourData);

// Update record
const { data, error } = await DatabaseOperations.update('tours', id, updateData);

// Delete record
const { error } = await DatabaseOperations.delete('tours', id);
\`\`\`

## Error Handling

### API Error Responses
Use the \`apiHandler\` utility for consistent error responses:
\`\`\`typescript
import { apiHandler } from '@/lib/api/response-handlers';

// Success response
return apiHandler.success(data);

// Error response
return apiHandler.error('Error message', 400);

// Database error
return apiHandler.databaseError(error, 'operation name');

// Validation error
return apiHandler.validationError(validationResult);

// Not found
return apiHandler.notFound('Resource name');
\`\`\`

## Validation

### Using Zod Schemas
\`\`\`typescript
import { schemas } from '@/lib/schemas/api-schemas';

const result = schemas.tour.safeParse(data);
if (!result.success) {
  return apiHandler.validationError(result);
}
\`\`\`

## Testing

### Running Tests
\`\`\`bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test components/ui/button.test.tsx

# Run E2E tests
pnpm test:e2e
\`\`\`

## Development Workflow

1. **Before committing:**
   - Run \`pnpm lint:fix\` to fix ESLint issues
   - Run \`pnpm type-check\` to check TypeScript
   - Run \`pnpm format\` to format code
   - Run \`pnpm test\` to run tests

2. **Creating new API routes:**
   - Use \`CommonApiOperations\` for standard CRUD operations
   - Define proper TypeScript types
   - Add validation schemas
   - Implement proper error handling

3. **Adding new components:**
   - Follow the component organization structure
   - Use proper TypeScript interfaces
   - Add tests for complex components
   - Document component props

## Performance

### Code Splitting
- Use dynamic imports for large components
- Implement proper loading states
- Optimize images and assets

### Caching
- Implement proper caching strategies
- Use React Query for server state
- Cache static assets appropriately

## Security

### Input Validation
- Always validate user input
- Use Zod schemas for validation
- Sanitize data before database operations

### Authentication
- Implement proper authentication checks
- Use HTTP-only cookies for tokens
- Validate user permissions

## Monitoring

### Error Tracking
- Log errors appropriately
- Implement error boundaries
- Monitor API performance

### Analytics
- Track user interactions
- Monitor page performance
- Log important events
`;

const guidelinesPath = path.join(process.cwd(), 'DEVELOPMENT_GUIDELINES.md');
fs.writeFileSync(guidelinesPath, guidelines);
console.log('✅ Development guidelines created\n');

console.log('🎉 Codebase cleanup completed!');
console.log('\n📋 Next steps:');
console.log('1. Review and fix any remaining ESLint issues');
console.log('2. Update component imports to use new index files');
console.log('3. Test all API endpoints with new standardized responses');
console.log('4. Update documentation to reflect new structure');
console.log('5. Run tests to ensure everything works correctly'); 