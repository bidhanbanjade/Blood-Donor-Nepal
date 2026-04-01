# Friend Testing Guide (End-to-End + Dashboards)

This guide helps you test the full project quickly, including login, APIs, map, chatbot, alerts, and dashboards.

## 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm installed
- Project cloned and opened in this workspace

## 2. Environment Setup

Create `backend/.env` with values similar to:

PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blood_donation_nepal
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=replace_with_strong_secret
JWT_EXPIRES_IN=7d
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
AUTH_COOKIE_NAME=token
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@example.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM=
A2A_API_KEY=
A2A_AGENT_URL=

Create `frontend/.env` with:

VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key

## 3. Install Dependencies

Terminal 1:

cd backend
npm install

Terminal 2:

cd frontend
npm install

## 4. Run Database Migrations

Run these SQL files in PostgreSQL in order:

1. `database/migrations/001_initial_schema.sql`
2. `database/migrations/002_donation_feedback.sql`

## 5. Seed Test Data and Admin Account

From backend folder:

npm run bootstrap:admin -- --email admin@example.com --password Password123 --name "Platform Admin"
npm run seed

Seed script creates demo donor, blood bank, hospital, inventory, and donation data.

## 6. Start Services

Terminal 1 (backend):

cd backend
npm run dev

Terminal 2 (frontend):

cd frontend
npm run dev

Open frontend:

http://localhost:5173

## 7. Test Login and Role Redirects

Open:

http://localhost:5173/login

Use:

- Admin: admin@example.com / Password123
- Donor: donor@example.com / Password123
- Hospital: hospital@example.com / Password123
- Blood bank: bloodbank@example.com / Password123

Expected:

- Admin auto-redirects to `/admin-dashboard`
- Donor auto-redirects to `/donor-dashboard`
- Other roles return to home page unless extra dashboard routes are added for them

## 8. Dashboard Test Checklist

### Donor Dashboard

Login as donor and confirm:

- Profile details render
- Donation history table shows records
- Eligibility countdown appears
- Feedback form submits successfully
- Success message shown after feedback submit

### Admin Dashboard

Login as admin and confirm:

- Inventory tiles display blood-type totals
- Donor and hospital lists are visible
- Trigger Alert form submits
- Response message includes matched donor count

## 9. Home Page Feature Checklist

- Header navigation loads
- Map panel loads with blood bank markers
- Chat widget accepts input and returns response
- Nearby blood bank section appears

## 10. API Smoke Tests (Postman or similar)

Base URL:

http://localhost:5000/api

Test these endpoints:

1. POST /auth/login
2. GET /auth/me
3. GET /blood-banks/search?lat=27.7172&lng=85.324&radius=15
4. GET /inventory
5. GET /donors/me (as donor)
6. POST /feedback (as donor)
7. POST /alerts/trigger (as admin or hospital)
8. POST /blood-banks/urgent-request (as blood_bank)
9. POST /chatbot/task

## 11. Automated Tests

From backend folder:

npm test -- --runInBand

Expected:

- auth tests pass
- inventory tests pass
- alerts tests pass

## 12. Common Troubleshooting

- 401 on protected routes:
  - Login again at `/login`
  - Ensure API URL points to backend and cookies are enabled
- CORS errors:
  - Verify `FRONTEND_URL` in backend `.env`
- Map not loading:
  - Check `VITE_GOOGLE_MAPS_API_KEY`
- Empty dashboard data:
  - Re-run `npm run seed`
  - Confirm migrations were applied

## 13. Quick Acceptance Result

Project is considered test-ready if all are true:

- Login works for seeded users
- Admin and donor dashboards load correctly
- Feedback submission persists via API
- Alert trigger endpoint responds successfully
- Frontend builds with `npm run build`
- Backend tests pass
