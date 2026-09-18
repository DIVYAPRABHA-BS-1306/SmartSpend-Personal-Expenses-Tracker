import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const registerUser = async (req, res) => {
  const { name, email, password, confirmPassword, monthlyIncome, monthlySavingsTarget } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must have at least 6 characters' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    monthlyIncome: Number(monthlyIncome) || 0,
    monthlySavingsTarget: Number(monthlySavingsTarget) || 0,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(500).json({ message: 'Unable to create user' });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  });
};

export const getProfile = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    monthlyIncome: req.user.monthlyIncome ?? 0,
    monthlySavingsTarget: req.user.monthlySavingsTarget ?? 0,
    createdAt: req.user.createdAt,
  });
};

export const updateProfile = async (req, res) => {
  const { name, email, password, monthlyIncome, monthlySavingsTarget } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (email && email !== user.email) {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    user.email = email;
  }

  if (name) user.name = name;

  if (monthlyIncome !== undefined) {
    const monthlyIncomeValue = Number(monthlyIncome);
    if (Number.isNaN(monthlyIncomeValue) || monthlyIncomeValue < 0) {
      return res.status(400).json({ message: 'Monthly income must be a valid non-negative number' });
    }
    user.monthlyIncome = monthlyIncomeValue;
  }

  if (monthlySavingsTarget !== undefined) {
    const monthlySavingsTargetValue = Number(monthlySavingsTarget);
    if (Number.isNaN(monthlySavingsTargetValue) || monthlySavingsTargetValue < 0) {
      return res.status(400).json({ message: 'Monthly savings target must be a valid non-negative number' });
    }
    user.monthlySavingsTarget = monthlySavingsTargetValue;
  }

  if (password) {
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must have at least 6 characters' });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    monthlyIncome: updatedUser.monthlyIncome,
    monthlySavingsTarget: updatedUser.monthlySavingsTarget,
    createdAt: updatedUser.createdAt,
  });
};
