# Clinicians Unite - API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
All API endpoints (except `/health` and `/auth/login`) require Bearer token authentication.

Headers:
```
Authorization: Bearer {token}
```

## Endpoints

### Health Check
```
GET /health
Response: { status: "ok", timestamp: ISO8601 }
```

### Authentication
```
POST /auth/login
POST /auth/register
POST /auth/logout
POST /auth/refresh
```

### Patients
```
GET /patients
GET /patients/:id
POST /patients
PUT /patients/:id
DELETE /patients/:id
```

### Doctors
```
GET /doctors
GET /doctors/:id
POST /doctors
PUT /doctors/:id
DELETE /doctors/:id
```

### Appointments
```
GET /appointments
GET /appointments/:id
POST /appointments
PUT /appointments/:id
DELETE /appointments/:id
GET /appointments/patient/:patientId
GET /appointments/doctor/:doctorId
```

### Prescriptions
```
GET /prescriptions
GET /prescriptions/:id
POST /prescriptions
PUT /prescriptions/:id
DELETE /prescriptions/:id
```

### Insurance
```
GET /insurance
GET /insurance/:id
POST /insurance
PUT /insurance/:id
DELETE /insurance/:id
```

### Payments (Razorpay Integration)
```
POST /payments/create-order
POST /payments/verify-payment
GET /payments/history
```

### Dashboard
```
GET /dashboard/stats
GET /dashboard/analytics
```

## Error Responses
```json
{
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Rate Limiting
API calls are rate limited to 100 requests per minute per IP.
