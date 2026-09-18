import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getDashboardSummary, getDashboardAnalytics } from '../controllers/dashboardController.js';

const router = express.Router();
router.use(protect);
router.get('/summary', getDashboardSummary);
router.get('/analytics', getDashboardAnalytics);

export default router;
