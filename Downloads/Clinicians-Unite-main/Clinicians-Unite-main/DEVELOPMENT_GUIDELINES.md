# Development Guidelines

## Architecture Overview

### Frontend (clinicians-unchained)
- React + TypeScript
- Vite for bundling
- TailwindCSS for styling
- React Router for navigation
- Context API for state management
- Custom hooks for logic reuse

### Backend (api-server)
- Node.js + Express
- TypeScript
- Drizzle ORM for database
- OpenAPI/Swagger documentation
- JWT authentication
- Rate limiting middleware

### Shared Libraries
- `api-client-react/` - API client for React
- `api-spec/` - OpenAPI specification
- `api-zod/` - Zod schemas for validation
- `db/` - Database configuration
- `integrations/` - Third-party integrations (OpenAI, etc.)

## Key Technologies
- **Language**: TypeScript
- **Runtime**: Node.js 16+
- **Package Manager**: pnpm
- **Database**: PostgreSQL
- **ORM**: Drizzle
- **Frontend**: React, Vite
- **Styling**: TailwindCSS
- **API Gateway**: Express
- **Payment**: Razorpay
- **AI Integration**: OpenAI

## Environment Variables
Create `.env.local` files with:
```
DATABASE_URL=postgresql://user:password@localhost:5432/clinicians_unite
API_PORT=3001
FRONTEND_PORT=3000
JWT_SECRET=your-secret-key
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
OPENAI_API_KEY=your-openai-key
```

## Common Tasks

### Create a new API endpoint
1. Define schema in `lib/api-zod/`
2. Add route in `artifacts/api-server/src/routes/`
3. Implement handler logic
4. Update OpenAPI spec
5. Generate client code with orval

### Add a new React component
1. Create component in appropriate folder
2. Add component story if using Storybook
3. Add tests
4. Update parent components
5. Update navigation if needed

### Database migration
1. Update schema in `lib/db/src/schema/`
2. Generate migration: `pnpm db:generate`
3. Review and update if needed
4. Run migration: `pnpm db:migrate`

## Performance Tips
- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Lazy load routes
- Optimize database queries with proper indexes
- Use connection pooling for database
- Implement caching strategies

## Security Considerations
- Sanitize all user inputs
- Use parameterized queries
- Validate JWT tokens
- Implement CORS properly
- Use HTTPS in production
- Rotate secrets regularly
- Implement rate limiting
- Use environment variables for secrets

## Debugging
- Use browser DevTools for frontend
- Use VS Code debugger for backend
- Enable verbose logging in development
- Use database console for SQL debugging
- Check Docker logs: `docker logs container-name`

## Deployment
- Use environment-specific configurations
- Run migrations before deploying
- Use CI/CD pipeline (GitHub Actions)
- Monitor application health
- Set up logging and error tracking
- Use CDN for static assets
- Implement blue-green deployment strategy
