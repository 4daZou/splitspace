/**
 * SplitSpace - models.js
 * All Mongoose schema definitions. Each model is exported for use in controllers.
 */

const mongoose = require('mongoose');

// ─── Roommate Schema ──────────────────────────────────────────────────────────
const roommateSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    email:       { type: String, trim: true, lowercase: true },
    phone:       { type: String, trim: true },
    moveInDate:  { type: Date, default: Date.now },
    balance:     { type: Number, default: 0 }, // positive = owed money, negative = owes money
    avatar:      { type: String, default: '' }, // initials or color code
  },
  { timestamps: true }
);

// ─── Expense Schema ───────────────────────────────────────────────────────────
const expenseSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true, trim: true },
    category:     {
      type: String,
      enum: ['Rent', 'Utilities', 'Groceries', 'Internet', 'Subscriptions', 'Supplies', 'Other'],
      default: 'Other',
    },
    amount:       { type: Number, required: true, min: 0 },
    dueDate:      { type: Date },
    createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'Roommate', required: true },
    splitBetween: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Roommate' }],
    splitAmounts: [
      {
        roommate:  { type: mongoose.Schema.Types.ObjectId, ref: 'Roommate' },
        amount:    { type: Number },
        isPaid:    { type: Boolean, default: false },
      },
    ],
    notes:        { type: String, trim: true },
  },
  { timestamps: true }
);

// ─── Payment Schema ───────────────────────────────────────────────────────────
const paymentSchema = new mongoose.Schema(
  {
    roommateId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Roommate', required: true },
    expenseId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Expense',  required: true },
    amountPaid:    { type: Number, required: true, min: 0 },
    datePaid:      { type: Date,   default: Date.now },
    paymentStatus: { type: String, enum: ['paid', 'pending', 'partial'], default: 'paid' },
    notes:         { type: String, trim: true },
  },
  { timestamps: true }
);

// ─── Models ───────────────────────────────────────────────────────────────────
const Roommate = mongoose.model('Roommate', roommateSchema);
const Expense  = mongoose.model('Expense',  expenseSchema);
const Payment  = mongoose.model('Payment',  paymentSchema);

module.exports = { Roommate, Expense, Payment };
