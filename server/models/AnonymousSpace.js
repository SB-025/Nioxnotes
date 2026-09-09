const mongoose = require('mongoose');

const anonymousSpaceSchema = new mongoose.Schema({
  codeHash: {
    type: String,
    required: [true, 'Code hash is required'],
    unique: true
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const AnonymousSpace = mongoose.model('AnonymousSpace', anonymousSpaceSchema);

module.exports = AnonymousSpace;
