import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getWishlist,
  createWishlistItem,
  updateWishlistItem,
  deleteWishlistItem,
  getPurchaseRecommendation,
} from '../controllers/wishlistController.js';

const router = express.Router();
router.use(protect);
router.get('/', getWishlist);
router.post('/', createWishlistItem);
router.put('/:id', updateWishlistItem);
router.delete('/:id', deleteWishlistItem);
router.get('/:id/recommendation', getPurchaseRecommendation);

export default router;
