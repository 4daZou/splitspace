/**
 * SplitSpace - controllers/expense.controller.js
 * Handles expense CRUD and auto-splitting logic.
 */

const { Expense, Roommate } = require('../models');

// GET /api/expenses
exports.getAll = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate('createdBy', 'name')
      .populate('splitBetween', 'name')
      .populate('splitAmounts.roommate', 'name')
      .sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/expenses/:id
exports.getOne = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('splitBetween', 'name')
      .populate('splitAmounts.roommate', 'name');
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/expenses
exports.create = async (req, res) => {
  try {
    const { title, category, amount, dueDate, createdBy, splitBetween, notes } = req.body;

    // Auto-split evenly among selected roommates
    const splitCount = splitBetween && splitBetween.length > 0 ? splitBetween.length : 1;
    const shareAmount = parseFloat((amount / splitCount).toFixed(2));

    const splitAmounts = (splitBetween || []).map((roommateId) => ({
      roommate: roommateId,
      amount:   shareAmount,
      isPaid:   false,
    }));

    const expense = new Expense({ title, category, amount, dueDate, createdBy, splitBetween, splitAmounts, notes });
    const saved = await expense.save();

    // Update roommate balances
    for (const split of splitAmounts) {
      if (split.roommate.toString() !== createdBy.toString()) {
        await Roommate.findByIdAndUpdate(split.roommate, { $inc: { balance: -shareAmount } });
        await Roommate.findByIdAndUpdate(createdBy,      { $inc: { balance: +shareAmount } });
      }
    }

    const populated = await saved.populate([
      { path: 'createdBy', select: 'name' },
      { path: 'splitBetween', select: 'name' },
      { path: 'splitAmounts.roommate', select: 'name' },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/expenses/:id
exports.update = async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name')
      .populate('splitBetween', 'name')
      .populate('splitAmounts.roommate', 'name');

    if (!updated) return res.status(404).json({ message: 'Expense not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/expenses/:id
exports.remove = async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
