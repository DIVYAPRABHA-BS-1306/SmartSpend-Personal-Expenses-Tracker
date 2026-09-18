import Wishlist from '../models/Wishlist.js';
import purchaseRecommendationService from '../services/purchaseRecommendationService.js';

export const getWishlist = async (req, res) => {
  const items = await Wishlist.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(items);
};

export const createWishlistItem = async (req, res) => {
  const { productName, price, category, priority, targetDate, notes } = req.body;
  if (!productName || !price || !category || !priority || !targetDate) {
    return res.status(400).json({ message: 'Missing required wishlist fields' });
  }

  const item = await Wishlist.create({
    userId: req.user._id,
    productName,
    price,
    category,
    priority,
    targetDate: new Date(targetDate),
    notes,
  });
  res.status(201).json(item);
};

export const updateWishlistItem = async (req, res) => {
  const item = await Wishlist.findOne({ _id: req.params.id, userId: req.user._id });
  if (!item) {
    return res.status(404).json({ message: 'Wishlist item not found' });
  }

  const { productName, price, category, priority, targetDate, notes } = req.body;
  item.productName = productName || item.productName;
  item.price = price ?? item.price;
  item.category = category || item.category;
  item.priority = priority || item.priority;
  item.targetDate = targetDate ? new Date(targetDate) : item.targetDate;
  item.notes = notes ?? item.notes;

  await item.save();
  res.json(item);
};

export const deleteWishlistItem = async (req, res) => {
  const item = await Wishlist.findOne({ _id: req.params.id, userId: req.user._id });
  if (!item) {
    return res.status(404).json({ message: 'Wishlist item not found' });
  }

  await item.deleteOne();
  res.json({ message: 'Wishlist item deleted' });
};

export const getPurchaseRecommendation = async (req, res) => {
  const item = await Wishlist.findOne({ _id: req.params.id, userId: req.user._id });
  if (!item) {
    return res.status(404).json({ message: 'Wishlist item not found' });
  }

  const recommendation = await purchaseRecommendationService(req.user._id, item);
  res.json(recommendation);
};
