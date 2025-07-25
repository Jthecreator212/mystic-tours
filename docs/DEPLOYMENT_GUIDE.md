# Deployment Guide

## Overview

This guide covers deploying the Mystic Tours application to various environments, from development to production.

## Prerequisites

- Node.js 18+ installed
- pnpm package manager
- Git repository access
- Supabase account and project
- Domain name (for production)

## Environment Setup

### 1. Environment Variables

Create `.env.local` file with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Admin Configuration
ADMIN_ENABLED=true
ADMIN_SESSION_SECRET=your_session_secret

# Database Configuration
DATABASE_URL=your_database_url

# Email Configuration (optional)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# Analytics (optional)
GOOGLE_ANALYTICS_ID=your_ga_id
```

### 2. Database Setup

Run the database migration scripts:

```bash
# Install dependencies
pnpm install

# Run database setup
pnpm scripts:db

# Or manually run SQL scripts
psql -h your-supabase-host -U postgres -d postgres -f scripts/migrations/database/create-tables.sql
psql -h your-supabase-host -U postgres -d postgres -f scripts/migrations/database/insert-tours-data.sql
```

## Development Deployment

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Type checking
pnpm type-check
```

### Docker Development

```dockerfile
# Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]
```

```bash
# Build and run
docker build -f Dockerfile.dev -t mystic-tours-dev .
docker run -p 3000:3000 -v $(pwd):/app mystic-tours-dev
```

## Staging Deployment

### Vercel Staging

1. **Connect Repository:**
   - Go to [Vercel](https://vercel.com)
   - Import your Git repository
   - Configure environment variables

2. **Build Configuration:**
   ```json
   {
     "buildCommand": "pnpm build",
     "outputDirectory": ".next",
     "installCommand": "pnpm install"
   }
   ```

3. **Environment Variables:**
   - Add all environment variables from `.env.local`
   - Use staging-specific values

4. **Deploy:**
   ```bash
   # Deploy to staging
   vercel --prod
   ```

### Railway Staging

1. **Connect Repository:**
   - Go to [Railway](https://railway.app)
   - Connect your Git repository
   - Add environment variables

2. **Deploy:**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login and deploy
   railway login
   railway up
   ```

## Production Deployment

### Vercel Production

1. **Domain Configuration:**
   - Add custom domain in Vercel dashboard
   - Configure DNS records
   - Enable HTTPS

2. **Environment Variables:**
   - Use production Supabase project
   - Configure production Telegram bot
   - Set `NODE_ENV=production`

3. **Performance Optimization:**
   ```json
   {
     "functions": {
       "app/api/**/*.ts": {
         "maxDuration": 30
       }
     },
     "images": {
       "domains": ["your-supabase-project.supabase.co"],
       "formats": ["image/webp", "image/avif"]
     }
   }
   ```

4. **Deploy:**
   ```bash
   # Deploy to production
   vercel --prod
   ```

### AWS Deployment

1. **EC2 Setup:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install pnpm
   npm install -g pnpm

   # Install PM2
   npm install -g pm2
   ```

2. **Application Setup:**
   ```bash
   # Clone repository
   git clone your-repo-url
   cd mystic-tours

   # Install dependencies
   pnpm install

   # Build application
   pnpm build

   # Start with PM2
   pm2 start npm --name "mystic-tours" -- start
   pm2 save
   pm2 startup
   ```

3. **Nginx Configuration:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **SSL Certificate:**
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx

   # Get SSL certificate
   sudo certbot --nginx -d your-domain.com
   ```

### Docker Production

1. **Dockerfile:**
   ```dockerfile
   FROM node:18-alpine AS base

   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app

   # Install dependencies based on the preferred package manager
   COPY package.json pnpm-lock.yaml* ./
   RUN npm install -g pnpm && pnpm install --frozen-lockfile

   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .

   # Next.js collects completely anonymous telemetry data about general usage.
   # Learn more here: https://nextjs.org/telemetry
   # Uncomment the following line in case you want to disable telemetry during the build.
   ENV NEXT_TELEMETRY_DISABLED 1

   RUN npm install -g pnpm && pnpm build

   # Production image, copy all the files and run next
   FROM base AS runner
   WORKDIR /app

   ENV NODE_ENV production
   ENV NEXT_TELEMETRY_DISABLED 1

   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs

   COPY --from=builder /app/public ./public

   # Set the correct permission for prerender cache
   RUN mkdir .next
   RUN chown nextjs:nodejs .next

   # Automatically leverage output traces to reduce image size
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

   USER nextjs

   EXPOSE 3000

   ENV PORT 3000
   ENV HOSTNAME "0.0.0.0"

   CMD ["node", "server.js"]
   ```

2. **Docker Compose:**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
         - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
         - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
         - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
         - TELEGRAM_CHAT_ID=${TELEGRAM_CHAT_ID}
       restart: unless-stopped
   ```

3. **Deploy:**
   ```bash
   # Build and run
   docker-compose up -d

   # View logs
   docker-compose logs -f
   ```

## CI/CD Pipeline

### GitHub Actions

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm test
      - run: pnpm type-check
      - run: pnpm lint

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Monitoring & Analytics

### Performance Monitoring

1. **Vercel Analytics:**
   - Enable in Vercel dashboard
   - Configure custom events

2. **Google Analytics:**
   ```typescript
   // Add to _app.tsx
   import { useEffect } from 'react';
   import { useRouter } from 'next/router';

   export default function App({ Component, pageProps }) {
     const router = useRouter();

     useEffect(() => {
       const handleRouteChange = (url: string) => {
         gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
           page_path: url,
         });
       };

       router.events.on('routeChangeComplete', handleRouteChange);
       return () => {
         router.events.off('routeChangeComplete', handleRouteChange);
       };
     }, [router.events]);

     return <Component {...pageProps} />;
   }
   ```

3. **Error Monitoring:**
   - Set up Sentry or LogRocket
   - Configure error boundaries

### Health Checks

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check database connection
    const { data, error } = await supabase.from('tours').select('count').limit(1);
    
    if (error) {
      return NextResponse.json(
        { status: 'error', message: 'Database connection failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime(),
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Health check failed' },
      { status: 500 }
    );
  }
}
```

## Security Considerations

### Environment Variables
- Never commit `.env.local` to version control
- Use different values for each environment
- Rotate secrets regularly

### HTTPS
- Always use HTTPS in production
- Configure HSTS headers
- Use secure cookies

### Rate Limiting
- Implement rate limiting on API endpoints
- Use middleware for protection

### Database Security
- Use Row Level Security (RLS) in Supabase
- Limit database access
- Regular backups

## Troubleshooting

### Common Issues

1. **Build Failures:**
   ```bash
   # Clear cache
   rm -rf .next
   pnpm install
   pnpm build
   ```

2. **Database Connection:**
   ```bash
   # Test connection
   pnpm scripts:test-db-connection
   ```

3. **Environment Variables:**
   ```bash
   # Check environment
   pnpm scripts:diagnose-env
   ```

### Performance Issues

1. **Bundle Size:**
   ```bash
   # Analyze bundle
   pnpm analyze
   ```

2. **Database Queries:**
   - Check Supabase dashboard for slow queries
   - Add database indexes
   - Optimize queries

### Support

For deployment issues:
- Check logs in deployment platform
- Review environment variables
- Test locally with production settings
- Contact support with error details 