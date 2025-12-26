# Employee Management Portal

A comprehensive React-based employee management system for managing employees, projects, subscriptions, and assets.

## Introduction

The Employee Management Portal is a modern web application built with React and Vite that provides a centralized platform for managing organizational resources. The system allows administrators to:

- **Manage Employees**: Track employee information, roles, departments, and reporting structures
- **Oversee Projects**: Monitor project status, deadlines, team assignments, and progress
- **Handle Subscriptions**: Manage software subscriptions and service licenses
- **Track Assets**: Maintain inventory of company assets including laptops, monitors, and other equipment

The application features a clean, modern UI with real-time data updates, comprehensive filtering and search capabilities, and detailed analytics dashboards.

## Getting Started

Follow these steps to get the Employee Management Portal running on your local machine.

### Prerequisites

- **Node.js**: Version 16.x or higher
- **npm**: Version 8.x or higher (comes with Node.js)

### Installation Process

1. **Clone the repository**
   ```bash
   git clone https://dev.azure.com/valus-io/v-web-team-projects/_git/coreview-react
   cd coreview-react
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open your browser and navigate to: `http://localhost:5173`
   - The application will automatically reload when you make changes

### Software Dependencies

The project uses the following key dependencies:

- **React 18.3.1**: UI framework
- **React Router DOM 7.1.1**: Client-side routing
- **Reactstrap 9.2.3**: Bootstrap components for React
- **Bootstrap 5.3.3**: CSS framework
- **Lucide React 0.469.0**: Icon library
- **Chart.js 4.4.7**: Data visualization
- **React Date Range 2.0.1**: Date picker component
- **QRCode.react 4.1.0**: QR code generation
- **jsPDF 2.5.2**: PDF generation
- **html2canvas 1.4.1**: Screenshot functionality

## Build and Test

### Development Build

Run the development server with hot-reload:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

Create an optimized production build:

```bash
npm run build
```

This will generate a `dist` folder with optimized static files ready for deployment.

### Preview Production Build

Test the production build locally:

```bash
npm run preview
```

### Code Linting

Check code quality and formatting:

```bash
npm run lint
```

### Running Tests

Currently, the project uses ESLint for code quality checks. To run linting:

```bash
npm run lint
```

## Project Structure

```
coreview-react/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Layout.jsx     # Main layout with sidebar and header
│   │   └── DateRangeFilter.jsx
│   ├── contexts/          # React context providers
│   │   ├── GlobalContext.jsx  # Global state management
│   │   └── mockData.js        # Mock data for development
│   ├── pages/             # Main application pages
│   │   ├── Dashboard.jsx
│   │   ├── EmployeeList.jsx
│   │   ├── EmployeeProfile.jsx
│   │   ├── Projects.jsx
│   │   ├── Subscriptions.jsx
│   │   ├── Assets.jsx
│   │   └── AssetDetail.jsx
│   ├── App.jsx            # Main application component
│   ├── main.jsx           # Application entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── index.html             # HTML template
├── vite.config.js         # Vite configuration
└── package.json           # Project dependencies

```

## Features

### Dashboard
- Real-time metrics and analytics
- Employee growth trends
- Project status overview
- Subscription and asset summaries
- Interactive charts and visualizations

### Employee Management
- Add, edit, and manage employee records
- Track employee status (Active, On Leave, Inactive)
- Manage reporting structures and hierarchies
- Assign employees to projects and subscriptions
- Filter and search capabilities

### Project Management
- Create and track projects
- Assign project leads and team members
- Monitor project status and deadlines
- View project timelines and progress
- Filter by status and deadline

### Subscription Tracking
- Manage software and service subscriptions
- Track subscription costs and renewal dates
- Assign subscriptions to employees and projects
- Monitor active vs. paused subscriptions

### Asset Inventory
- Track company assets (laptops, monitors, etc.)
- Generate QR codes for asset tracking
- Assign assets to employees
- Monitor asset status and availability
- Print asset labels with QR codes

## Technology Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **UI Components**: Reactstrap (Bootstrap 5)
- **Icons**: Lucide React
- **Charts**: Chart.js with react-chartjs-2
- **State Management**: React Context API
- **Data Persistence**: LocalStorage
- **Styling**: CSS with Bootstrap

## Contributing

This project is maintained by the Valus.io team. For contributions or issues, please contact the development team.

## License

This project is proprietary and confidential. Unauthorized copying or distribution is prohibited.

---

**Developed by**: Valus.io Development Team  
**Last Updated**: December 2025