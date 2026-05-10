# Deployment Guide

This document provides instructions for deploying Clinician-Unchained to production.

## Prerequisites

- Node.js v16+
- Docker (optional)
- Heroku CLI (for Heroku deployment)
- AWS CLI (for AWS deployment)

## Environment Setup

Create a `.env.production` file with production environment variables:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=your_production_db_url
EMAIL_SERVICE_KEY=your_email_service_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

## Build Process

```bash
# Install dependencies
npm install

# Build frontend
cd adaptive-level-forge-main
npm run build
cd ..

# Verify build
npm run build
```

## Deployment Options

### Option 1: Heroku Deployment

```bash
# Login to Heroku
heroku login

# Create Heroku app
heroku create clinician-unchained

# Add environment variables
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Option 2: Docker Deployment

```bash
# Build Docker image
docker build -t clinician-unchained:latest .

# Run container
docker run -p 5000:5000 clinician-unchained:latest
```

### Option 3: AWS Deployment

```bash
# Package application
npm run build

# Deploy to AWS Elastic Beanstalk
eb create clinician-unchained-env
eb deploy
```

## Post-Deployment

1. Run database migrations
2. Test all API endpoints
3. Verify email service
4. Check frontend functionality
5. Monitor application logs

## Rollback Procedure

If issues occur:

```bash
# Heroku
heroku releases
heroku rollback v5

# AWS
eb abort
```

## Monitoring

Monitor these metrics:
- API response time
- Error rates
- Server CPU/Memory
- Database connections
- Email delivery

## Support

Contact: devops@clinician-unchained.com
