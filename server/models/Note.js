const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  content: {
    type: String,
    default: '',
    trim: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  attachments: [{
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    filename: String,
    mimeType: String,
    size: Number,
    width: Number,
    height: Number
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  isShared: {
    type: Boolean,
    default: false
  },
  shareToken: {
    type: String,
    sparse: true,
    unique: true
  }
}, {
  timestamps: true
});

// Indexes for performance
// Optimize querying a user's notes sorted by pinned status, then recently updated
noteSchema.index({ userId: 1, isDeleted: 1, isPinned: -1, updatedAt: -1 });
// Optimize background cleanup task
noteSchema.index({ isDeleted: 1, deletedAt: 1 });

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
