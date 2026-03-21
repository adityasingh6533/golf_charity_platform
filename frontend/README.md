diff --git a/c:\Users\adity\OneDrive\Desktop\golf_charity_platform\README.md b/c:\Users\adity\OneDrive\Desktop\golf_charity_platform\README.md
new file mode 100644
--- /dev/null
+++ b/c:\Users\adity\OneDrive\Desktop\golf_charity_platform\README.md
@@ -0,0 +1,263 @@
+# Golf Charity Platform
+
+Golf Charity Platform is a full-stack web application that combines golf score participation, prize-draw engagement, and charity giving in one product. Players create an account, choose a supported charity, activate a subscription, submit their latest golf scores, join recurring draws, and track winnings. Admins can run draws, review winner proof submissions, manage payouts, and monitor charity impact from a central dashboard.
+
+The project is built with a React frontend and a Node.js/Express/MongoDB backend, with JWT authentication, role-based access control, winner verification workflows, donation tracking, and operational analytics.
+
+## What The Project Does
+
+- Lets users sign up and sign in with JWT-based authentication.
+- Requires each user to choose a charity during onboarding.
+- Supports subscription activation for monthly or yearly plans.
+- Allows players to submit their latest golf scores.
+- Runs prize draws using either a random mode or an algorithmic mode.
+- Generates draw results and leaderboard rankings.
+- Gives winners a proof-submission flow for verification.
+- Allows admins to approve, reject, and mark winner payouts as paid.
+- Tracks charity preferences, direct donations, and charity contribution analytics.
+- Sends system and winner notifications through a configurable email webhook.
+
+## Main User Flows
+
+### Player Flow
+
+1. Create an account and choose a charity.
+2. Sign in and activate a subscription.
+3. Submit up to 5 golf scores.
+4. Enter prize draws and view results in the dashboard.
+5. If selected as a winner, submit screenshot proof for verification.
+6. Track winner status from `pending` to `verified` to `paid`.
+
+### Admin Flow
+
+1. Open the admin dashboard.
+2. Run a draw in `random` or `algorithm` mode.
+3. Review participants, results, and analytics.
+4. Open submitted winner proof.
+5. Verify or reject the submission.
+6. Mark verified winnings as paid.
+7. Manage the charity directory and monitor impact totals.
+
+## Core Features
+
+- `Authentication`: Signup, signin, JWT sessions, protected routes, admin/user roles.
+- `Subscriptions`: Monthly and yearly plans with mock payment activation flow.
+- `Score Management`: Save golf score entries and keep draw eligibility tied to active subscriptions.
+- `Draw Engine`: Generate draw numbers, evaluate matches, compute prize distribution, and create result records.
+- `Winner Verification`: Winners only, screenshot proof submission, admin review, payout-state transitions.
+- `Charity Directory`: Browse charities, inspect details, and make direct donations.
+- `Leaderboard`: Public-facing ranking view for top prize results.
+- `Admin Analytics`: Total users, active subscribers, prize totals, charity contribution totals, and pending verifications.
+- `Security`: JWT auth middleware, HTTPS enforcement in production, and security headers.
+- `Notifications`: Welcome emails, subscription updates, draw-result alerts, and winner-status notifications.
+
+## Tech Stack
+
+### Frontend
+
+- React
+- React Router
+- CSS modules/stylesheets with responsive layouts
+- Create React App toolchain
+
+### Backend
+
+- Node.js
+- Express
+- MongoDB
+- Mongoose
+- JWT (`jsonwebtoken`)
+- Password hashing with `bcryptjs`
+
+## Project Structure
+
+```text
+golf_charity_platform/
+├── backend/
+│   ├── controllers/      # Route handlers for auth, users, draws, results, payments, charities, admin
+│   ├── middleware/       # Auth and security middleware
+│   ├── models/           # Mongoose models
+│   ├── routes/           # API route definitions
+│   ├── service/          # Draw logic, auth helpers, seed data, notifications, subscriptions
+│   ├── connection.js     # MongoDB connection
+│   └── index.js          # Express app entry point
+├── frontend/
+│   ├── public/
+│   └── src/
+│       ├── pages/        # Home, auth, dashboard, charities, leaderboard, admin
+│       ├── styles/       # UI styling
+│       └── utils/        # API helpers
+└── README.md
+```
+
+## Key Pages
+
+- `/` Home page introducing the platform and featured charities
+- `/signin` User login
+- `/signup` User registration with charity selection
+- `/dashboard` Player dashboard for subscriptions, scores, draws, results, and proof upload
+- `/charities` Charity directory
+- `/charities/:id` Charity detail page with donation support
+- `/leaderboard` Public leaderboard of top result entries
+- `/admin` Admin control panel for draw operations and winner management
+
+## API Overview
+
+### Auth
+
+- `POST /api/auth/signup`
+- `POST /api/auth/signin`
+
+### Users
+
+- `GET /api/users/me`
+- `GET /api/users/:id`
+- `PUT /api/users/:id/subscription`
+- `PUT /api/users/:id/charity`
+
+### Scores
+
+- `POST /api/score`
+- `GET /api/score/:userId`
+
+### Draws And Results
+
+- `POST /api/draw/run-draw`
+- `GET /api/result/leaderboard`
+- `GET /api/result/:userId`
+- `PUT /api/result/:resultId/proof`
+
+### Payments
+
+- `POST /api/payments/checkout`
+- `GET /api/payments/me`
+
+### Charities
+
+- `GET /api/charities`
+- `GET /api/charities/featured`
+- `GET /api/charities/:id`
+- `POST /api/charities/donations`
+
+### Admin
+
+- `POST /api/admin/run-draw`
+- `GET /api/admin/users`
+- `GET /api/admin/results`
+- `GET /api/admin/analytics`
+- `PUT /api/admin/verify/:id`
+- `PUT /api/admin/reject/:id`
+- `PUT /api/admin/pay/:id`
+
+## Environment Variables
+
+Create a `backend/.env` file for local development.
+
+```env
+PORT=5000
+MONGO_URL=mongodb://127.0.0.1:27017/golf_charity_platform
+CORS_ORIGIN=http://localhost:3000
+JWT_SECRET=replace-with-a-secure-secret
+NODE_ENV=development
+ALLOW_INSECURE_HTTP=true
+APP_BASE_URL=http://localhost:3000
+MAILER_WEBHOOK_URL=
+MAILER_API_KEY=
+NOTIFICATIONS_FROM=no-reply@golfcharityplatform.local
+```
+
+Notes:
+
+- `JWT_SECRET` should be set to a strong secret in every non-demo environment.
+- `ALLOW_INSECURE_HTTP=true` is useful for local development only.
+- `MAILER_WEBHOOK_URL` enables actual email delivery. If omitted, notification payloads fall back to server logging.
+
+## Local Setup
+
+### 1. Clone the repository
+
+```bash
+git clone https://github.com/adityasingh6533/golf_charity_platform.git
+cd golf_charity_platform
+```
+
+### 2. Install dependencies
+
+```bash
+cd backend
+npm install
+cd ../frontend
+npm install
+```
+
+### 3. Configure environment variables
+
+Add the `backend/.env` file shown above.
+
+### 4. Start the backend
+
+```bash
+cd backend
+npm start
+```
+
+The backend runs on `http://localhost:5000`.
+
+### 5. Start the frontend
+
+```bash
+cd frontend
+npm start
+```
+
+The frontend runs on `http://localhost:3000`.
+
+## Seeded Data
+
+The backend seeds a default charity directory on startup, which helps the project work immediately in local development without requiring manual charity setup first.
+
+## Security And Business Rules
+
+- Only authenticated users can access protected user flows.
+- Draw participation depends on an active subscription.
+- Only winners can submit proof.
+- Proof submission is required before admin verification.
+- Only verified winners can be marked as paid.
+- Admin-only routes are protected by role checks.
+- HTTPS enforcement and security headers are enabled in the backend for production use.
+
+## Current Product Positioning
+
+This project demonstrates a charitable prize-draw platform for golf participants, with a strong focus on:
+
+- engagement through score-based recurring draws
+- accountability through winner verification
+- transparency through leaderboard and analytics views
+- social impact through charity selection and donations
+
+## Future Enhancements
+
+- Real payment gateway integration
+- Real image/file uploads to cloud storage
+- Automated scheduled draws
+- Email template system
+- Test coverage for critical flows
+- CI/CD pipeline and deployment documentation
+- Audit logs for admin actions
+
+## Why This Project Stands Out
+
+Unlike a typical CRUD charity or sports app, Golf Charity Platform connects multiple systems into one cohesive experience:
+
+- sports participation
+- subscription monetization
+- prize allocation
+- winner verification
+- charity support
+- admin operations
+
+That makes it a solid portfolio project for demonstrating full-stack product thinking, business-rule implementation, user/admin role separation, and API-driven architecture.
+
+## License
+
+This project is currently unlicensed. Add a license if you plan to distribute or open-source it publicly.
