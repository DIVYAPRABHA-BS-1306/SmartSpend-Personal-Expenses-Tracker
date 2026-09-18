import SavingGoal from '../models/SavingGoal.js';

export const getGoals = async (req, res) => {
  const goals = await SavingGoal.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(goals);
};

export const createGoal = async (req, res) => {
  const { name, targetAmount, currentAmount, targetDate } = req.body;
  if (!name || !targetAmount || !targetDate) {
    return res.status(400).json({ message: 'Missing required goal fields' });
  }

  const goal = await SavingGoal.create({
    userId: req.user._id,
    name,
    targetAmount,
    currentAmount: currentAmount || 0,
    targetDate: new Date(targetDate),
  });
  res.status(201).json(goal);
};

export const updateGoal = async (req, res) => {
  const goal = await SavingGoal.findOne({ _id: req.params.id, userId: req.user._id });
  if (!goal) {
    return res.status(404).json({ message: 'Saving goal not found' });
  }

  const { name, targetAmount, currentAmount, targetDate } = req.body;
  goal.name = name || goal.name;
  goal.targetAmount = targetAmount ?? goal.targetAmount;
  goal.currentAmount = currentAmount ?? goal.currentAmount;
  goal.targetDate = targetDate ? new Date(targetDate) : goal.targetDate;

  await goal.save();
  res.json(goal);
};

export const deleteGoal = async (req, res) => {
  const goal = await SavingGoal.findOne({ _id: req.params.id, userId: req.user._id });
  if (!goal) {
    return res.status(404).json({ message: 'Saving goal not found' });
  }

  await goal.deleteOne();
  res.json({ message: 'Saving goal deleted' });
};
