# Backend Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React App)                        │
│                     http://localhost:5173                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP Requests (JSON)
                         │ Authorization: Bearer <JWT Token>
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   EXPRESS SERVER (Node.js)                       │
│                     http://localhost:5000                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    MIDDLEWARE LAYER                       │  │
│  │  • CORS (Cross-Origin Resource Sharing)                  │  │
│  │  • Body Parser (JSON)                                    │  │
│  │  • JWT Authentication                                    │  │
│  │  • Role-Based Authorization                              │  │
│  │  • Error Handler                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      ROUTES LAYER                         │  │
│  │  /api/auth          → Authentication Routes              │  │
│  │  /api/employees     → Employee Routes                    │  │
│  │  /api/projects      → Project Routes                     │  │
│  │  /api/assets        → Asset Routes                       │  │
│  │  /api/subscriptions → Subscription Routes                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   CONTROLLERS LAYER                       │  │
│  │  • authController.js                                     │  │
│  │  • employeeController.js                                 │  │
│  │  • projectController.js                                  │  │
│  │  • assetController.js                                    │  │
│  │  • subscriptionController.js                             │  │
│  │                                                           │  │
│  │  (Business Logic, Validation, Response Formatting)       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     MODELS LAYER                          │  │
│  │  • User Model (Authentication)                           │  │
│  │  • Employee Model                                        │  │
│  │  • Project Model                                         │  │
│  │  • Asset Model                                           │  │
│  │  • Subscription Model                                    │  │
│  │                                                           │  │
│  │  (Mongoose Schemas, Validation, Relationships)           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Mongoose ODM
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                      MongoDB DATABASE                            │
│                  mongodb://localhost:27017                       │
│                                                                  │
│  Collections:                                                    │
│  • users          → User accounts & authentication              │
│  • employees      → Employee records                            │
│  • projects       → Project data                                │
│  • assets         → Company assets                              │
│  • subscriptions  → Software subscriptions                      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Request Flow Example

### Example: Creating a New Employee

```
1. USER ACTION
   └─> User fills form in React app
   
2. FRONTEND
   └─> employeeService.create(employeeData)
       └─> POST /api/employees
           Headers: { Authorization: "Bearer <token>" }
           Body: { name, email, role, department, ... }
   
3. BACKEND - MIDDLEWARE
   └─> CORS Check ✓
   └─> Parse JSON Body ✓
   └─> Verify JWT Token ✓
   └─> Check User Role (admin/manager) ✓
   
4. BACKEND - ROUTE
   └─> POST /api/employees
       └─> Calls employeeController.createEmployee()
   
5. BACKEND - CONTROLLER
   └─> Validate input data
   └─> Call Employee.create(data)
   
6. BACKEND - MODEL
   └─> Mongoose validates against schema
   └─> Saves to MongoDB
   
7. DATABASE
   └─> Stores employee document
   └─> Returns saved document with _id
   
8. RESPONSE FLOW (Reverse)
   └─> Model returns document
   └─> Controller formats response
   └─> Route sends JSON response
   └─> Frontend receives data
   └─> UI updates with new employee
```

## Authentication Flow

```
┌─────────────┐
│   LOGIN     │
│   REQUEST   │
└──────┬──────┘
       │
       │ POST /api/auth/login
       │ { email, password }
       │
       ▼
┌─────────────────────┐
│  Auth Controller    │
│  1. Find user       │
│  2. Verify password │
│  3. Generate JWT    │
└──────┬──────────────┘
       │
       │ JWT Token
       │
       ▼
┌─────────────────────┐
│   Store in          │
│   localStorage      │
│   • token           │
│   • user data       │
└──────┬──────────────┘
       │
       │ All subsequent requests
       │
       ▼
┌─────────────────────┐
│  Protected Routes   │
│  Authorization:     │
│  Bearer <token>     │
└─────────────────────┘
```

## Data Models Relationships

```
┌──────────────┐
│     User     │
│──────────────│
│ _id          │◄─────────┐
│ username     │          │
│ email        │          │
│ password     │          │
│ role         │          │
│ employeeRef  │──────────┼──────────┐
└──────────────┘          │          │
                          │          │
┌──────────────┐          │          │
│   Employee   │          │          │
│──────────────│          │          │
│ _id          │◄─────────┘          │
│ employeeId   │                     │
│ name         │                     │
│ email        │                     │
│ department   │                     │
│ reportingTo  │─────┐               │
└──────┬───────┘     │               │
       │             │               │
       │             └───────────────┘
       │
       │ Referenced by
       │
       ├──────────────────────┐
       │                      │
       ▼                      ▼
┌──────────────┐      ┌──────────────┐
│   Project    │      │    Asset     │
│──────────────│      │──────────────│
│ _id          │      │ _id          │
│ title        │      │ assetId      │
│ lead         │──┐   │ name         │
│ team[]       │──┤   │ assignedTo   │──┐
│ status       │  │   │ status       │  │
└──────────────┘  │   └──────────────┘  │
                  │                     │
                  │   ┌──────────────┐  │
                  │   │ Subscription │  │
                  │   │──────────────│  │
                  │   │ _id          │  │
                  │   │ name         │  │
                  └───│ assignedTo[] │◄─┘
                      │ projects[]   │◄─┘
                      └──────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. CORS Protection                                     │
│     └─> Only allows requests from CLIENT_URL           │
│                                                          │
│  2. JWT Authentication                                  │
│     └─> Verifies token on every protected route        │
│                                                          │
│  3. Password Hashing                                    │
│     └─> bcrypt with salt rounds                        │
│                                                          │
│  4. Role-Based Authorization                            │
│     └─> Admin, Manager, User roles                     │
│                                                          │
│  5. Input Validation                                    │
│     └─> Mongoose schema validation                     │
│                                                          │
│  6. Error Handling                                      │
│     └─> Never expose sensitive data in errors          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## API Response Format

All API responses follow this consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "count": 10  // For list endpoints
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": { ... }  // Only in development
}
```

## Environment Configuration

```
┌─────────────────────────────────────────────────────────┐
│                  ENVIRONMENT VARIABLES                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  PORT=5000                                              │
│  └─> Server port                                        │
│                                                          │
│  NODE_ENV=development                                   │
│  └─> Environment mode (development/production)          │
│                                                          │
│  MONGODB_URI=mongodb://localhost:27017/db-name          │
│  └─> Database connection string                         │
│                                                          │
│  JWT_SECRET=your-secret-key                             │
│  └─> Secret for signing JWT tokens                      │
│                                                          │
│  JWT_EXPIRE=7d                                          │
│  └─> Token expiration time                              │
│                                                          │
│  CLIENT_URL=http://localhost:5173                       │
│  └─> Frontend URL for CORS                              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────────────┐
│                      PRODUCTION                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend (Vercel/Netlify)                              │
│  └─> https://your-app.vercel.app                        │
│                                                          │
│  Backend (Heroku/Railway/Render)                        │
│  └─> https://your-api.herokuapp.com                     │
│                                                          │
│  Database (MongoDB Atlas)                               │
│  └─> Cloud-hosted MongoDB cluster                       │
│                                                          │
│  File Storage (AWS S3 / Cloudinary)                     │
│  └─> For employee photos, documents                     │
│                                                          │
│  Email Service (SendGrid / Mailgun)                     │
│  └─> For notifications                                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

This architecture provides:
- ✅ Separation of concerns
- ✅ Scalability
- ✅ Security
- ✅ Maintainability
- ✅ Testability
