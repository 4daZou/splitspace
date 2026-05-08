/**
 * SplitSpace - controllers/expense.controller.js
 * Handles expense CRUD, auto-splitting logic, and balance cleanup on delete.
 */

const { Expense, Roommate, Payment } = require('../models');

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
// Reverses roommate balances, deletes related payments, then deletes the expense
exports.remove = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    const createdBy = expense.createdBy.toString();

    // 1. Reverse roommate balance adjustments for unpaid splits
    for (const split of expense.splitAmounts) {
      const roommateId = split.roommate.toString();
      if (roommateId !== createdBy) {
        if (!split.isPaid) {
          // Unpaid: reverse the original balance changes
          await Roommate.findByIdAndUpdate(roommateId, { $inc: { balance: +split.amount } });
          await Roommate.findByIdAndUpdate(createdBy,  { $inc: { balance: -split.amount } });
        } else {
          // Paid: payment already settled, reverse the payment effect too
          await Roommate.findByIdAndUpdate(roommateId, { $inc: { balance: +split.amount } });
          await Roommate.findByIdAndUpdate(createdBy,  { $inc: { balance: -split.amount } });
        }
      }
    }

    // 2. Delete all payments linked to this expense
    await Payment.deleteMany({ expenseId: expense._id });

    // 3. Delete the expense itself
    await Expense.findByIdAndDelete(req.params.id);

    res.json({ message: 'Expense and related payments deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};