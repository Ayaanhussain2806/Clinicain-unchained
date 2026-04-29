# Development Setup Guide

## ⚠️ Database Setup Required

The backend requires PostgreSQL to run. Choose one of these setup options:

### Option 1: Using Docker (Recommended)
If you have Docker installed:
```bash
docker compose up -d
```
This will start PostgreSQL on `localhost:5432`

### Option 2: Manual PostgreSQL Installation

**Windows:**
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install with default settings
3. During installation, set password to `postgres`
4. Ensure PostgreSQL service is running
5. Database URL will be: `postgresql://postgres:postgres@localhost:5432/clinicians_unite`

**Create the database:**
```bash
# Using psql (PostgreSQL command line)
psql -U postgres
CREATE DATABASE clinicians_unite;
```

### Option 3: Cloud Database
Use a cloud PostgreSQL provider:
- Supabase: https://supabase.com
- Railway: https://railway.app
- AWS RDS: https://aws.amazon.com/rds/

Then update the DATABASE_URL in `.env`

---

## Environment Variables

The `.env` file has been created with:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/clinicians_unite
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx_secret_for_test
```

### Update with your values:
1. **DATABASE_URL** - Your PostgreSQL connection string
2. **RAZORPAY_KEY_ID** - Get from https://dashboard.razorpay.com/app/keys
3. **RAZORPAY_KEY_SECRET** - Get from https://dashboard.razorpay.com/app/keys

---

## To Start Development After Database Setup

### Terminal 1 - Backend
```bash
cd artifacts/api-server
pnpm run dev
```

### Terminal 2 - Frontend
```bash
cd artifacts/clinicians-unchained
pnpm run dev
```

## Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api

---

## Database Migrations (if needed)

After connecting to PostgreSQL, the database schema will be created automatically.

---

## Troubleshooting

### "DATABASE_URL must be set"
- Ensure `.env` file exists in `artifacts/api-server/`
- Database URL must be valid PostgreSQL connection string

### "Connection refused"
- PostgreSQL service is not running
- Try starting PostgreSQL service manually

### Port 5432 already in use
- Another PostgreSQL instance is running
- Change port in DATABASE_URL or stop the other instance

---

## Next Steps

1. ✅ Install PostgreSQL or use Docker
2. ✅ Update `.env` with correct DATABASE_URL
3. ✅ Run `pnpm run dev` in backend directory
4. ✅ Run `pnpm run dev` in frontend directory
5. ✅ Visit http://localhost:5173 in your browser
6. ✅ Test the Razorpay payment integration

For questions, check:
- [RAZORPAY_QUICK_START.md](../RAZORPAY_QUICK_START.md)
- [RAZORPAY_INTEGRATION_GUIDE.md](../RAZORPAY_INTEGRATION_GUIDE.md)
