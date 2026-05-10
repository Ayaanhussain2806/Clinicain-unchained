# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React + TypeScript (Vite)                          │   │
│  │  - Authentication Pages                             │   │
│  │  - Patient Management Dashboard                     │   │
│  │  - Prescription Management UI                       │   │
│  │  - Adaptive Learning Game                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ (HTTP/REST)
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express.js Server                                  │   │
│  │  - Rate Limiting                                    │   │
│  │  - Authentication Middleware                        │   │
│  │  - CORS Configuration                               │   │
│  │  - Request Validation                               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         ↓              ↓              ↓              ↓
    ┌────────┐  ┌────────────┐  ┌──────────┐  ┌──────────┐
    │ Auth   │  │ Patients   │  │ Prescrip │  │ Appoint  │
    │Service │  │ Service    │  │ Service  │  │ Service  │
    └────────┘  └────────────┘  └──────────┘  └──────────┘
         ↓              ↓              ↓              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                                │   │
│  │  - User Data                                        │   │
│  │  - Patient Records                                  │   │
│  │  - Prescriptions                                    │   │
│  │  - Appointments                                     │   │
│  │  - Activity Logs                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         ↓              ↓              ↓
    ┌─────────┐  ┌─────────────┐  ┌───────────┐
    │ Redis   │  │ Email       │  │ ML        │
    │ Cache   │  │ Service     │  │ Service   │
    └─────────┘  └─────────────┘  └───────────┘
```

## Component Architecture

### Frontend Architecture

```
src/
├── pages/
│   ├── Auth.tsx          # Authentication page
│   ├── Game.tsx          # Adaptive learning game
│   ├── Index.tsx         # Home page
│   └── NotFound.tsx      # 404 page
├── components/
│   ├── ui/               # Reusable UI components
│   ├── game/             # Game components
│   │   ├── GameCanvas.tsx
│   │   ├── LevelCard.tsx
│   │   └── StatsPanel.tsx
│   └── forms/            # Form components
├── hooks/
│   ├── use-toast.ts      # Toast notifications
│   └── use-mobile.tsx    # Mobile detection
├── services/
│   └── apiService.ts     # API calls
├── integrations/
│   └── supabase/         # Supabase client
└── lib/
    └── utils.ts          # Utility functions
```

### Backend Architecture

```
backend/
├── models/               # Database models
│   └── User.js
├── controllers/          # Request handlers
├── services/
│   ├── authService.js    # Authentication logic
│   ├── agentService.js   # Agent workflows
│   └── apiService.js     # API interactions
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   └── middleWare.js
├── utils/
│   ├── logger.js         # Logging
│   └── validators.js     # Data validation
└── config/
    └── database.js       # DB configuration
```

## Data Flow

### Authentication Flow

```
User Input (Frontend)
    ↓
API Request (/api/auth/login)
    ↓
Express Router
    ↓
Auth Middleware (Validation)
    ↓
Authentication Service
    ↓
Database Lookup
    ↓
JWT Token Generation
    ↓
Response with Token
    ↓
Frontend Stores Token
    ↓
Authenticated Requests
```

### Prescription Creation Flow

```
Doctor Input (Frontend)
    ↓
Form Validation
    ↓
API Request (/api/prescriptions)
    ↓
Auth Check (Verify JWT)
    ↓
Prescription Service
    ↓
Business Logic Validation
    ↓
Database Insert
    ↓
Cache Update
    ↓
Email Notification
    ↓
Response to Frontend
    ↓
Success Message
```

## Technology Stack Details

### Frontend
- **React 18**: UI rendering
- **TypeScript**: Type safety
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first styling
- **Supabase Client**: Real-time DB sync

### Backend
- **Express.js**: Web framework
- **Node.js**: Runtime
- **PostgreSQL**: Primary database
- **Redis**: Caching layer
- **Nodemailer**: Email service

### ML/AI Layer
- **Python**: ML language
- **TensorFlow/PyTorch**: Model framework
- **Flask**: API framework

## Deployment Architecture

### Development
- Local machine with all services
- Hot reload enabled
- Detailed logging

### Staging
- Cloud VM deployment
- Database replicated
- Similar to production

### Production
- Docker containers
- Kubernetes orchestration
- Load balancing
- Auto-scaling

## Security Architecture

### Authentication
```
Login Credentials
    ↓
Password Hash (bcrypt)
    ↓
Database Check
    ↓
JWT Token Generation
    ↓
Token stored in HttpOnly Cookie
```

### Authorization
```
API Request with JWT
    ↓
Token Verification
    ↓
Role Check
    ↓
Resource Access Control
    ↓
Audit Logging
```

## Database Schema (High Level)

```
Users
├── id (UUID)
├── email (unique)
├── password (hashed)
├── fullName
├── role
└── created_at

Patients
├── id (UUID)
├── name
├── email
├── phone
├── medical_history
└── user_id (FK)

Prescriptions
├── id (UUID)
├── patient_id (FK)
├── medications (JSON)
├── doctor_id (FK)
├── created_at
└── status

Appointments
├── id (UUID)
├── patient_id (FK)
├── doctor_id (FK)
├── datetime
├── reason
└── status
```

## Scalability Considerations

1. **Database**: Sharding, replication
2. **Cache**: Redis cluster
3. **API**: Load balancing, CDN
4. **Frontend**: Static file serving, lazy loading
5. **Services**: Microservices architecture
6. **Infrastructure**: Kubernetes, auto-scaling

## Performance Optimization

- Database indexing
- Query optimization
- Caching strategies
- Image optimization
- Code splitting
- Lazy loading
- API response compression
