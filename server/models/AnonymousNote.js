const mongoose = require('mongoose');

const anonymousNoteSchema = new mongoose.Schema({
  spaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnonymousSpace',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: '',
    trim: true
  },
  content: {
    type: String,
    default: '',
    trim: true
  },
  revision: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
anonymousNoteSchema.index({ spaceId: 1, updatedAt: -1 });

const AnonymousNote = mongoose.model('AnonymousNote', anonymousNoteSchema);

module.exports = AnonymousNote;
