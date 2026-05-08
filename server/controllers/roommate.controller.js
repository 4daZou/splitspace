/**
 * SplitSpace - controllers/roommate.controller.js
 */

const { Roommate } = require('../models');

// GET /api/roommates
exports.getAll = async (req, res) => {
  try {
    const roommates = await Roommate.find().sort({ name: 1 });
    res.json(roommates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/roommates/:id
exports.getOne = async (req, res) => {
  try {
    const roommate = await Roommate.findById(req.params.id);
    if (!roommate) return res.status(404).json({ message: 'Roommate not found' });
    res.json(roommate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/roommates
exports.create = async (req, res) => {
  try {
    const roommate = new Roommate(req.body);
    const saved = await roommate.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/roommates/:id
exports.update = async (req, res) => {
  try {
    const updated = await Roommate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Roommate not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/roommates/:id
exports.remove = async (req, res) => {
  try {
    const deleted = await Roommate.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Roommate not found' });
    res.json({ message: 'Roommate deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
