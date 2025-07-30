import { handleError } from '@/lib/utils/error-handling';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bsxloajxptdsgqkxbiem.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzeGxvYWp4cHRkc2dxa3hiaWVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjkzNTIzMywiZXhwIjoyMDYyNTExMjMzfQ.q-T_wVjHm5MtkyvO93pdnuQiXkPIEpYsqeLcFI8sryA';

// Validate required environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required Supabase environment variables for health check');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check database connectivity
    const { error: dbError } = await supabase
      .from('tours')
      .select('count')
      .limit(1);

    const dbStatus = dbError ? 'error' : 'healthy';
    const dbResponseTime = Date.now() - startTime;

    // Check environment variables
    const envStatus = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      telegramBot: !!process.env.TELEGRAM_BOT_TOKEN,
      telegramChat: !!process.env.TELEGRAM_CHAT_ID,
    };

    const allEnvVarsPresent = Object.values(envStatus).every(Boolean);

    // Check external services
    const externalServices = {
      supabase: dbStatus,
      telegram: !!process.env.TELEGRAM_BOT_TOKEN && !!process.env.TELEGRAM_CHAT_ID,
    };

    // Determine overall health
    const isHealthy = dbStatus === 'healthy' && allEnvVarsPresent;
    const statusCode = isHealthy ? 200 : 503;

    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: {
        status: dbStatus,
        responseTime: dbResponseTime,
        error: dbError?.message || null,
      },
      environment_variables: {
        status: allEnvVarsPresent ? 'complete' : 'incomplete',
        missing: Object.entries(envStatus)
          .filter(([, present]) => !present)
          .map(([key]) => key),
      },
      external_services: externalServices,
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external,
      },
    };

    return NextResponse.json(healthData, { status: statusCode });

  } catch (error) {
    const appError = handleError(error, 'HEALTH_CHECK');
    return NextResponse.json(
      { success: false, error: 'Health check failed' },
      { status: 500 }
    );
  }
} 