# Production Deployment Guide (AWS/GCP/Azure + PM2)

## 1. Infrastructure

Recommended architecture:

- Managed PostgreSQL (RDS/Cloud SQL/Azure Database for PostgreSQL)
- Backend API on VM/container service
- Frontend static hosting with CDN
- HTTPS termination using managed load balancer + TLS cert

## 2. Backend Runtime (PM2)

Install PM2 globally on the host:

npm install -g pm2

From backend directory:

npm ci
pm2 start src/server.js --name blood-donation-api
pm2 save
pm2 startup

## 3. SSL and Security

- Force HTTPS at load balancer or reverse proxy.
- Set COOKIE_SECURE=true.
- Set COOKIE_SAME_SITE=none if frontend and backend run on different domains.
- Rotate JWT secret and API keys on a schedule.

## 4. Environment Variables

Use the same variables from staging and secure them in cloud secret manager.

Additional production recommendations:

- NODE_ENV=production
- Enable platform logging and alerts for 5xx rates.

## 5. Database Migration Workflow

1. Backup production DB.
2. Apply SQL migration file in transaction.
3. Smoke test /health and /api/auth/login.

## 6. Monitoring

Track:

- API latency and error rate
- Notification delivery failures
- Database CPU and slow queries
- PM2 process restarts

## 7. Post-Deployment Verification

1. Register and login flow works with httpOnly cookie.
2. Admin dashboard can trigger alert fan-out.
3. Blood bank urgent geofence flow notifies nearby donors.
4. ChatWidget receives response from /api/chatbot/task.
5. Google Maps view loads and shows blood bank markers.
