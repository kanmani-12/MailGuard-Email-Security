
const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true
  },

  subject: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  classification: {
    type: String,
    enum: ['Safe', 'Suspicious', 'Spam'],
    required: true
  },

  detectedPatterns: {
    type: [String],
    default: []
  },

  finalState: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Email', emailSchema);
