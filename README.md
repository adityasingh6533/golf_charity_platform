# Golf Charity Platform

> A full-stack golf prize-draw platform that connects player engagement, winner verification, and charity impact in one experience.

## Overview

Golf Charity Platform is a web application where players subscribe, submit golf scores, participate in draws, support charities, and track winnings.  
Admins can run draws, review winner proof, approve or reject submissions, mark payouts as paid, manage charities, and monitor platform analytics.

This project blends:

- golf score participation
- prize draw mechanics
- subscription-based access
- charity contribution tracking
- winner verification workflows
- admin operations and reporting

## Highlights

| Area | What it does |
| --- | --- |
| Authentication | Signup and signin with JWT-based access control |
| Subscriptions | Monthly and yearly plan activation |
| Scores | Players submit their latest golf scores |
| Draw Engine | Generates draw numbers and calculates winners |
| Winner Verification | Screenshot proof submission and admin review |
| Payments | Tracks payout state from pending to paid |
| Charity Support | Users select a charity and can also donate directly |
| Leaderboard | Shows top winning results |
| Admin Dashboard | Handles draw operations, analytics, and winner review |
| Notifications | Supports welcome, draw-result, and winner-status alerts |

## How It Works

### Player Journey

1. Create an account and select a charity.
2. Sign in and activate a subscription.
3. Submit up to 5 golf scores.
4. Join the draw.
5. View results on the dashboard.
6. If you win, submit screenshot proof.
7. Track status updates until payout is completed.

### Admin Journey

1. Open the admin dashboard.
2. Launch a draw in `random` or `algorithm` mode.
3. Review draw results and analytics.
4. Check submitted proof from winners.
5. Verify or reject submissions.
6. Mark verified winners as paid.
7. Manage charities and monitor contribution totals.

## Core Features

### Player Features

- User registration and login
- Charity selection during signup
- Subscription activation
- Score submission
- Draw participation
- Result tracking
- Winner proof submission
- Donation support for charities

### Admin Features

- Run monthly draws
- View all users
- Review all result entries
- Verify or reject winner proof
- Mark payouts as paid
- Create and manage charities
- View analytics for users, prizes, and charity contributions

## Winner Verification System

The project includes a structured winner verification workflow:

- Only winners can submit proof
- Proof is submitted as a screenshot link or image reference
- Admin review is required before payout
- Winners move through controlled states:

```text
Pending -> Verified -> Paid
        -> Rejected
```

Business rules enforced in the system:

- non-winners cannot submit proof
- proof is required before verification
- only verified winners can be marked as paid
- paid results cannot be reviewed again

## Tech Stack

| Layer | Stack |
| --- | --- |
| Frontend | React, React Router, CSS |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Auth | JWT, bcryptjs |
| API Style | REST |
| Tooling | Create React App |

## Project Structure

```text
golf_charity_platform/
|-- backend/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- service/
|   |-- connection.js
|   `-- index.js
|-- frontend/
|   |-- public/
|   `-- src/
|       |-- pages/
|       |-- styles/
|       `-- utils/
`-- README.md
```

## Main Pages

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/signup` | User registration |
| `/signin` | User login |
| `/dashboard` | Player dashboard |
| `/charities` | Charity listing |
| `/charities/:id` | Charity detail and donation page |
| `/leaderboard` | Public leaderboard |
| `/admin` | Admin dashboard |

## Backend API

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/signin`

### Users

- `GET /api/users/me`
- `GET /api/users/:id`
- `PUT /api/users/:id/subscription`
- `PUT /api/users/:id/charity`

### Scores

- `POST /api/score`
- `GET /api/score/:userId`

### Draws And Results

- `POST /api/draw/run-draw`
- `GET /api/result/leaderboard`
- `GET /api/result/:userId`
- `PUT /api/result/:resultId/proof`

### Payments

- `POST /api/payments/checkout`
- `GET /api/payments/me`

### Charities

- `GET /api/charities`
- `GET /api/charities/featured`
- `GET /api/charities/:id`
- `POST /api/charities/donations`

### Admin

- `POST /api/admin/run-draw`
- `GET /api/admin/users`
- `GET /api/admin/results`
- `GET /api/admin/analytics`
- `PUT /api/admin/verify/:id`
- `PUT /api/admin/reject/:id`
- `PUT /api/admin/pay/:id`

## Local Setup

### Clone the repository

```bash
git clone https://github.com/adityasingh6533/golf_charity_platform.git
cd golf_charity_platform
```

### Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### Create backend environment file

Create `backend/.env`:

```env
PORT=5000
MONGO_URL=mongodb://127.0.0.1:27017/golf_charity_platform
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=replace-with-a-secure-secret
NODE_ENV=development
ALLOW_INSECURE_HTTP=true
APP_BASE_URL=http://localhost:3000
MAILER_WEBHOOK_URL=
MAILER_API_KEY=
NOTIFICATIONS_FROM=no-reply@golfcharityplatform.local
```

### Start the backend

```bash
cd backend
npm start
```

### Start the frontend

```bash
cd frontend
npm start
```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:5000`

## Deploy On Vercel

This repository is now structured for the easiest Vercel setup as **two projects from the same repo**:

- `frontend` deployed as the React web app
- `backend` deployed as the Express API using Vercel Functions

### 1. Deploy the backend project

Create a new Vercel project and set:

- **Root Directory**: `backend`
- **Framework Preset**: `Other`

Add these environment variables in Vercel:

```env
MONGO_URL=your-mongodb-atlas-connection-string
JWT_SECRET=your-secure-jwt-secret
NODE_ENV=production
ALLOW_INSECURE_HTTP=false
CORS_ORIGIN=https://your-frontend-domain.vercel.app
APP_BASE_URL=https://your-frontend-domain.vercel.app
MAILER_WEBHOOK_URL=
MAILER_API_KEY=
NOTIFICATIONS_FROM=no-reply@yourdomain.com
```

After deployment, your backend will expose endpoints like:

- `https://your-backend-project.vercel.app/api/health`
- `https://your-backend-project.vercel.app/api/auth/signup`

### 2. Deploy the frontend project

Create a second Vercel project and set:

- **Root Directory**: `frontend`
- **Framework Preset**: `Create React App`

Add this environment variable:

```env
REACT_APP_API_URL=https://your-backend-project.vercel.app
```

This tells the React app which deployed API to call.

### 3. Redeploy frontend after backend URL is ready

If you deploy frontend first, update `REACT_APP_API_URL` after the backend gets its Vercel URL, then redeploy the frontend.

### 4. Use MongoDB Atlas for production

For Vercel deployment, use a cloud MongoDB instance such as MongoDB Atlas.  
A local MongoDB URL like `mongodb://127.0.0.1:27017/...` will not work in Vercel production.

### Deployment Notes

- `backend/vercel.json` routes incoming requests to the serverless Express entrypoint.
- `frontend/vercel.json` supports client-side React routing on refresh.
- the backend uses a cached Mongo connection pattern to work better in serverless environments.
- seed data still runs automatically when the backend cold-starts and connects.

## Seed Data

The backend seeds default charities on startup, so the platform is usable in local development without manual charity creation.

## Security Notes

- JWT is used for authenticated routes
- role-based access protects admin functionality
- active subscription is required for draw participation
- HTTPS enforcement exists for production mode
- security headers are applied by backend middleware

## Why This Project Is Strong

This is more than a basic CRUD app. It connects multiple real-world product flows:

- user onboarding
- subscription logic
- score management
- draw execution
- winner proof verification
- payout state tracking
- charity contribution visibility
- admin workflow management

That makes it a strong full-stack portfolio project for demonstrating product design thinking, backend business rules, frontend role-based experiences, and operational workflow handling.

## Future Improvements

- real payment gateway integration
- real file upload storage for proof images
- scheduled automated draws
- email templates and delivery dashboard
- automated tests for critical flows
- deployment and CI/CD documentation

## License

This project is currently unlicensed.
