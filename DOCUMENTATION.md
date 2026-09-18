# SmartSpend Documentation

## Overview
SmartSpend is a full-stack personal expense tracker designed to help users manage their finances effectively. It supports:
- User registration and authentication
- Transaction tracking (income and expenses)
- Budget creation and tracking
- Savings goal planning
- Wishlist items with purchase recommendations
- Dashboard analytics and charts

## Technology Stack
- Frontend: React, Vite, JavaScript, React Router, Axios, Recharts
- Backend: Node.js, Express, MongoDB, Mongoose
- Authentication: JWT, bcryptjs
- Development: nodemon, concurrently

## Project Structure
```
SmartSpend/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── package.json
├── README.md
└── DOCUMENTATION.md
```

## Setup Instructions

### Install dependencies
From the project root, run:
```bash
npm run install-all
```

This installs both backend and frontend dependencies.

### Backend setup
1. Open a terminal in `backend/`
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file in the `backend/` folder with the following values:
```env
MONGO_URI=
JWT_SECRET=
PORT=5000
```
4. Start the backend server:
```bash
npm run dev
```

### Frontend setup
1. Open a terminal in `frontend/`
2. Install dependencies:
```bash
npm install
```
3. Start the frontend app:
```bash
npm run dev
```

## Available Scripts

### Root workspace
- `npm run install-all` — install dependencies for both backend and frontend
- `npm run dev` — start both backend and frontend concurrently

### Backend
- `npm run dev` — start backend with `nodemon`
- `npm start` — run backend with Node.js

### Frontend
- `npm run dev` — start Vite development server
- `npm run build` — build production bundle
- `npm run preview` — preview the built frontend

## Backend API Endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`

### Transactions
- `GET /api/transactions`
- `POST /api/transactions`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`

### Dashboard
- `GET /api/dashboard/summary`
- `GET /api/dashboard/analytics`

### Budgets
- `GET /api/budgets`
- `POST /api/budgets`
- `PUT /api/budgets/:id`
- `DELETE /api/budgets/:id`

### Suggestions
- `GET /api/suggestions`

### Goals
- `GET /api/goals`
- `POST /api/goals`
- `PUT /api/goals/:id`
- `DELETE /api/goals/:id`

### Wishlist
- `GET /api/wishlist`
- `POST /api/wishlist`
- `PUT /api/wishlist/:id`
- `DELETE /api/wishlist/:id`
- `GET /api/wishlist/:id/recommendation`

## Notes
- The backend uses ES modules (`type: "module"` in `backend/package.json`).
- Ensure MongoDB is running and `MONGO_URI` is set correctly before starting the backend.
- The frontend connects to the backend APIs and requires user authentication for protected routes.

## Future Enhancements
- Bank account sync and transaction imports
- Recurring payments and reminders
- CSV export/import
- Multi-currency support
- More advanced analytics and reporting
