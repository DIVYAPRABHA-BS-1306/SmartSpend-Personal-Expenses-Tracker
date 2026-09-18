import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDatabase from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import suggestionRoutes from './routes/suggestionRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

connectDatabase();

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/wishlist', wishlistRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SmartSpend backend running on port ${PORT}`);
});
