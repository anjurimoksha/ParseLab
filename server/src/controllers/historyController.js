const Grammar = require('../models/Grammar');
const mongoose = require('mongoose');

// In-memory fallback if DB is not connected
let inMemoryGrammars = [];

exports.list = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(inMemoryGrammars);
    }
    const grammars = await Grammar.find().sort({ createdAt: -1 });
    res.json(grammars);
  } catch (err) {
    next(err);
  }
};

exports.save = async (req, res, next) => {
  try {
    const { name, type, rawGrammar } = req.body;
    if (!name || !type || !rawGrammar) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (mongoose.connection.readyState !== 1) {
      const newG = { _id: Date.now().toString(), name, type, rawGrammar, createdAt: new Date() };
      inMemoryGrammars.unshift(newG);
      return res.status(201).json(newG);
    }

    const g = new Grammar({ name, type, rawGrammar });
    await g.save();
    res.status(201).json(g);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState !== 1) {
      inMemoryGrammars = inMemoryGrammars.filter(g => g._id !== id);
      return res.json({ success: true });
    }
    
    await Grammar.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
