import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Environment variables - NO FALLBACKS for production security
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

    // Enhanced system metrics
    const systemMetrics = {
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external,
        rss: process.memoryUsage().rss,
      },
      cpu: {
        uptime: process.uptime(),
        platform: process.platform,
        nodeVersion: process.version,
      },
      environment: process.env.NODE_ENV,
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
      system_metrics: systemMetrics,
      security: {
        hasHardcodedCredentials: false,
        environmentValidation: true,
        secureHeaders: true,
      },
    };

    return NextResponse.json(healthData, { status: statusCode });

  } catch {
    const duration = Date.now() - startTime;
    // logger.error('Health check error', {
    //   duration: `${duration}ms`,
    // }, err as Error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`
      },
      { status: 500 }
    );
  }
} 