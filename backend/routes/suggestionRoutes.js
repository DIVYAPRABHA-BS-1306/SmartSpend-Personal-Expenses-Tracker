import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getSuggestions } from '../controllers/suggestionController.js';

const router = express.Router();
router.use(protect);
router.get('/', getSuggestions);

export default router;
