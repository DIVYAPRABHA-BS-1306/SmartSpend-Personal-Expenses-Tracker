import mongoose from 'mongoose';

const savingGoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, required: true, default: 0 },
  targetDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

const SavingGoal = mongoose.model('SavingGoal', savingGoalSchema);
export default SavingGoal;
