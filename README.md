# 🚀 StudyMate AI - Backend API Service

The official Node.js & Express REST API for **StudyMate AI** — an AI-Powered Study and Exam Preparation Assistant.

---

## 🌐 Live Production Deployment
- **Frontend Web App (Vercel)**: [https://study-mate-ai-frontend-6hw8jirij-studymeta-ai.vercel.app/](https://study-mate-ai-frontend-6hw8jirij-studymeta-ai.vercel.app/)
- **Backend API (Render)**: `https://studymate-ai-backend-kmhk.onrender.com/api`
- **System Health Check**: [https://studymate-ai-backend-kmhk.onrender.com/api/health](https://studymate-ai-backend-kmhk.onrender.com/api/health)

---

## 🏗️ Architecture: MVC + Services Pattern

```
backend/
├── database/
│   └── schema.sql              # Supabase PostgreSQL DDL, Indexes & RLS
├── src/
│   ├── config/
│   │   ├── db.js               # Supabase Client connection & diagnostic
│   │   └── ai.js               # Google Gemini client config
│   ├── controllers/
│   │   └── authController.js   # Register, Login, Profile, Logout
│   ├── models/
│   │   └── userModel.js        # User database operations
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification
│   │   ├── errorMiddleware.js  # Global error & 404 handler
│   │   └── validateMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js       # /api/auth endpoints
│   │   └── healthRoutes.js     # /api/health endpoint
│   ├── services/               # AI, PDF parsing, OCR, repeated question analyzer
│   └── utils/
│       ├── apiResponse.js      # Standard JSON response envelope
│       ├── testAuth.js         # Automated auth verification
│       └── testDbConnection.js # Supabase connection test
└── server.js                   # Application bootstrapper & listener
```

---

## 🛠️ Tech Stack
- **Runtime**: Node.js v24 (ES Modules)
- **Framework**: Express.js
- **Database**: Supabase PostgreSQL
- **Security**: bcryptjs & jsonwebtoken (JWT)
- **Document Processing**: `pdf-parse` & `tesseract.js`
- **AI Integration**: `@google/genai` (Google Gemini API)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your credentials:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run Server
```bash
# Development (with automatic reload)
npm run dev

# Production
npm start
```
Health Check: `http://localhost:5000/api/health`
