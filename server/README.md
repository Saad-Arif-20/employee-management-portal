# CoreView Backend API

## Overview

This repository contains the backend service for the CoreView Employee Management system. It is a RESTful API built with Node.js and Express, using MongoDB as the persistence layer. It handles authentication, data validation, and business logic for the frontend dashboard.

## Prerequisites

Before running this application, ensure you have the following installed:
- Node.js (v16 or higher)
- MongoDB (Running locally or using MongoDB Atlas)

## Setup Instructions

### 1. Install Dependencies
Navigate to the server directory and install the necessary packages:

```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root of the server directory. You can copy the example configuration:

```bash
cp .env.example .env
```

Ensure your `.env` file contains the following variables:
- `PORT`: The port number (default: 5000)
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secret key for signing authentication tokens

### 3. Database Seeding (Optional)
To populate the database with initial sample data (such as the admin user and mock employees), run the seed script:

```bash
npm run seed
```

### 4. Running the Server
Start the server in development mode with auto-reload:

```bash
npm run dev
```

The server will start on port 5000 (or your configured port).

## API Documentation

The API exposes the following main resource paths:

### Authentication
- `POST /api/auth/login`: Authenticate a user and receive a JWT.
- `POST /api/auth/register`: Register a new user account.

### Employees
- `GET /api/employees`: Retrieve a list of all employees.
- `GET /api/employees/:id`: Get detailed profile for a specific employee.
- `POST /api/employees`: Create a new employee record.
- `PUT /api/employees/:id`: Update an employee's information.

### Projects
- `GET /api/projects`: List all projects.
- `POST /api/projects`: Create a new project.
- `PUT /api/projects/:id`: Update project details or status.

### Assets & Subscriptions
- `GET /api/assets`: Manage company hardware inventory.
- `GET /api/subscriptions`: Manage software licenses.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB using Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Security**: BCrypt for password hashing, CORS for cross-origin resource sharing
