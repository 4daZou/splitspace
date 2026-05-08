/**
 * SplitSpace - seed.js
 * Seeds the database with sample roommates, expenses, and payments.
 * Run with: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { Roommate, Expense, Payment } = require('./models');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/splitspace';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB for seeding...');

  // Clear existing data
  await Promise.all([Roommate.deleteMany(), Expense.deleteMany(), Payment.deleteMany()]);
  console.log('🗑  Cleared existing data');

  // Seed Roommates
  const [dami, scott, ken] = await Roommate.insertMany([
    { name: 'Dami',  email: 'dami@splitspace.com',  phone: '555-0101', moveInDate: new Date('2024-01-01'), balance: 0 },
    { name: 'Scott', email: 'scott@splitspace.com', phone: '555-0102', moveInDate: new Date('2024-01-01'), balance: 0 },
    { name: 'Ken',   email: 'ken@splitspace.com',   phone: '555-0103', moveInDate: new Date('2024-01-01'), balance: 0 },
  ]);
  console.log('👥 Seeded 3 roommates');

  // Seed Expenses
  const allRoommates = [dami._id, scott._id, ken._id];
  const shareOf3 = parseFloat((1 / 3 * 100).toFixed(2)); // not used directly, computed per expense

  const expense1 = await Expense.create({
    title: 'April Rent',
    category: 'Rent',
    amount: 2400,
    dueDate: new Date('2024-04-01'),
    createdBy: dami._id,
    splitBetween: allRoommates,
    splitAmounts: [
      { roommate: dami._id,  amount: 800, isPaid: true  },
      { roommate: scott._id, amount: 800, isPaid: true  },
      { roommate: ken._id,   amount: 800, isPaid: false },
    ],
    notes: 'Monthly rent - paid to landlord',
  });

  const expense2 = await Expense.create({
    title: 'Electric Bill',
    category: 'Utilities',
    amount: 120,
    dueDate: new Date('2024-04-15'),
    createdBy: scott._id,
    splitBetween: allRoommates,
    splitAmounts: [
      { roommate: dami._id,  amount: 40, isPaid: false },
      { roommate: scott._id, amount: 40, isPaid: true  },
      { roommate: ken._id,   amount: 40, isPaid: false },
    ],
  });

  const expense3 = await Expense.create({
    title: 'Costco Groceries',
    category: 'Groceries',
    amount: 180,
    dueDate: new Date('2024-04-10'),
    createdBy: ken._id,
    splitBetween: allRoommates,
    splitAmounts: [
      { roommate: dami._id,  amount: 60, isPaid: true  },
      { roommate: scott._id, amount: 60, isPaid: false },
      { roommate: ken._id,   amount: 60, isPaid: true  },
    ],
    notes: 'Bulk shopping for April',
  });

  const expense4 = await Expense.create({
    title: 'Internet - Xfinity',
    category: 'Internet',
    amount: 90,
    dueDate: new Date('2024-04-05'),
    createdBy: dami._id,
    splitBetween: allRoommates,
    splitAmounts: [
      { roommate: dami._id,  amount: 30, isPaid: true  },
      { roommate: scott._id, amount: 30, isPaid: true  },
      { roommate: ken._id,   amount: 30, isPaid: true  },
    ],
  });

  const expense5 = await Expense.create({
    title: 'Netflix Subscription',
    category: 'Subscriptions',
    amount: 22.99,
    dueDate: new Date('2024-04-20'),
    createdBy: scott._id,
    splitBetween: [dami._id, scott._id],
    splitAmounts: [
      { roommate: dami._id,  amount: 11.50, isPaid: false },
      { roommate: scott._id, amount: 11.49, isPaid: true  },
    ],
    notes: 'Sharing with Dami only',
  });

  console.log('💰 Seeded 5 expenses');

  // Seed Payments
  await Payment.insertMany([
    { roommateId: scott._id, expenseId: expense1._id, amountPaid: 800,   datePaid: new Date('2024-04-01'), paymentStatus: 'paid', notes: 'Venmo transfer' },
    { roommateId: dami._id,  expenseId: expense3._id, amountPaid: 60,    datePaid: new Date('2024-04-10'), paymentStatus: 'paid' },
    { roommateId: dami._id,  expenseId: expense2._id, amountPaid: 20,    datePaid: new Date('2024-04-12'), paymentStatus: 'partial', notes: 'Partial payment, rest coming soon' },
  ]);
  console.log('💳 Seeded 3 payments');

  // Update balances to reflect seed state
  await Roommate.findByIdAndUpdate(dami._id,  { balance:  -51.50 }); // owes electric + netflix share
  await Roommate.findByIdAndUpdate(scott._id, { balance:  -60    }); // owes groceries
  await Roommate.findByIdAndUpdate(ken._id,   { balance: -830    }); // owes rent + electric

  console.log('✅ Seeding complete!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  mongoose.disconnect();
  process.exit(1);
});
