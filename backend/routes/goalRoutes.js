import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getGoals, createGoal, updateGoal, deleteGoal } from '../controllers/goalController.js';

const router = express.Router();
router.use(protect);
router.get('/', getGoals);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

export default router;
