# Blood Donation Nepal

A comprehensive web-based blood donation platform for Nepal that streamlines blood availability, connects donors with urgent needs in real-time, and leverages AI technology to provide accessible, immediate support.

## Project Structure

```
BIDHAN/
├── frontend/          # React application (Vite)
├── backend/           # Node.js API server (Express)
├── python-service/    # Future Python microservice for agent-to-agent communication
├── database/          # Database scripts and migrations
└── docs/              # Project documentation
```

## Tech Stack

- **Frontend**: React.js (Vite), React Router, Axios
- **Backend**: Node.js, Express.js, PostgreSQL, Sequelize
- **Future**: Python service for agent-to-agent communication

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blood_donation_nepal
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
GOOGLE_MAPS_API_KEY=your_api_key
A2A_API_KEY=your_a2a_key
```

4. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Project Status

### Completed (Step 1-3)

#### Step 1: Project Structure Setup ✅
- Created root directory structure:
  - `frontend/` - React application directory
  - `backend/` - Node.js API server directory
  - `python-service/` - Future Python microservice directory
  - `database/` - Database scripts and migrations directory
  - `docs/` - Project documentation directory
- Added `.gitignore` files for both frontend and backend

#### Step 2: Backend Setup ✅
- Initialized Node.js project with Express.js
- Created complete folder structure:
  - `src/controllers/` - Request handlers
  - `src/models/` - Database models (Sequelize)
  - `src/routes/` - API route definitions
  - `src/middleware/` - Authentication and error handling middleware
  - `src/services/` - Business logic layer
  - `src/utils/` - Helper functions and utilities
  - `src/config/` - Configuration files (database, app config)
  - `tests/` - Test files directory
- Core files implemented:
  - `server.js` - Express server with middleware setup
  - `config/database.js` - Sequelize PostgreSQL configuration
  - `config/config.js` - Environment configuration management
  - `middleware/auth.js` - JWT authentication middleware with role-based access
  - `middleware/errorHandler.js` - Global error handling middleware
  - `utils/logger.js` - Logging utility
  - `routes/index.js` - Main routes file
- Updated `package.json` with dependencies:
  - Express, Sequelize, JWT, bcrypt, cors, helmet
  - Nodemailer, axios, express-validator
  - Development: nodemon, jest, supertest

#### Step 3: Frontend Setup ✅
- Initialized React application with Vite
- Created complete folder structure:
  - `src/components/` - Reusable UI components
  - `src/pages/` - Page components
  - `src/services/` - API service layer
  - `src/hooks/` - Custom React hooks
  - `src/context/` - React Context providers
  - `src/utils/` - Utility functions
- Core files implemented:
  - `services/api.js` - Axios instance with interceptors and auth token handling
  - `services/authService.js` - Authentication service methods
  - `context/AuthContext.jsx` - Authentication context provider
  - `pages/HomePage.jsx` - Landing page component
  - `utils/constants.js` - Application constants and endpoints
  - `hooks/useAuth.js` - Custom authentication hook
- Landing page components created:
  - `Header.jsx` - Navigation header with logo and menu
  - `Hero.jsx` - Hero section with main CTA
  - `Statistics.jsx` - Statistics display section
  - `HowItWorks.jsx` - Feature cards section
  - `CTABanner.jsx` - Call-to-action banner
  - `Footer.jsx` - Footer with availability info
- Updated `App.jsx` with React Router setup
- Updated `package.json` with React Router and Axios
- Integrated Google Fonts (Inter) for improved typography
- Responsive design with modern CSS styling

### Next Steps
- Database schema and migrations
- User authentication implementation
- API endpoints development
- Connect frontend to backend APIs

## Features (Planned)

- Location-based blood bank directory with real-time availability
- Emergency alert system with multi-channel notifications
- AI-powered chatbot (A2A SDK integration)
- User dashboard for donors, hospitals, and blood banks
- Donation history tracking
- Blood inventory management
- Feedback and rating system

## Development Methodology

This project follows **Extreme Programming (XP)** methodology with 2-week sprints for iterative development and continuous testing.

## License

ISC

## Author

Bidhan Banjade - London Met ID: 23049031
