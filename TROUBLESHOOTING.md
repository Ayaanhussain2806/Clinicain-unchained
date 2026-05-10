# Troubleshooting Guide

Common issues and their solutions for Clinician-Unchained.

## Installation Issues

### Issue: npm/pnpm installation fails
**Solution:**
```bash
# Clear cache
npm cache clean --force
pnpm store prune

# Delete lock files and node_modules
rm -rf node_modules pnpm-lock.yaml
rm -rf adaptive-level-forge-main/node_modules

# Reinstall
pnpm install
```

### Issue: Port already in use
**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=5001 npm start
```

## Backend Issues

### Issue: Cannot connect to database
**Solution:**
1. Check if PostgreSQL is running
2. Verify DATABASE_URL in .env
3. Check database credentials
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Issue: Email not sending
**Solution:**
1. Verify EMAIL_USER and EMAIL_PASSWORD in .env
2. Check Gmail app password (not regular password)
3. Allow less secure apps in Gmail settings
4. Test email configuration:
```javascript
const transporter = nodemailer.createTransport({...});
transporter.verify((error, success) => {
  if (error) console.log('Error:', error);
  else console.log('Ready to send:', success);
});
```

### Issue: OTP verification failing
**Solution:**
1. Check OTP_EXPIRATION is not too short
2. Verify timezone is correct
3. Check if email received
4. Test OTP generation:
```bash
npm run test:otp
```

### Issue: Authentication token issues
**Solution:**
1. Verify JWT_SECRET is set
2. Check token expiration
3. Clear browser cookies
4. Verify Authorization header format: `Bearer <token>`

## Frontend Issues

### Issue: Vite build fails
**Solution:**
```bash
# Clear Vite cache
rm -rf adaptive-level-forge-main/.vite
rm -rf adaptive-level-forge-main/dist

# Rebuild
cd adaptive-level-forge-main
pnpm run build
```

### Issue: React component not rendering
**Solution:**
1. Check browser console for errors
2. Verify component path imports
3. Clear browser cache (Ctrl+Shift+Delete)
4. Check if API is responding

### Issue: Supabase connection issues
**Solution:**
1. Verify VITE_SUPABASE_URL in .env
2. Check Supabase API key
3. Verify CORS settings in Supabase dashboard
4. Test connection:
```javascript
const { data, error } = await supabase.auth.getSession();
console.log(error);
```

## Docker Issues

### Issue: Docker container fails to start
**Solution:**
```bash
# Check logs
docker logs <container_id>

# Rebuild image
docker build --no-cache -t clinician-unchained .

# Run with debugging
docker run -it clinician-unchained bash
```

### Issue: Docker network issues
**Solution:**
```bash
# Check network connectivity
docker-compose ps
docker network ls

# Restart services
docker-compose down
docker-compose up -d
```

## Database Issues

### Issue: Database migrations not applying
**Solution:**
```bash
# Check migration status
supabase migration list

# Manually run migration
supabase migration up --step 1

# Reset (development only!)
supabase db reset
```

### Issue: Row Level Security (RLS) blocking access
**Solution:**
1. Check RLS policies in Supabase dashboard
2. Verify user has correct permissions
3. Temporarily disable RLS for testing:
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

## Performance Issues

### Issue: Slow API response
**Solution:**
1. Check database indexes
2. Monitor slow queries:
```sql
SELECT * FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
```
3. Add caching:
```bash
# Check Redis connection
redis-cli ping
```

### Issue: High memory usage
**Solution:**
```bash
# Monitor process
ps aux | grep node

# Check for memory leaks
node --inspect index.js

# Open Chrome: chrome://inspect
```

## Security Issues

### Issue: XSS vulnerability
**Solution:**
1. Sanitize user input
2. Use DOMPurify library
3. Set CSP headers

### Issue: SQL injection
**Solution:**
1. Use parameterized queries
2. Never concatenate user input
3. Validate and sanitize all inputs

### Issue: CORS errors
**Solution:**
1. Check CORS_ORIGIN in .env
2. Verify frontend URL matches
3. Add headers in Express:
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(','),
  credentials: true
}));
```

## Logging and Debugging

### Enable verbose logging
```bash
# Development
LOG_LEVEL=debug npm run dev

# Check logs
tail -f logs/app.log
```

### Debug mode
```bash
# Node.js debugging
node --inspect-brk index.js

# Browser DevTools: chrome://inspect
```

## Getting Help

1. Check this troubleshooting guide
2. Review API documentation
3. Check GitHub issues
4. Contact support: support@clinician-unchained.com
5. Create detailed bug report:
   - Environment (OS, Node version)
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/logs

## Common Error Messages

### "Cannot find module"
```bash
rm -rf node_modules
npm install
```

### "EADDRINUSE: address already in use"
```bash
# Kill process on port
npx kill-port 5000
```

### "EACCES: permission denied"
```bash
# On Mac/Linux
sudo chown -R $USER:$USER .
```

### "connection timeout"
Check network connectivity and firewall settings

## Performance Profiling

### CPU profiling
```bash
node --prof index.js
node --prof-process isolate-*.log > profile.txt
```

### Memory profiling
```bash
node --inspect index.js
# Use Chrome DevTools Memory tab
```

## Database Performance

### Check table sizes
```sql
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Optimize queries
```sql
EXPLAIN ANALYZE SELECT * FROM patients WHERE user_id = '123';
```
