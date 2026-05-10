# Database Migration Guide

This document explains how to manage database migrations for Clinician-Unchained.

## Using Supabase Migrations

### Prerequisites
```bash
npm install -g supabase-cli
supabase login
```

### Create a New Migration

```bash
# From the project root
cd adaptive-level-forge-main
supabase migration new create_users_table
```

This creates a new SQL file in `supabase/migrations/`

### Migration File Structure

Example migration file:
```sql
-- supabase/migrations/20260510000000_create_users_table.sql

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Apply Migrations

```bash
# Apply pending migrations
supabase migration up

# Rollback last migration
supabase migration down
```

## Common Migrations

### Create Patients Table
```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  age INTEGER,
  blood_type VARCHAR(10),
  medical_history JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patients_user_id ON patients(user_id);
```

### Create Prescriptions Table
```sql
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES users(id),
  medications JSONB NOT NULL,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON prescriptions(doctor_id);
```

### Create Appointments Table
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES users(id),
  appointment_date TIMESTAMP NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
```

### Create Activity Logs Table
```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
```

## Row Level Security (RLS)

Enable RLS for sensitive tables:

```sql
-- Enable RLS on patients table
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Users can see only their own patients
CREATE POLICY "Users can view their own patients"
ON patients FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own patients"
ON patients FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own patients"
ON patients FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```

## Backup and Restore

### Backup Database
```bash
# Using pg_dump
pg_dump postgresql://user:password@host:5432/dbname > backup.sql

# Restore from backup
psql postgresql://user:password@host:5432/dbname < backup.sql
```

### Automated Backups
Supabase automatically creates daily backups. Access them in the dashboard.

## Schema Versioning

Keep track of schema versions:

```sql
CREATE TABLE schema_version (
  version INTEGER PRIMARY KEY,
  description VARCHAR(255),
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schema_version (version, description)
VALUES (1, 'Initial schema setup');
```

## Performance Optimization

### Add Indexes for Common Queries
```sql
-- Performance: Speed up email lookups
CREATE INDEX idx_users_email_active ON users(email) 
WHERE deleted_at IS NULL;

-- Performance: Speed up date range queries
CREATE INDEX idx_prescriptions_date ON prescriptions(created_at DESC);
```

### Partitioning Large Tables
```sql
-- Partition activity logs by date
CREATE TABLE activity_logs (
  id UUID,
  user_id UUID,
  action VARCHAR(255),
  created_at TIMESTAMP
) PARTITION BY RANGE (created_at);

CREATE TABLE activity_logs_2026_01 
  PARTITION OF activity_logs
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

## Troubleshooting

### Migration Failed
```bash
# Check migration status
supabase migration list

# View migration details
supabase migration info

# Reset migrations (development only!)
supabase db reset
```

### Viewing Current Schema
```bash
# From Supabase dashboard
# Navigate to SQL Editor → Tables

# Or use psql
psql postgresql://user:password@host/dbname -c "\dt"
```

## Best Practices

1. **Version Control**: Always commit migrations
2. **Naming**: Use descriptive migration names
3. **Testing**: Test migrations in staging first
4. **Backups**: Always backup before major migrations
5. **Documentation**: Document schema changes
6. **Rollback Plan**: Have a rollback strategy
7. **Data Integrity**: Add constraints and validations
8. **Performance**: Monitor query performance

## Resources

- Supabase Migrations: https://supabase.com/docs/guides/cli/managing-docs
- PostgreSQL Documentation: https://www.postgresql.org/docs/
