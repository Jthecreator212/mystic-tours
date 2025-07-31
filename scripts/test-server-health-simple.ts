#!/usr/bin/env ts-node

/**
 * Simple Server Health Check Script for Mystic Tours
 * Tests the running server for functionality and security
 * Run with: npx ts-node --project tsconfig.scripts.json scripts/test-server-health-simple.ts
 */

// Load environment variables from .env.local
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

interface HealthCheck {
  name: string;
  description: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  details: string;
  critical: boolean;
}

interface HealthResult {
  checks: HealthCheck[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    criticalFailures: number;
  };
}

class ServerHealthChecker {
  private results: HealthCheck[] = [];
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  }

  private addCheck(check: HealthCheck) {
    this.results.push(check);
    const statusIcon = check.status === 'PASS' ? '✅' : check.status === 'FAIL' ? '❌' : '⚠️';
    const criticalIcon = check.critical ? '🚨' : '';
    console.log(`${statusIcon} ${criticalIcon} ${check.name}: ${check.status}`);
    if (check.details) {
      console.log(`   ${check.details}`);
    }
  }

  async runHealthCheck(): Promise<HealthResult> {
    console.log('🏥 MYSTIC TOURS SERVER HEALTH CHECK');
    console.log('====================================\n');
    console.log(`Testing server at: ${this.baseUrl}\n`);

    await this.checkServerStatus();
    await this.checkHealthEndpoint();
    await this.checkPublicRoutes();
    await this.checkAPIEndpoints();

    return this.generateReport();
  }

  private async checkServerStatus() {
    console.log('\n🌐 Server Status Check:');
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mystic-Tours-Health-Check/1.0'
        }
      });

      if (response.ok) {
        this.addCheck({
          name: 'Server Status',
          description: 'Server is responding to requests',
          status: 'PASS',
          details: `Status: ${response.status} ${response.statusText}`,
          critical: true
        });
      } else {
        this.addCheck({
          name: 'Server Status',
          description: 'Server is not responding correctly',
          status: 'FAIL',
          details: `Status: ${response.status} ${response.statusText}`,
          critical: true
        });
      }
    } catch (error) {
      this.addCheck({
        name: 'Server Status',
        description: 'Server is not accessible',
        status: 'FAIL',
        details: `Error: ${error}`,
        critical: true
      });
    }
  }

  private async checkHealthEndpoint() {
    console.log('\n💚 Health Endpoint Check:');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      
      if (response.ok) {
        const data = await response.json() as any;
        
        // Check database status safely
        const dbStatus = data?.database?.status || 'unknown';
        
        if (dbStatus === 'healthy') {
          this.addCheck({
            name: 'Health Endpoint',
            description: 'Health endpoint is working',
            status: 'PASS',
            details: `Database: ${dbStatus}`,
            critical: false
          });
        } else {
          this.addCheck({
            name: 'Health Endpoint',
            description: 'Health endpoint working but database may have issues',
            status: 'WARNING',
            details: `Database: ${dbStatus}`,
            critical: false
          });
        }
      } else {
        this.addCheck({
          name: 'Health Endpoint',
          description: 'Health endpoint not working',
          status: 'WARNING',
          details: `Status: ${response.status}`,
          critical: false
        });
      }
    } catch (error) {
      this.addCheck({
        name: 'Health Endpoint',
        description: 'Health endpoint check failed',
        status: 'WARNING',
        details: `Error: ${error}`,
        critical: false
      });
    }
  }

  private async checkPublicRoutes() {
    console.log('\n🌍 Public Routes Check:');
    
    const publicRoutes = [
      '/',
      '/tours',
      '/about',
      '/contact',
      '/gallery'
    ];

    let accessibleRoutes = 0;
    let totalRoutes = publicRoutes.length;

    for (const route of publicRoutes) {
      try {
        const response = await fetch(`${this.baseUrl}${route}`);
        
        if (response.status === 200) {
          accessibleRoutes++;
        }
      } catch (error) {
        // Route not accessible
      }
    }

    if (accessibleRoutes === totalRoutes) {
      this.addCheck({
        name: 'Public Routes',
        description: 'All public routes are accessible',
        status: 'PASS',
        details: `${accessibleRoutes}/${totalRoutes} routes accessible`,
        critical: true
      });
    } else {
      this.addCheck({
        name: 'Public Routes',
        description: 'Some public routes may not be working',
        status: 'FAIL',
        details: `${accessibleRoutes}/${totalRoutes} routes accessible`,
        critical: true
      });
    }
  }

  private async checkAPIEndpoints() {
    console.log('\n🔌 API Endpoints Check:');
    
    const endpoints = [
      '/api/admin/bookings',
      '/api/admin/tours',
      '/api/admin/drivers'
    ];

    let workingEndpoints = 0;
    let totalEndpoints = endpoints.length;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`);
        
        if (response.status === 200 || response.status === 401) {
          // 401 is expected for admin endpoints without auth
          workingEndpoints++;
        }
      } catch (error) {
        // Endpoint not accessible
      }
    }

    if (workingEndpoints === totalEndpoints) {
      this.addCheck({
        name: 'API Endpoints',
        description: 'All API endpoints are accessible',
        status: 'PASS',
        details: `${workingEndpoints}/${totalEndpoints} endpoints working`,
        critical: false
      });
    } else {
      this.addCheck({
        name: 'API Endpoints',
        description: 'Some API endpoints may not be working',
        status: 'WARNING',
        details: `${workingEndpoints}/${totalEndpoints} endpoints working`,
        critical: false
      });
    }
  }

  private generateReport(): HealthResult {
    const summary = {
      total: this.results.length,
      passed: this.results.filter(r => r.status === 'PASS').length,
      failed: this.results.filter(r => r.status === 'FAIL').length,
      warnings: this.results.filter(r => r.status === 'WARNING').length,
      criticalFailures: this.results.filter(r => r.status === 'FAIL' && r.critical).length
    };

    console.log('\n📊 SERVER HEALTH SUMMARY');
    console.log('==========================');
    console.log(`Total Checks: ${summary.total}`);
    console.log(`✅ Passed: ${summary.passed}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`⚠️  Warnings: ${summary.warnings}`);
    console.log(`🚨 Critical Failures: ${summary.criticalFailures}`);

    if (summary.criticalFailures > 0) {
      console.log('\n🚨 CRITICAL ISSUES FOUND!');
      console.log('Please address these issues immediately:');
      this.results
        .filter(r => r.status === 'FAIL' && r.critical)
        .forEach(check => {
          console.log(`- ${check.name}: ${check.details}`);
        });
    } else if (summary.failed > 0) {
      console.log('\n⚠️  Issues found. Please review and fix.');
    } else {
      console.log('\n✅ Server health check passed! All critical checks are working.');
    }

    return {
      checks: this.results,
      summary
    };
  }
}

async function main() {
  const checker = new ServerHealthChecker();
  await checker.runHealthCheck();
}

if (require.main === module) {
  main().catch(console.error);
} 