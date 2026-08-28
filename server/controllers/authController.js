const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to get safe user object for response
const getSafeUser = (user, stats = undefined) => {
  const safe = {
    id: user._id,
    email: user.email,
    googleId: user.googleId,
    displayName: user.displayName,
    bio: user.bio,
    location: user.location,
    age: user.age,
    phone: user.phone,
    profileCompleted: user.profileCompleted,
    createdAt: user.createdAt
  };
  if (stats) safe.stats = stats;
  return safe;
};

// Helper to set cookie
const setAuthCookie = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Must be lax or none for cross-origin depending on setup
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

exports.register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Simple email regex for backend validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email,
      passwordHash
    });

    // Set cookie
    setAuthCookie(res, user._id);

    res.status(201).json({
      user: getSafeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Generic error message
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    setAuthCookie(res, user._id);

    res.json({
      user: getSafeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.json({ message: 'Logged out successfully' });
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Add Note Model import locally if not at top, or just require it at top.
    // I will require it at top. Wait, let's just do it cleanly.
    const Note = require('../models/Note');

    const [totalNotes, pinnedNotes, deletedNotes] = await Promise.all([
      Note.countDocuments({ userId: user._id, isDeleted: false }),
      Note.countDocuments({ userId: user._id, isDeleted: false, isPinned: true }),
      Note.countDocuments({ userId: user._id, isDeleted: true })
    ]);

    res.json({
      user: getSafeUser(user, { totalNotes, pinnedNotes, deletedNotes })
    });
  } catch (error) {
    next(error);
  }
};

exports.googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    // Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, sub: googleId, email_verified, name } = payload;

    if (!email_verified) {
      return res.status(401).json({ message: 'Google email is not verified' });
    }

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // User exists - link Google ID if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user (no password needed)
      user = await User.create({
        email: email.toLowerCase(),
        googleId,
        displayName: name // Pre-fill from Google
      });
    }

    // Generate session JWT
    setAuthCookie(res, user._id);

    res.json({
      user: getSafeUser(user)
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ message: 'Invalid Google credential' });
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { displayName, bio, location, age, phone } = req.body;

    if (!displayName || displayName.trim().length < 2) {
      return res.status(400).json({ message: 'Please enter a valid display name (min 2 characters).' });
    }

    if (displayName.length > 50) return res.status(400).json({ message: 'Display name too long.' });
    if (bio && bio.length > 160) return res.status(400).json({ message: 'Bio must be under 160 characters.' });
    if (location && location.length > 100) return res.status(400).json({ message: 'Location must be under 100 characters.' });
    if (age !== undefined && (isNaN(age) || age < 0 || age > 120)) return res.status(400).json({ message: 'Please enter a valid age.' });
    if (phone && phone.length > 20) return res.status(400).json({ message: 'Phone number too long.' });

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.displayName = displayName.trim();
    user.bio = bio ? bio.trim() : '';
    user.location = location ? location.trim() : '';
    if (age !== undefined && age !== '') user.age = Number(age);
    else user.age = undefined;
    user.phone = phone ? phone.trim() : '';
    user.profileCompleted = true;

    await user.save();

    res.json({
      user: getSafeUser(user)
    });
  } catch (error) {
    next(error);
  }
};
