# Community Dabba 2.0

> **Share Food. Reduce Waste. Build Community.**

A full-stack MERN application connecting food donors with people in need, featuring real-time chat, QR pickup verification, gamification, and admin analytics.

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, React Query, React Hook Form, Framer Motion, Recharts, Socket.IO Client

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Socket.IO, Cloudinary, Multer, Zod

## Features

- **Donor System:** Create/edit/delete meals, image uploads, expiry tracking, request management
- **Receiver System:** Browse/search/filter meals, request meals, track status, save favorites
- **Request Lifecycle:** Pending → Approved → Pickup Scheduled → Ready → Collected → Completed
- **QR Pickup:** 6-digit pickup code verification system
- **Real-time Chat:** Socket.IO messaging between donors and receivers
- **Notifications:** Real-time push notifications for all events
- **Ratings & Feedback:** Post-transaction rating system
- **Gamification:** Badges, leaderboard, community impact stats
- **Admin Dashboard:** User management, meal moderation, reports, analytics with charts
- **Dark Mode:** System preference detection with manual toggle
- **Responsive:** Works on desktop, tablet, and mobile

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd backend
cp .env.example .env    # Configure your env vars
npm install
npm run seed            # Seed demo data (optional)
npm run dev             # Starts on port 5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev             # Starts on port 5173
```

### Demo Accounts (after seeding)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@communitydabba.com | admin123 |
| Donor | ravi@example.com | password123 |
| Receiver | amit@example.com | password123 |

## Environment Variables

See `backend/.env.example` for all required variables.

## Project Structure

```
community-dabba/
├── backend/
│   ├── config/         # DB, Cloudinary, Environment
│   ├── controllers/    # Route handlers
│   ├── middleware/      # Auth, Upload, Error handling
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── sockets/        # Socket.IO handlers
│   ├── utils/          # Helpers, seed data
│   └── validators/     # Zod validation schemas
└── frontend/
    └── src/
        ├── api/        # Axios API functions
        ├── components/ # Reusable UI components
        ├── context/    # Auth, Theme providers
        ├── hooks/      # Custom hooks
        ├── layouts/    # Page layouts
        ├── pages/      # Route pages
        │   └── admin/  # Admin pages
        ├── utils/      # Helpers
        └── constants/  # App constants
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/meals | List meals (public) |
| POST | /api/meals | Create meal (donor) |
| GET | /api/meals/:id | Meal details |
| PUT | /api/meals/:id | Update meal |
| DELETE | /api/meals/:id | Delete meal |
| POST | /api/requests | Create request |
| PATCH | /api/requests/:id/status | Update status |
| POST | /api/requests/:id/verify-pickup | Verify QR code |
| GET | /api/messages/conversations | List conversations |
| POST | /api/messages | Send message |
| GET | /api/notifications | List notifications |
| POST | /api/feedback | Rate transaction |
| GET | /api/admin/stats | Dashboard stats |
