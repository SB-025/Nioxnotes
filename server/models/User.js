const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  passwordHash: {
    type: String,
    required: false
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 160
  },
  location: {
    type: String,
    trim: true,
    maxlength: 100
  },
  age: {
    type: Number,
    min: 0,
    max: 120
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  profileCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Automatically creates createdAt and updatedAt
});

// Remove passwordHash when converting to JSON (e.g., when sending response)
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
