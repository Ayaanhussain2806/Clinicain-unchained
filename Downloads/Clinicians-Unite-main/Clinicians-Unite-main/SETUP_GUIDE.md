# Clinicians Unite - Setup Guide

## Project Overview
Clinicians Unite is a comprehensive healthcare platform designed to streamline clinic operations, appointment scheduling, and patient management.

## Prerequisites
- Node.js 16+
- pnpm package manager
- PostgreSQL database
- Docker (optional, for containerization)

## Installation Steps

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Environment Setup
Create `.env` files in respective directories:
- `artifacts/api-server/.env`
- `artifacts/clinicians-unchained/.env`

### 3. Database Setup
```bash
pnpm db:setup
pnpm db:migrate
```

### 4. Start Development Server
```bash
pnpm dev
```

## Project Structure
- `artifacts/api-server/` - Backend API server
- `artifacts/clinicians-unchained/` - Frontend React application
- `lib/` - Shared libraries and utilities
- `scripts/` - Build and deployment scripts

## Running Tests
```bash
pnpm test
```

## Build for Production
```bash
pnpm build
```

## Docker Deployment
```bash
docker-compose up --build
```

## Troubleshooting
For common issues and solutions, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
