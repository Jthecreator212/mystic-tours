import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
      telegramBot: !!process.env.TELEGRAM_BOT_TOKEN,
      telegramChat: !!process.env.TELEGRAM_CHAT_ID,
    };

    const allEnvVarsPresent = Object.values(envStatus).every(Boolean);

    // Check external services
    const externalServices = {
      supabase: dbStatus,
      telegram: envStatus.telegramBot && envStatus.telegramChat,
    };

    // Determine overall health
    const isHealthy = dbStatus === 'healthy' && allEnvVarsPresent;
    const statusCode = isHealthy ? 200 : 503;

    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      services: {
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
          error: dbError?.message || null,
        },
        environment: {
          status: allEnvVarsPresent ? 'healthy' : 'error',
          variables: envStatus,
        },
        external: externalServices,
      },
      checks: {
        database: dbStatus === 'healthy',
        environment: allEnvVarsPresent,
        telegram: envStatus.telegramBot && envStatus.telegramChat,
      },
    };

    return NextResponse.json(healthData, { status: statusCode });

  } catch (error) {
    const errorData = {
      status: 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {
        database: {
          status: 'error',
          responseTime: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        environment: {
          status: 'unknown',
          variables: {
            supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            telegramBot: !!process.env.TELEGRAM_BOT_TOKEN,
            telegramChat: !!process.env.TELEGRAM_CHAT_ID,
          },
        },
        external: {
          supabase: 'error',
          telegram: 'unknown',
        },
      },
      checks: {
        database: false,
        environment: false,
        telegram: false,
      },
    };

    return NextResponse.json(errorData, { status: 503 });
  }
} 