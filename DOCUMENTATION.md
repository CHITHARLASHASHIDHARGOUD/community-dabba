================================================================================
                COMMUNITY DABBA 2.0 - FULL PROJECT DOCUMENTATION
================================================================================

TABLE OF CONTENTS
  1.  Project Overview
  2.  Architecture & Design
  3.  Technology Stack
  4.  Database Design
  5.  API Reference
  6.  Frontend Architecture
  7.  Authentication & Authorization
  8.  Real-Time Communication
  9.  Image Upload System
  10. Status Flow & Business Logic
  11. Admin Dashboard Analytics
  12. Deployment Guide
  13. Known Limitations & Future Scope

================================================================================
1. PROJECT OVERVIEW
================================================================================

Community Dabba 2.0 is a full-stack web application designed to connect
food donors with food receivers in local communities. The platform
facilitates food donation, pickup coordination, real-time communication,
and provides admin oversight.

KEY FEATURES:
  - Three user roles: Donor, Receiver, Admin
  - Food listing with images, categories, and dietary info
  - Meal request and approval workflow
  - Real-time chat between donor and receiver
  - Pickup code verification system
  - Rating and feedback system
  - Report and moderation system
  - Admin dashboard with analytics and charts
  - Responsive dark-mode UI
  - Image upload with local file storage

================================================================================
2. ARCHITECTURE & DESIGN
================================================================================

The application follows a classic MERN stack architecture:

  +-------------------+     +-------------------+     +-------------------+
  |                   |     |                   |     |                   |
  |    FRONTEND       | <-> |     BACKEND       | <-> |     DATABASE      |
  |   (React+Vite)    |     |   (Express.js)    |     |    (MongoDB)      |
  |   Port: 5173      |     |   Port: 5000      |     |   Port: 27017     |
  |                   |     |                   |     |                   |
  +-------------------+     +-------------------+     +-------------------+
         |                           |
         |                     +-----+-----+
         |                     |           |
         |                  Socket.IO   File Storage
         |                  (Real-time)  (uploads/)
         |
    Vite Proxy
    /api -> :5000
    /uploads -> :5000
    /socket.io -> :5000

COMMUNICATION FLOW:
  1. Frontend sends HTTP requests via Axios to /api/* endpoints
  2. Vite proxy forwards requests to backend on port 5000
  3. Backend processes requests, queries MongoDB, returns JSON
  4. Socket.IO handles real-time events (chat messages)
  5. Images stored locally in backend/uploads/meals/
  6. Static files served via Express static middleware

================================================================================
3. TECHNOLOGY STACK
================================================================================

BACKEND:
  Framework    : Express.js v4.22.2
  Runtime      : Node.js v18+
  Database     : MongoDB v6+ via Mongoose v8.24.3
  Auth         : JWT (jsonwebtoken v9.0.3)
  Validation   : Zod v3.25.76
  Real-time    : Socket.IO v4.8.3
  Upload       : Multer v1.4.5-lts.2 (disk storage)
  Security     : Helmet v7.2, bcryptjs v2.4.3
  Rate Limit   : express-rate-limit v7.5.1
  Env Config   : dotenv v16.6.1

FRONTEND:
  UI Library   : React v19.2.8
  Build Tool   : Vite v8.2.1
  CSS          : Tailwind CSS v4.3.3
  Animations   : Framer Motion v13.1.0
  Charts       : Recharts v3.10.1
  Routing      : React Router v7.18.2
  Data Fetching: TanStack React Query v5.101.4
  Forms        : React Hook Form v7.85.0
  HTTP Client  : Axios v1.19.0
  Real-time    : Socket.IO Client v4.8.3
  Icons        : Lucide React v1.31.0
  Toasts       : React Hot Toast v2.6.0
  QR Code      : qrcode.react v4.2.0

================================================================================
4. DATABASE DESIGN
================================================================================

MODELS (9 total):

  4.1 USER SCHEMA
  {
    name:           String (required),
    email:          String (required, unique, lowercase),
    password:       String (hashed with bcryptjs),
    phone:          String,
    role:           Enum ['donor', 'receiver', 'admin'],
    avatar:         String (default: SVG data URI),
    location:       { type: 'Point', coordinates: [Number], address: String },
    rating:         Number (default: 0),
    totalRatings:   Number (default: 0),
    mealsDonated:   Number (default: 0),
    mealsReceived:  Number (default: 0),
    badges:         [String],
    organization:   String,
    isVerified:     Boolean (default: false),
    isActive:       Boolean (default: true),
    lastActive:     Date
  }
  Indexes: email (unique), location (2dsphere)

  4.2 MEAL SCHEMA
  {
    donor:              ObjectId (ref: User, required),
    title:              String (required, max 200),
    description:        String (max 1000),
    category:           Enum ['meals','rice','biryani','bakery','fruits',
                              'vegetables','snacks','dairy','packed_food','other'],
    quantity:           String,
    servings:           Number (required, min 1),
    foodType:           Enum ['vegetarian','non-vegetarian','vegan'],
    images:             [{ url: String, publicId: String }],
    location:           { type: 'Point', coordinates: [Number], address: String },
    status:             Enum ['active','expiring_soon','completed','expired','donated'],
    pickupInstructions: String (max 500),
    contactPreference:  Enum ['chat','phone','both'],
    dietaryInfo:        [String],
    availableUntil:     Date (required),
    preparedAt:         Date
  }
  Indexes: location (2dsphere), category, status, donor

  4.3 REQUEST SCHEMA
  {
    meal:           ObjectId (ref: Meal, required),
    requester:      ObjectId (ref: User, required),
    donor:          ObjectId (ref: User, required),
    message:        String,
    status:         Enum ['pending','approved','rejected','pickup_scheduled',
                          'ready_for_pickup','collected','completed','cancelled'],
    pickupCode:     String (6-digit, generated on pickup_scheduled),
    pickupTime:     Date,
    statusHistory:  [{ status: String, timestamp: Date, note: String }]
  }

  4.4 CONVERSATION SCHEMA
  {
    participants:   [ObjectId (ref: User)] (exactly 2),
    meal:           ObjectId (ref: Meal),
    lastMessage:    ObjectId (ref: Message),
    lastMessageAt:  Date
  }
  Indexes: participants, lastMessageAt (descending)

  4.5 MESSAGE SCHEMA
  {
    conversation:   ObjectId (ref: Conversation, required),
    sender:         ObjectId (ref: User, required),
    content:        String (required, max 5000)
  }
  Indexes: conversation, createdAt

  4.6 NOTIFICATION SCHEMA
  {
    recipient:      ObjectId (ref: User, required),
    sender:         ObjectId (ref: User),
    type:           Enum ['new_request','request_approved','request_rejected',
                          'pickup_scheduled','pickup_reminder','pickup_completed',
                          'new_message','verification_approved','system'],
    title:          String (required),
    message:        String (required),
    data:           Mixed,
    isRead:         Boolean (default: false)
  }
  Indexes: recipient, createdAt

  4.7 FAVORITE SCHEMA
  {
    user:           ObjectId (ref: User, required),
    meal:           ObjectId (ref: Meal, required)
  }
  Compound unique index: (user, meal)

  4.8 FEEDBACK SCHEMA
  {
    request:        ObjectId (ref: Request, required),
    reviewer:       ObjectId (ref: User, required),
    reviewee:       ObjectId (ref: User, required),
    rating:         Number (1-5, required),
    comment:        String
  }
  Unique index: request (one feedback per request)

  4.9 REPORT SCHEMA
  {
    reporter:       ObjectId (ref: User, required),
    targetType:     Enum ['meal','user','request'],
    targetId:       ObjectId (required),
    reason:         Enum ['fake_meal','expired_food','wrong_location',
                          'inappropriate','suspicious','abuse','other'],
    description:    String,
    status:         Enum ['open','investigating','resolved','dismissed'],
    adminNotes:     String
  }

================================================================================
5. API REFERENCE
================================================================================

All endpoints are prefixed with /api.
Protected endpoints require Authorization: Bearer <token> header.

  5.1 AUTH ENDPOINTS
  POST   /auth/register        Body: { name, email, password, confirmPassword, role }
                                 Response: { success, data: { user, token } }

  POST   /auth/login           Body: { email, password }
                                 Response: { success, data: { user, token } }

  GET    /auth/me              Response: { success, data: { user } }

  PUT    /auth/me              Body: { name, phone, location }
                                 Response: { success, data: { user } }

  POST   /auth/change-password  Body: { currentPassword, newPassword }

  5.2 MEAL ENDPOINTS
  GET    /meals                Query: ?limit, ?sort, ?category, ?foodType, ?search
                                 Response: { success, data: { meals, pagination } }

  GET    /meals/my             Response: { success, data: { meals, pagination } }

  GET    /meals/:id            Response: { success, data: { meal } }

  POST   /meals                Body: FormData (title, category, servings, foodType,
                                 location, image, availableUntil, etc.)
                                 Response: { success, data: { meal } }

  PUT    /meals/:id            Body: FormData (same fields)
                                 Response: { success, data: { meal } }

  DELETE /meals/:id            Response: { success, message }

  5.3 REQUEST ENDPOINTS
  POST   /requests             Body: { mealId, message }
                                 Response: { success, data: { request } }

  GET    /requests/my          Response: { success, data: { requests, pagination } }

  GET    /requests/received    Response: { success, data: { requests, pagination } }

  PATCH  /requests/:id/status  Body: { status }
                                 Response: { success, data: { request } }

  POST   /requests/:id/verify-pickup  Body: { pickupCode }

  POST   /requests/:id/complete       Response: { success, message }

  PATCH  /requests/:id/cancel         Response: { success, message }

  5.4 MESSAGE ENDPOINTS
  GET    /messages/conversations       Response: [conversation, ...]

  POST   /messages/conversations       Body: { recipientId, mealId }
                                       Response: conversation object

  GET    /messages/conversations/:id   Response: { messages, pagination }

  POST   /messages                     Body: { conversationId, content }
                                       Response: message object

  5.5 OTHER ENDPOINTS
  POST   /favorites/:mealId           Toggle favorite
  GET    /favorites                   Get user's favorite meals
  GET    /notifications               Get notifications
  PATCH  /notifications/:id/read      Mark notification read
  PATCH  /notifications/read-all      Mark all read
  POST   /feedback                    Body: { requestId, rating, comment }
  POST   /reports                     Body: { targetType, targetId, reason, description }
  GET    /reports/admin               Admin: list all reports
  PATCH  /reports/admin/:id           Admin: update report status

  5.6 ADMIN ENDPOINTS
  GET    /admin/stats                 Dashboard statistics
  GET    /admin/stats/public          Public stats for landing page
  GET    /admin/analytics/meals       Meals aggregated by date
  GET    /admin/analytics/categories  Meals aggregated by category
  GET    /admin/leaderboard           Top donors by completed meals
  GET    /users                       List all users (admin)
  PATCH  /users/:id/status            Block/unblock user
  PATCH  /users/:id/verify            Toggle user verification

================================================================================
6. FRONTEND ARCHITECTURE
================================================================================

  6.1 PAGE COMPONENTS (22 pages):
    - Landing.jsx          - Hero, stats, featured meals, testimonials
    - Login.jsx            - Email/password login form
    - Register.jsx         - Registration form with role selection
    - Explore.jsx          - Public meal browsing with filters/search
    - MealDetail.jsx       - Single meal view with request modal
    - Dashboard.jsx        - Role-based redirect (donor/receiver/admin)
    - DonorDashboard.jsx   - Donor stats, meals, requests, charts
    - ReceiverDashboard.jsx- Receiver stats, available food, requests
    - NewMeal.jsx          - Create meal form with image upload
    - EditMeal.jsx         - Edit/delete meal form
    - Requests.jsx         - List of requests (received/my)
    - RequestDetail.jsx    - Request detail + inline chat
    - Chat.jsx             - Conversations list
    - ChatRoom.jsx         - Individual chat room (Socket.IO)
    - Profile.jsx          - View/edit user profile
    - Favorites.jsx        - Saved meals list
    - Notifications.jsx    - Notification list with mark-read
    - NotFound.jsx         - 404 page
    - admin/AdminDashboard.jsx  - Admin stats + charts
    - admin/AdminUsers.jsx      - User management
    - admin/AdminMeals.jsx      - Meal management
    - admin/AdminReports.jsx    - Report management

  6.2 REUSABLE COMPONENTS:
    - MealCard.jsx         - Meal card with image, info, favorite button
    - StatusBadge.jsx      - Colored status badge
    - StatCard.jsx         - Stats card with icon and value
    - RatingStars.jsx      - Star rating display and input
    - LoadingSpinner.jsx   - Full-screen loading spinner
    - ProtectedRoute.jsx   - Auth guard (redirects to /login)
    - AdminRoute.jsx       - Admin-only route guard
    - Navbar.jsx           - Top navigation bar
    - Footer.jsx           - Site footer

  6.3 STATE MANAGEMENT:
    - AuthContext: user state, login/register/logout functions
    - React Query: server state caching and invalidation
    - Local State: React useState for UI state

  6.4 API LAYER:
    - axios.js: Axios instance with auth interceptor + Socket.IO singleton
    - auth.js: Login, register, getMe, updateProfile
    - meals.js: CRUD operations for meals
    - messages.js: Conversation and message APIs
    - requests.js: Request CRUD operations
    - Other service modules for favorites, notifications, etc.

  6.5 ROUTING:
    - Public routes: /, /login, /register, /explore, /meals/:id
    - Protected routes: /dashboard, /donor/*, /receiver/*, /requests, /chat, /profile
    - Admin routes: /admin/* (admin-only)

================================================================================
7. AUTHENTICATION & AUTHORIZATION
================================================================================

  7.1 REGISTRATION FLOW:
    1. User submits name, email, password, role (donor/receiver only)
    2. Backend validates with Zod schema
    3. Password hashed with bcryptjs (10 rounds)
    4. User created in MongoDB
    5. JWT token generated (7-day expiry)
    6. Token + user returned to frontend
    7. Stored in localStorage

  7.2 LOGIN FLOW:
    1. User submits email + password
    2. Backend finds user by email
    3. bcrypt.compare validates password
    4. JWT token generated
    5. Token + user returned
    6. Frontend stores in localStorage + sets AuthContext

  7.3 AUTH MIDDLEWARE (protect):
    1. Extracts Bearer token from Authorization header
    2. Verifies JWT with secret
    3. Finds user by decoded id
    4. Attaches user to req.user
    5. Rejects if token invalid or user not found

  7.4 ROLE-BASED ACCESS:
    - protect: Any authenticated user
    - role('admin'): Admin-only routes
    - Frontend: ProtectedRoute component checks isAuthenticated
    - Frontend: AdminRoute component checks user.role === 'admin'

  7.5 TOKEN STRUCTURE:
    {
      id: user._id,
      role: user.role,
      iat: issued_at,
      exp: expiry (7 days)
    }

================================================================================
8. REAL-TIME COMMUNICATION
================================================================================

  8.1 SOCKET.IO SETUP:
    - Server creates HTTP server from Express app
    - Socket.IO attached with CORS configuration
    - JWT authentication middleware on connection
    - User joins private room: `user:{userId}`

  8.2 EVENTS:
    Client -> Server:
      - send-message: { conversationId, recipientId, content }
      - join-conversation: { conversationId }

    Server -> Client:
      - receive-message: { conversationId, message }
      - notification: notification object

  8.3 MESSAGE FLOW:
    1. Sender sends message via HTTP POST /api/messages
    2. Backend creates Message document
    3. Updates Conversation.lastMessage and lastMessageAt
    4. Emits 'receive-message' to recipient's room
    5. Creates notification for recipient
    6. Frontend receives event, updates React Query cache

  8.4 CONVERSATION CREATION:
    - Created on-demand when first message is sent
    - Uses getOrCreateConversation endpoint
    - Participants: [sender, recipient]
    - Optionally linked to a meal

================================================================================
9. IMAGE UPLOAD SYSTEM
================================================================================

  9.1 STORAGE:
    - Local file storage using Multer diskStorage
    - Directory: backend/uploads/meals/
    - Filename: {timestamp}-{random}.{ext}
    - Max file size: 5MB
    - Allowed types: JPEG, JPG, PNG, WebP, GIF

  9.2 UPLOAD FLOW:
    1. Frontend creates FormData with image file
    2. Axios interceptor removes Content-Type header (lets browser set boundary)
    3. Multer saves file to disk
    4. Controller stores { url: '/uploads/meals/filename', publicId: 'filename' }
    5. Image served via Express static middleware

  9.3 SERVING:
    - Backend: app.use('/uploads', express.static('uploads'))
    - Frontend: Vite proxy forwards /uploads to backend
    - URL format: /uploads/meals/{filename}

  9.4 AVATAR SYSTEM:
    - Default: Inline SVG data URI (green circle with initial)
    - Fallback: ui-avatars.com API (generates from name)
    - No server-side storage for avatars

================================================================================
10. STATUS FLOW & BUSINESS LOGIC
================================================================================

  10.1 MEAL STATUS:
    active -> expiring_soon -> expired
    active -> completed (when request is completed)
    active -> donated

  10.2 REQUEST STATUS:
    pending (initial)
      -> approved (donor accepts)
      -> rejected (donor declines)
      -> cancelled (requester cancels)

    approved
      -> pickup_scheduled (with pickup code)
      -> ready_for_pickup
      -> collected (pickup verified)
      -> completed (marked by donor)
      -> rejected
      -> cancelled

    Any active state -> completed (donor can complete directly)

  10.3 NOTIFICATION TYPES:
    - new_request: Sent to donor when receiver requests meal
    - request_approved: Sent to receiver when donor approves
    - request_rejected: Sent to receiver when donor rejects
    - pickup_scheduled: Sent to receiver with pickup details
    - pickup_completed: Sent after pickup verification
    - new_message: Sent when new chat message arrives

  10.4 GAMIFICATION:
    - mealsDonated counter on User (incremented on request completion)
    - mealsReceived counter on User
    - rating system (1-5 stars)
    - badges array (extensible)
    - Top donors leaderboard (admin analytics)

================================================================================
11. ADMIN DASHBOARD ANALYTICS
================================================================================

  11.1 STATS ENDPOINT:
    - totalUsers, donors, receivers
    - totalMeals, activeMeals
    - completedRequests, pendingRequests
    - peopleHelped, avgRating, verifiedDonors

  11.2 MEALS OVER TIME:
    - MongoDB aggregation: group by date (createdAt)
    - Returns: [{ _id: 'YYYY-MM-DD', count: N }]
    - Frontend maps to: [{ name: date, meals: count }]

  11.3 CATEGORY BREAKDOWN:
    - MongoDB aggregation: group by category
    - Returns: [{ _id: 'biryani', count: N }]
    - Frontend maps to: [{ name: category, value: count }]
    - Rendered as PieChart with Recharts

  11.4 TOP DONORS:
    - MongoDB aggregation: completed meals grouped by donor
    - Lookup user details (name, avatar)
    - Returns: [{ name, mealsDonated, avatar }]

================================================================================
12. DEPLOYMENT GUIDE
================================================================================

  12.1 ENVIRONMENT VARIABLES:
    PORT=5000
    MONGODB_URI=mongodb+srv://...
    JWT_SECRET=your_strong_secret_here
    CLIENT_URL=https://yourdomain.com
    NODE_ENV=production
    CLOUDINARY_CLOUD_NAME=xxx (optional)
    CLOUDINARY_API_KEY=xxx (optional)
    CLOUDINARY_API_SECRET=xxx (optional)

  12.2 BUILD:
    Frontend: cd frontend && npm run build
    Output: frontend/dist/

  12.3 PRODUCTION:
    - Serve frontend/build from Express or nginx
    - Backend runs on Node.js
    - MongoDB Atlas for database
    - Configure CORS for production domain
    - Set NODE_ENV=production

  12.4 RECOMMENDED HOSTING:
    - Frontend: Vercel, Netlify, or nginx
    - Backend: Railway, Render, or VPS
    - Database: MongoDB Atlas (free tier available)

================================================================================
13. KNOWN LIMITATIONS & FUTURE SCOPE
================================================================================

  KNOWN LIMITATIONS:
    - Image upload uses local disk (not cloud storage in dev)
    - No email verification for registration
    - No password reset flow
    - No push notifications (browser)
    - No geospatial distance calculation in explore
    - Chat does not support file/image messages
    - No meal expiration auto-update cron job

  FUTURE SCOPE:
    - Cloudinary integration for image CDN
    - Email verification and password reset
    - Push notifications via service workers
    - Geospatial nearby food with distance display
    - Food delivery partner integration
    - Multi-language support
    - Mobile app (React Native)
    - AI-powered food matching
    - Carbon footprint tracking
    - Organization/NGO verification system
    - Meal scheduling and recurring donations
    - QR code for pickup verification

================================================================================
                        END OF DOCUMENTATION
================================================================================

Project    : Community Dabba 2.0
Version    : 2.0.0
Stack      : MERN (MongoDB, Express, React, Node.js)
License    : MIT

================================================================================
