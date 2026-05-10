# Clinician-Unchained

An **agentic workflow platform** designed to streamline clinic management and enhance patient care through intelligent automation, prescription management, and adaptive learning systems.

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Key Components](#key-components)
- [API Routes](#api-routes)
- [Contributing](#contributing)

## 🎯 Overview

Clinician-Unchained is a comprehensive clinic management solution that combines:
- **Patient Management**: Track and manage patient records
- **Prescription Management**: Digital prescription creation and validation
- **Authentication System**: Secure OTP-based authentication with email verification
- **Practo Integration**: Integration with Practo for extended clinic services
- **Adaptive Learning**: AI-driven adaptive learning system for clinical education
- **Agentic Workflow**: Intelligent automation for routine clinic operations

## ✨ Features

### Core Features
- 🔐 **Secure Authentication**: OTP-based login with email verification
- 📧 **Email Integration**: Automated email notifications and OTP delivery
- 💊 **Prescription Management**: Digital prescription creation and tracking
- 👥 **Patient Management**: Comprehensive patient record management
- 🏥 **Practo Integration**: Connect with Practo's healthcare network
- 📊 **Dashboard**: Prescription and activity dashboards
- 🎮 **Adaptive Learning System**: Gamified learning for medical professionals

### Backend Services
- Agent Service: Agentic workflow automation
- API Service: Centralized API communication
- Activity Logger: Comprehensive activity tracking
- Appointment Engine: Appointment scheduling and management

## 📁 Project Structure

```
Clinician-Unchained/
├── adaptive-level-forge-main/     # Frontend React + Vite application
│   ├── src/                        # React components and pages
│   ├── rl_service/                 # Python ML service for adaptive learning
│   └── supabase/                   # Database migrations and functions
├── backend/                        # Backend services
│   └── models/                     # Database models
├── route/                          # Express route handlers
│   ├── authRoutes.js               # Authentication endpoints
│   ├── userRoutes.js               # User management endpoints
│   └── middleWare.js               # Middleware functions
├── services/                       # Business logic services
│   ├── agentService.js             # Agentic workflows
│   └── apiService.js               # API communication
├── components/                     # React components
│   └── PrescriptionDashboard.jsx   # Prescription management UI
├── check/                          # Utility check functions
│   ├── nodemailer.js               # Email configuration
│   └── otp.js                      # OTP generation and verification
├── email.ts                        # Email service
├── otp.ts                          # OTP service
├── practo.ts                       # Practo integration
├── storage.jsx                     # Storage utilities
├── index.js                        # Main server entry point
├── package.json                    # Dependencies
└── README.md                       # This file
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Supabase** - Backend-as-a-Service

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Nodemailer** - Email service
- **Axios** - HTTP client

### Additional Services
- **Python** - Machine learning service
- **PostgreSQL** - Database (via Supabase)
- **Bun** - JavaScript runtime (alternative)

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or pnpm package manager
- Python 3.8+ (for ML service)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Clinician-Unchained
   ```

2. **Install dependencies**
   ```bash
   # Using pnpm (recommended)
   pnpm install
   
   # Or using npm
   npm install
   ```

3. **Setup environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   NODE_ENV=development
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```

4. **Install frontend dependencies**
   ```bash
   cd adaptive-level-forge-main
   pnpm install
   ```

5. **Setup Python ML service**
   ```bash
   cd adaptive-level-forge-main/rl_service
   pip install -r requirements.txt
   ```

## 🚀 Usage

### Start the Backend Server
```bash
npm run dev
# or
npm start
```
Server runs on `http://localhost:5000`

### Start the Frontend Development Server
```bash
cd adaptive-level-forge-main
pnpm run dev
```
Frontend runs on `http://localhost:5173` (default Vite port)

### Start the ML Service
```bash
cd adaptive-level-forge-main/rl_service
python app.py
```

## ⚙️ Configuration

### Email Configuration
Edit `check/nodemailer.js` to configure your email service:
```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

### Database Configuration
- Edit `adaptive-level-forge-main/supabase/config.toml` for Supabase settings
- Run migrations in `adaptive-level-forge-main/supabase/migrations/`

## 🔧 Key Components

### Authentication Routes (`route/authRoutes.js`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /verify-otp` - OTP verification

### User Routes (`route/userRoutes.js`)
- User management endpoints
- Profile management

### Services

#### API Service (`services/apiService.js`)
```javascript
// Example: Submit prescription
submitPrescription(data) - POST /check-prescription
```

#### Agent Service (`services/agentService.js`)
- Handles agentic workflows
- Automates routine clinic operations

#### Activity Logger (`src/components/utils/activityLogger.js`)
- Logs all user activities
- Provides audit trail

#### Appointment Engine (`src/components/utils/appointmentEngine.js`)
- Manages appointment scheduling
- Handles appointment confirmations

## 🔌 API Routes

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/send-otp` - Send OTP to email

### Prescriptions
- `POST /api/check-prescription` - Validate prescription
- `GET /api/prescriptions` - Get user prescriptions
- `POST /api/prescriptions` - Create prescription

### Users
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user profile

## 📚 Frontend Pages

- **Auth.tsx** - Authentication page
- **Game.tsx** - Adaptive learning game interface
- **Index.tsx** - Home page
- **NotFound.tsx** - 404 error page

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 📧 Support

For support, email support@clinician-unchained.com or create an issue in the repository.

---

**Last Updated**: May 2026
