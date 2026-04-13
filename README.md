# Blood Donor Nepal

> A real-time blood donation coordination platform connecting donors, hospitals, and blood banks across Nepal through location-based search, emergency alerts, and an AI-powered assistant.

![Platform](https://img.shields.io/badge/platform-web-blue)
![Node](https://img.shields.io/badge/node-22.x-green)
![React](https://img.shields.io/badge/react-19.x-61dafb)
![PostgreSQL](https://img.shields.io/badge/postgresql-14-336791)
![License](https://img.shields.io/badge/license-ISC-lightgrey)

---

## Overview

Blood Donor Nepal is a full-stack web application built to address the critical gap in blood availability coordination across Nepal. The platform enables blood seekers to find eligible donors in real time, allows hospitals and blood banks to issue urgent alerts, and provides an intelligent AI chatbot to guide users through the process.

Built as a Final Year Project at London Metropolitan University (Student ID: 23049031), the system follows **Extreme Programming (XP)** methodology with iterative two-week sprints.

---

## Features

### For Blood Seekers
- Search eligible donors by city and blood type on an interactive map
- View donor blood type markers styled as location pins (Leaflet.js)
- Contact donors directly via phone or email from the map
- Submit public blood requests visible to blood banks
- Chat with an AI assistant to find blood availability instantly

### For Donors
- Register and maintain a donor profile with blood type and location
- Track personal donation history and eligibility status
- Receive push, email, and SMS notifications when urgent requests match

### For Hospitals & Blood Banks
- Issue urgent blood requests with geofenced notification fanout
- Manage blood inventory per blood type
- View alert history and matched donor counts

### For Administrators
- Full access to all dashboards and data
- Manage users, donors, inventory, and alerts
- Trigger platform-wide emergency alerts
- View public blood request submissions

### AI Chatbot
- Powered by Groq (Llama 3.3 70B) with real-time database tool calling
- Answers natural language queries: "Is A+ blood available in Kathmandu?", "Show urgent requests", "Blood banks in Chitwan"
- Available as a floating widget on every page and as a full-page interface
- Maintains conversation history across multi-turn sessions

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, React Router 6, Axios |
| Maps | Leaflet.js (OpenStreetMap tiles) |
| Backend | Node.js 22, Express.js 4 |
| Database | PostgreSQL 14, Sequelize ORM 6 |
| Auth | JWT, bcryptjs, HTTP-only cookies |
| AI | Groq SDK — Llama 3.3 70B (function calling) |
| Notifications | Nodemailer (email), Twilio (SMS), Web Push API |
| Validation | express-validator |
| Testing | Jest, Supertest |
| Containers | Docker, Docker Compose |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                    │
│   React SPA — Vite — React Router — Leaflet Maps        │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP (REST API)
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Express.js API Server                  │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │   Routes   │  │  Middleware  │  │  Controllers   │  │
│  │  /auth     │  │  JWT Auth    │  │  Business      │  │
│  │  /donors   │  │  Role Guard  │  │  Logic Layer   │  │
│  │  /alerts   │  │  Validation  │  │                │  │
│  │  /chatbot  │  │  Error Hdlr  │  │                │  │
│  └────────────┘  └──────────────┘  └────────────────┘  │
│  ┌────────────────────────────────────────────────────┐ │
│  │                  Services Layer                    │ │
│  │  chatbotService  — Groq AI with tool calling       │ │
│  │  notificationService — Email / SMS / Web Push      │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────┬───────────────────────┬───────────────────┘
              │                       │
              ▼                       ▼
┌─────────────────────┐   ┌──────────────────────────┐
│   PostgreSQL 14     │   │      Groq Cloud API       │
│   Sequelize ORM     │   │   Llama 3.3 70B model     │
│   UUID primary keys │   │   Function calling tools  │
│   5 SQL migrations  │   └──────────────────────────┘
└─────────────────────┘
```

---

## Project Structure

```
BIDHAN/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & app configuration
│   │   ├── controllers/     # Route handlers (10 controllers)
│   │   ├── middleware/      # JWT auth, error handling
│   │   ├── models/          # Sequelize models (11 models)
│   │   ├── routes/          # Express routers
│   │   ├── scripts/         # Seed & admin bootstrap scripts
│   │   ├── services/        # Chatbot AI, notifications, email
│   │   ├── utils/           # Geo, auth token, logger
│   │   └── server.js        # Application entry point
│   ├── tests/               # Jest + Supertest test suites
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React Auth Context
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page-level components
│   │   ├── services/        # API service layer (Axios)
│   │   ├── utils/           # Constants and helpers
│   │   ├── App.jsx          # Router setup
│   │   └── main.jsx         # Vite entry point
│   ├── Dockerfile
│   └── package.json
│
├── database/
│   └── migrations/          # Versioned SQL migrations (001–005)
│
├── docs/                    # Deployment documentation
├── docker-compose.yml
├── Makefile
└── README.md
```

---

## Database Schema

```
users ──┬── donors ──────── donations ──── donation_feedback
        │
        ├── blood_banks ──── inventory
        │         └───────── alerts
        │
        ├── hospitals ────── alerts
        │
        └── push_subscriptions

public_blood_requests  (open submissions — no login required)
otp                    (one-time password verification records)
```

**User Roles:** `donor` · `receiver` · `admin`

---

## Getting Started

### Option 1 — Docker (Recommended)

Requires Docker Desktop installed and running.

```bash
# Clone the repository
git clone https://github.com/bidhanbanjade/Blood-Donor-Nepal.git
cd Blood-Donor-Nepal

# Create root environment file
echo "GROQ_API_KEY=your_groq_api_key_here" > .env

# Start all services (PostgreSQL + Backend + Frontend)
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| Health Check | http://localhost:5000/health |

After containers start, seed demo data:

```bash
docker exec bidhan-backend npm run seed
docker exec bidhan-backend npm run bootstrap:admin -- --email admin@gmail.com --password BB23 --name "Admin"
```

---

### Option 2 — Local Development

**Prerequisites:** Node.js 20+, PostgreSQL 14+

**Backend**

```bash
cd backend
npm install
cp .env.example .env
# Fill in database credentials and GROQ_API_KEY in .env
npm run dev
```

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@gmail.com | BB23 |
| Donor | donor@example.com | Password123 |
| Receiver | hospital@example.com | Password123 |

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user info |
| POST | `/api/auth/logout` | Clear session cookie |

### Donors
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/donors/search/nearby` | Location-based donor search |
| GET | `/api/donors/me` | Get own donor profile |
| GET | `/api/donors` | List all donors (admin) |
| PUT | `/api/donors/:id` | Update donor profile |

### Alerts
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/alerts/trigger` | Issue urgent blood request |
| GET | `/api/alerts` | List active alerts (public) |
| GET | `/api/alerts/history` | Alert history (authenticated) |
| POST | `/api/alerts/subscribe` | Subscribe to push notifications |

### Blood Banks
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/blood-banks/search` | Find nearby blood banks |
| GET | `/api/blood-banks/me` | Get own blood bank profile |
| POST | `/api/blood-banks/urgent-request` | Issue urgent request |

### Chatbot
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chatbot/task` | Send message with conversation history |
| GET | `/api/chatbot/agent-card` | Get AI agent metadata |

### Inventory
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/inventory` | Get blood inventory |
| POST | `/api/inventory` | Add inventory record |
| PUT | `/api/inventory/:id` | Update blood units |

---

## Cities Supported

The platform is optimised for four major cities with pre-configured map views and radius-based donor search:

| City | Latitude | Longitude |
|---|---|---|
| Kathmandu Valley | 27.7172° N | 85.3240° E |
| Butwal | 27.7006° N | 83.4483° E |
| Pokhara | 28.2096° N | 83.9856° E |
| Chitwan | 27.5291° N | 84.3542° E |

---

## Running Tests

```bash
cd backend
npm test
```

Test suites cover: authentication flows, inventory management, alert triggering, and dashboard statistics using Jest and Supertest.

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_NAME=blood_donation_nepal
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

GROQ_API_KEY=your_groq_api_key

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASSWORD=your_app_password

TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_FROM=+1234567890
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

### Root (`.env`) — for Docker Compose

```env
GROQ_API_KEY=your_groq_api_key
```

---

## Development Methodology

This project follows **Extreme Programming (XP)** practices throughout its development:

- Iterative two-week development sprints with working deliverables at each stage
- Test-driven development for critical paths — auth, inventory, and alert systems
- Continuous integration via Docker Compose for consistent environments
- Simple design with ongoing refactoring as requirements evolved
- Pair-review of each feature before merging to main

---

## Deployment

See the deployment guides in the [`docs/`](docs/) directory:

- `docs/staging-deployment.md` — Staging environment setup
- `docs/production-deployment.md` — Production checklist

---

## Author

**Bidhan Banjade**
BSc Computer Science — London Metropolitan University
Student ID: 23049031

---

## License

ISC © Bidhan Banjade
