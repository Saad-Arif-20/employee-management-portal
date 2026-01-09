# CoreView (React)

## Project Overview

CoreView is a comprehensive Employee Management dashboard designed to streamline organizational resources. It serves as the frontend interface for tracking employees, managing projects, monitoring assets, and handling software subscriptions. The application is built using React 19 and utilizes Vite for a fast and modern development experience.

The dashboard connects to a separate Node.js backend service to fetch and persist data.

## Installation and Setup

Follow these steps to get the application running on your local machine.

### 1. Install Dependencies
Navigate to the project root directory and install the required packages:

```bash
npm install
```

### 2. Start the Development Server
Run the following command to start the local development server:

```bash
npm run dev
```

The application will launch in your default browser at `http://localhost:5173`.

## Configuration

### Backend Connection
This frontend application relies on the CoreView Node backend being active. By default, it expects the backend API to be running at `http://localhost:5000/api`.

If your backend is running on a different port or server, you can configure this in your environment variables or update the configuration file located at `src/config/api.js`.

### Login Credentials
For development purposes, the system is pre-seeded with an administrator account:
- **Email:** admin@company.com
- **Password:** admin123

## Key Features

- **Dashboard**: Provides a high-level overview of company metrics, including total employees, active projects, and recent activities.
- **Employee Directory**: Allows for viewing, searching, and managing employee profiles. Supports status changes and role management.
- **Project Management**: A Kanban-style interface for tracking project progress, assigning teams, and managing deadlines.
- **Asset Tracking**: Inventory management system for company hardware and devices.
- **Subscription Manager**: Tracks software licenses, costs, and renewal dates.

## Technology Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Bootstrap 5 (via Reactstrap) and custom CSS
- **Routing**: React Router DOM
- **Charts**: Recharts
- **HTTP Client**: Axios
