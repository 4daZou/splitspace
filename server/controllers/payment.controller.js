/**
 * SplitSpace - controllers/payment.controller.js
 * Handles payment logging and status updates.
 */

const { Payment, Expense, Roommate } = require('../models');

// GET /api/payments
exports.getAll = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('roommateId', 'name')
      .populate('expenseId', 'title amount')
      .sort({ datePaid: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/payments/:id
exports.getOne = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('roommateId', 'name')
      .populate('expenseId', 'title amount');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/payments
exports.create = async (req, res) => {
  try {
    const { roommateId, expenseId, amountPaid, datePaid, notes } = req.body;

    const payment = new Payment({ roommateId, expenseId, amountPaid, datePaid, notes, paymentStatus: 'paid' });
    const saved = await payment.save();

    // Mark the split as paid on the Expense
    await Expense.updateOne(
      { _id: expenseId, 'splitAmounts.roommate': roommateId },
      { $set: { 'splitAmounts.$.isPaid': true } }
    );

    // Adjust roommate balances
    const expense = await Expense.findById(expenseId);
    if (expense) {
      await Roommate.findByIdAndUpdate(roommateId,       { $inc: { balance: +amountPaid } });
      await Roommate.findByIdAndUpdate(expense.createdBy, { $inc: { balance: -amountPaid } });
    }

    const populated = await saved.populate([
      { path: 'roommateId', select: 'name' },
      { path: 'expenseId',  select: 'title amount' },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/payments/:id
exports.update = async (req, res) => {
  try {
    const updated = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('roommateId', 'name')
      .populate('expenseId', 'title amount');

    if (!updated) return res.status(404).json({ message: 'Payment not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/payments/:id
exports.remove = async (req, res) => {
  try {
    const deleted = await Payment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
