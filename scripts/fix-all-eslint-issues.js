const fs = require('fs');
const path = require('path');

// Files that need fixes based on lint output
const fixes = [
  {
    file: 'app/api/admin/airport-pickup-bookings/route.ts',
    issues: [
      { type: 'unused_import', line: 3, fix: "Remove 'createAppError' and 'ERROR_CODES' from import" }
    ]
  },
  {
    file: 'app/api/admin/driver-assignments/route.ts',
    issues: [
      { type: 'unused_variables', fix: 'Remove all unused error variables' }
    ]
  },
  {
    file: 'app/api/admin/stats/route.ts',
    issues: [
      { type: 'unused_variable', line: 40, fix: 'Remove unused error variable' }
    ]
  },
  {
    file: 'app/api/admin/tours/route.ts',
    issues: [
      { type: 'unused_variables', fix: 'Remove all unused error variables' }
    ]
  },
  {
    file: 'app/api/destinations/route.ts',
    issues: [
      { type: 'unused_variable', line: 15, fix: 'Remove unused dbError variable' }
    ]
  },
  {
    file: 'app/api/health/route.ts',
    issues: [
      { type: 'unused_variable', line: 99, fix: 'Remove unused appError variable' }
    ]
  },
  {
    file: 'app/api/test-airport-pickup/route.ts',
    issues: [
      { type: 'unused_variables', fix: 'Remove all unused error variables' }
    ]
  },
  {
    file: 'lib/images/image-utils.ts',
    issues: [
      { type: 'unused_variables', fix: 'Remove unused supabaseAdmin and data variables' }
    ]
  },
  {
    file: 'lib/supabase/supabase.ts',
    issues: [
      { type: 'unused_variable', line: 43, fix: 'Remove unused data variable' }
    ]
  }
];

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  console.log(`🔧 Fixing: ${filePath}`);

  // Fix specific patterns based on file
  switch (filePath) {
    case 'app/api/admin/airport-pickup-bookings/route.ts':
      // Remove unused imports
      content = content.replace(
        /import { createAppError, createErrorResponse, ERROR_CODES } from '@\/lib\/utils\/error-handling';/,
        "import { createErrorResponse } from '@/lib/utils/error-handling';"
      );
      modified = true;
      break;

    case 'app/api/admin/driver-assignments/route.ts':
      // Replace entire file with clean version
      content = `import { supabaseAdmin } from '@/lib/supabase/supabase';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const driverAssignmentSchema = z.object({
  driver_id: z.number(),
  booking_id: z.number(),
  assignment_status: z.enum(['assigned', 'in_progress', 'completed', 'cancelled']).default('assigned'),
  assigned_at: z.string().optional(),
});

const driverAssignmentUpdateSchema = z.object({
  id: z.number(),
  driver_id: z.number(),
  booking_id: z.number(),
  assignment_status: z.enum(['assigned', 'in_progress', 'completed', 'cancelled']).default('assigned'),
  assigned_at: z.string().optional(),
});

export async function GET() {
  try {
    const { data, error: dbError } = await supabaseAdmin
      .from('driver_assignments')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('Database error:', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch driver assignments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const parsedData = driverAssignmentSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid assignment data' },
        { status: 400 }
      );
    }

    const { data, error: dbError } = await supabaseAdmin
      .from('driver_assignments')
      .insert([parsedData.data])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to create assignment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    const parsedData = driverAssignmentUpdateSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid assignment data' },
        { status: 400 }
      );
    }

    const { id, ...updateData } = parsedData.data;
    
    const { data, error: dbError } = await supabaseAdmin
      .from('driver_assignments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to update assignment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    const { error: dbError } = await supabaseAdmin
      .from('driver_assignments')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('Database error:', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to delete assignment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}`;
      modified = true;
      break;

    default:
      // Generic fixes for other files
      // Remove unused variables in catch blocks
      content = content.replace(/catch\s*\(\s*\w+\s*\)\s*{/g, 'catch {');
      
      // Remove unused error assignments
      content = content.replace(/const\s+\w+\s*=\s*createAppError[^;]*;\s*/g, '');
      
      // Remove unused destructured variables
      content = content.replace(/const\s*{\s*data\s*}\s*=\s*await\s*supabase[^;]*;/g, 
        (match) => match.replace('data', '_data'));
      
      // Remove unused imports
      content = content.replace(
        /import\s*{\s*[^}]*createAppError[^}]*}\s*from\s*'[^']*';\s*/g, 
        ''
      );
      
      modified = true;
      break;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  } else {
    console.log(`⚪ No changes: ${filePath}`);
    return false;
  }
}

// Run fixes
console.log('🚀 Starting automated ESLint fixes...\n');

let totalFixed = 0;
fixes.forEach(({ file }) => {
  if (fixFile(file)) {
    totalFixed++;
  }
});

console.log(`\n✅ Fixed ${totalFixed} files!`);
console.log('\n🧪 Run "pnpm lint" to check remaining issues');
console.log('🏗️  Run "pnpm type-check" to verify TypeScript');
console.log('🚀 Run "pnpm build" to test production build'); 