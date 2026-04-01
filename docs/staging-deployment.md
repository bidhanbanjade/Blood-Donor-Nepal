# Staging Deployment Guide (Railway or Render)

## 1. Prepare Environment Variables

Configure these variables in your staging environment:

- PORT=5000
- NODE_ENV=staging
- FRONTEND_URL=https://your-staging-frontend.example
- DB_HOST=
- DB_PORT=5432
- DB_NAME=
- DB_USER=
- DB_PASSWORD=
- JWT_SECRET=
- JWT_EXPIRES_IN=7d
- COOKIE_SECURE=true
- COOKIE_SAME_SITE=none
- AUTH_COOKIE_NAME=token
- VAPID_PUBLIC_KEY=
- VAPID_PRIVATE_KEY=
- VAPID_SUBJECT=mailto:ops@example.com
- EMAIL_HOST=
- EMAIL_PORT=587
- EMAIL_USER=
- EMAIL_PASSWORD=
- TWILIO_ACCOUNT_SID=
- TWILIO_AUTH_TOKEN=
- TWILIO_FROM=
- A2A_API_KEY=
- A2A_AGENT_URL=

## 2. Run DB Migration

Apply SQL migration file:

- database/migrations/001_initial_schema.sql

## 3. Deploy Backend

1. Connect repository to Railway or Render.
2. Set service root to backend.
3. Build command: npm install
4. Start command: npm start
5. Configure health check path: /health

## 4. Deploy Frontend

1. Deploy frontend as static site.
2. Set VITE_API_URL to staging backend API URL (for example https://api-staging.example/api).
3. Set VITE_GOOGLE_MAPS_API_KEY.

## 5. Run Integration Test Sweep

From backend folder:

- npm test -- --runInBand

Manual endpoint checks:

1. POST /api/auth/register
2. POST /api/auth/login
3. GET /api/blood-banks/search?lat=27.7172&lng=85.324&radius=15
4. POST /api/alerts/trigger (admin/hospital)
5. POST /api/blood-banks/urgent-request (blood_bank)
6. POST /api/chatbot/task

## 6. Staging Exit Criteria

- Auth cookie works cross-origin.
- Inventory updates set availability_flag correctly.
- Alert fan-out reaches at least one channel (push/email/SMS).
- Frontend map and chatbot are functional.
