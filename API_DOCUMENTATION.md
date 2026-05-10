# API Documentation

Complete API reference for Clinician-Unchained backend services.

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "doctor@clinic.com",
  "password": "secure_password",
  "fullName": "Dr. John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "user_123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "doctor@clinic.com",
  "password": "secure_password"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123",
    "email": "doctor@clinic.com",
    "fullName": "Dr. John Doe"
  }
}
```

#### Send OTP
```http
POST /auth/send-otp
Content-Type: application/json

{
  "email": "patient@email.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP sent to email"
}
```

#### Verify OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "email": "patient@email.com",
  "otp": "123456"
}
```

### Patient Endpoints

#### Get All Patients
```http
GET /patients
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "patients": [
    {
      "id": "patient_1",
      "name": "John Smith",
      "email": "john@email.com",
      "phone": "+1234567890",
      "age": 45,
      "medicalHistory": []
    }
  ]
}
```

#### Get Patient Details
```http
GET /patients/:id
Authorization: Bearer <token>
```

#### Create Patient
```http
POST /patients
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@email.com",
  "phone": "+1234567890",
  "age": 35,
  "bloodType": "O+"
}
```

### Prescription Endpoints

#### Create Prescription
```http
POST /prescriptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "patient_1",
  "medications": [
    {
      "name": "Aspirin",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "7 days"
    }
  ],
  "notes": "Take with food"
}
```

**Response (201):**
```json
{
  "success": true,
  "prescriptionId": "rx_123",
  "message": "Prescription created successfully"
}
```

#### Get Prescriptions
```http
GET /prescriptions?patientId=patient_1
Authorization: Bearer <token>
```

#### Validate Prescription
```http
POST /prescriptions/validate
Authorization: Bearer <token>
Content-Type: application/json

{
  "prescription": {...}
}
```

### Appointment Endpoints

#### Schedule Appointment
```http
POST /appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "patient_1",
  "doctorId": "doctor_1",
  "dateTime": "2026-05-15T10:00:00Z",
  "reason": "Regular checkup"
}
```

#### Get Appointments
```http
GET /appointments?date=2026-05-15
Authorization: Bearer <token>
```

#### Cancel Appointment
```http
DELETE /appointments/:id
Authorization: Bearer <token>
```

### Activity Log Endpoints

#### Get Activities
```http
GET /activities
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "activities": [
    {
      "id": "activity_1",
      "userId": "user_123",
      "action": "Created prescription",
      "timestamp": "2026-05-10T14:30:00Z"
    }
  ]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Token expired or invalid"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Rate Limiting

API rate limits:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated requests

Headers returned:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1620000000
```

## Pagination

List endpoints support pagination:
```
GET /patients?page=1&limit=20
```

Response:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

## Versioning

API version: v1
Current: /api/v1/...

## Support

For API support: api-support@clinician-unchained.com
