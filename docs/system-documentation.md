# Blood Donor Nepal - System Documentation

## 1. Frontend

### Technology Stack
- React 19
- React Router DOM 6
- Axios (API communication)
- Vite (build/dev tooling)
- CSS modules/files per page/component

### Frontend Structure (high level)
- Entry: `frontend/src/main.jsx`
- App routing: `frontend/src/App.jsx`
- Pages: `frontend/src/pages/*`
- Reusable components: `frontend/src/components/*`
- Auth state/context: `frontend/src/context/*` and `frontend/src/hooks/useAuth`
- API client: `frontend/src/services/api.js`

### Main Frontend Capabilities
- User login/register with OTP verification flow
- Role-protected route access (`donor`, `admin`)
- Donor dashboard with:
  - Overview, profile editing, eligibility controls
  - Donation history
  - Alerts tab and donation actions
- Search page donor map with city-based location fallback so donors can appear even when exact latitude/longitude is not stored
- Admin dashboard with real-time polling behavior and operational views
- Public alerts and public blood request submission
- Chatbot UI integration

---

## 2. Backend

### Technology Stack
- Node.js + Express
- Sequelize ORM
- PostgreSQL driver (`pg`)
- JWT authentication (`jsonwebtoken`)
- Request validation (`express-validator`)
- OTP/email via Nodemailer
- Push support (`web-push`), SMS integration (`twilio`)

### Backend Structure (high level)
- Server bootstrap: `backend/src/server.js`
- Route registration: `backend/src/routes/index.js`
- Controllers: `backend/src/controllers/*`
- Models: `backend/src/models/*`
- Middleware: `backend/src/middleware/*`
- Services: `backend/src/services/*`

### Exposed API Domains
- `/api/auth` - registration, login, me, logout
- `/api/otp` - OTP send/verify
- `/api/donors` - donor profile/search/management
- `/api/donations` - donation history and donor self-donation endpoint
- `/api/alerts` - alert trigger, list, history, deletion
- `/api/public-requests` - public blood request lifecycle
- `/api/inventory` - blood inventory operations
- `/api/stats` - summary metrics
- `/api/chatbot` - chatbot interactions
- `/api/feedback` - donation feedback

---

## 3. Database

### Database Engine
- PostgreSQL

### ORM + Migrations
- ORM: Sequelize
- SQL migrations: `database/migrations/*.sql`

### Core Tables
- `users`
- `donors`
- `blood_banks`
- `hospitals`
- `inventory`
- `donations`
- `alerts`
- `push_subscriptions`
- `otps`
- `public_blood_requests`

### Notable Schema Behavior
- UUID primary keys across core entities
- Role transition migration to simplified roles: `donor`, `receiver`, `admin` (`003_role_receiver_transition.sql`)
- OTP schema with purpose-based verification (`004_otp_schema.sql`)
- Public blood request schema with status workflow (`005_public_blood_requests.sql`)
- Indexed columns for blood type, status, geolocation fields, and time-based queries
- Donor search supports location rendering from stored coordinates when available, with backend city fallback coordinates used when only the donor city is present

---

## 4. Authentication and Authorization

### Authentication
- JWT-based authentication
- Token accepted via:
  - `Authorization: Bearer <token>` header
  - Cookie fallback
- Auth middleware: `backend/src/middleware/auth.js` (`authenticateToken`)

### Authorization
- Role-based access control using `authorizeRoles(...)`
- Supported roles in middleware: `donor`, `receiver`, `admin`
- Protected frontend routes via `ProtectedRoute`

### OTP Security Flow
- OTP endpoints: send + verify with purpose (`login`, `signup`, `reset`)
- OTP expiry and usage state management in DB
- Email delivery through SMTP (with configurable env credentials)

---

## 5. Core Features Implemented

### Donor Side
- Registration + OTP verification
- Login (email/phone depending on flow)
- Donor profile editing (name, phone, blood type, city)
- Donor eligibility update by self
- Donation confirmation page with alert/request details
- Self donation recording endpoint integration
- Donation history and overview metrics
- Alert feed access and donor action flow
- Search map visibility for donors through location fallback coordinates when exact geolocation is not available

### Admin Side
- Admin authentication and dashboard access
- Dashboard data loading and periodic refresh
- Donor management
- Alert trigger and alert history management
- Public request management
- Inventory visibility and donor availability views

### Alerting and Requests
- Public alert listing
- Alert urgency/status categorization
- Public blood request submission and listing
- Donation flow closes/removes alert as per implementation path

### Communication and Engagement
- OTP email delivery
- Push subscription support
- SMS service integration hooks
- Chatbot integration via Groq SDK and chatbot routes/services

### Data and Operations
- Migration-based schema evolution
- Seed/bootstrap scripts for development and admin setup
- Backend tests (Jest + Supertest) and frontend build validation pipeline

---

## 6. Environment and Configuration (Summary)

### Backend
Common variables include:
- App/runtime: `NODE_ENV`, `PORT`, `FRONTEND_URL`
- DB: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- Auth: `JWT_SECRET`
- OTP/Email: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`
- Chatbot: `GROQ_API_KEY`

### Frontend
- `VITE_API_URL` for backend base URL

---

## 7. Notes

- This documentation reflects the current implemented system in this repository.
- For deployment details, refer to existing deployment docs under `docs/`.
