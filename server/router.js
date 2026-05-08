/**
 * SplitSpace - router.js
 * Central router: imports and mounts all route modules.
 */

const express = require('express');
const router = express.Router();

const roommateRoutes = require('./routes/roommate.routes');
const expenseRoutes  = require('./routes/expense.routes');
const paymentRoutes  = require('./routes/payment.routes');

router.use('/roommates', roommateRoutes);
router.use('/expenses',  expenseRoutes);
router.use('/payments',  paymentRoutes);

module.exports = router;
