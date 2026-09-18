# SmartSpend

SmartSpend is a full-stack personal expense tracker designed to help users manage income, expenses, budgets, savings goals, and wishlist purchases with smart recommendations based on real financial data.

## Features

- User registration and login with JWT authentication
- Dashboard with balance, income, expenses, savings, and budget cards
- Real-time charts powered by Recharts and MongoDB data
- Transaction management with add, edit, delete, search, filter, and sort
- Budget management with category budgets, usage tracking, and warnings
- Smart saving suggestions based on actual spending and budget usage
- Saving goals with progress tracking and recommended monthly savings
- Wishlist with purchase recommendations and affordability insights
- Responsive UI with dark/light/system theme support

## Technology Stack

- Frontend: React, JavaScript, React Router, Axios, Recharts
- Backend: Node.js, Express.js, REST API
- Database: MongoDB, Mongoose
- Authentication: JWT, bcrypt

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
   │   ├── App.jsx
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
├── .gitignore
└── README.md
```

## Installation

### Backend

1. Open terminal in `backend/`
2. Run `npm install`
3. Create a `.env` file with:

```
MONGO_URI=
JWT_SECRET=
PORT=5000
```

4. Start backend:

```
npm run dev
```

### Frontend

1. Open terminal in `frontend/`
2. Run `npm install`
3. Start frontend:

```
npm run dev
```

## API Documentation

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `GET /api/transactions`
- `POST /api/transactions`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`
- `GET /api/dashboard/summary`
- `GET /api/dashboard/analytics`
- `GET /api/budgets`
- `POST /api/budgets`
- `PUT /api/budgets/:id`
- `DELETE /api/budgets/:id`
- `GET /api/suggestions`
- `GET /api/goals`
- `POST /api/goals`
- `PUT /api/goals/:id`
- `DELETE /api/goals/:id`
- `GET /api/wishlist`
- `POST /api/wishlist`
- `PUT /api/wishlist/:id`
- `DELETE /api/wishlist/:id`
- `GET /api/wishlist/:id/recommendation`

## Future Enhancements

- Add bank sync and transaction import
- Add recurring payments and reminders
- Add mobile app support
- Add export/import CSV
- Add multi-currency support
- Add more advanced analytics and reports
