const mongoose = require('mongoose');

const GrammarSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['ll1', 'lalr'], required: true },
  rawGrammar: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Grammar', GrammarSchema);
