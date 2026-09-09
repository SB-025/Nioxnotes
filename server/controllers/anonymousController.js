const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AnonymousSpace = require('../models/AnonymousSpace');
const AnonymousNote = require('../models/AnonymousNote');

const normalizeCode = (code) => {
  if (!code || typeof code !== 'string') return '';
  return code.toLowerCase().trim().replace(/\s+/g, ' ');
};

const validateCode = (normalizedCode) => {
  if (!normalizedCode) return false;
  // Rule: minimum 3 characters
  if (normalizedCode.length < 3) return false;
  // Allow alphanumeric, space, hyphen, underscore
  const isValidFormat = /^[a-z0-9 _-]+$/.test(normalizedCode);
  if (!isValidFormat) return false;
  
  if (normalizedCode.length > 100) return false;
  
  return true;
};

exports.createSpace = async (req, res) => {
  try {
    const { code } = req.body;
    const normalizedCode = normalizeCode(code);
    
    if (!validateCode(normalizedCode)) {
      return res.status(400).json({ message: 'CODE MUST CONTAIN AT LEAST 3 CHARACTERS' });
    }

    // Check collision before hashing to save CPU if possible, but we don't store plaintext code
    // Since we don't store the raw code, we must hash it. We will use a consistent salt/hash if we want exact match,
    // OR just use a static salt? No, bcrypt generates a unique salt. 
    // To check if a code exists using bcrypt without storing plaintext, we can't do a fast index lookup if the salt varies.
    // Wait, if we use bcrypt, we usually look up by username and then compare. 
    // If the "code" IS the identifier, we need a deterministic hash (like SHA-256) to look it up, OR a fixed salt for bcrypt.
    // Let's use SHA-256 for the codeHash so we can use it as a unique index lookup, which fits "private from casual discovery".
    // Using SHA-256:
    const crypto = require('crypto');
    const codeHash = crypto.createHash('sha256').update(normalizedCode).digest('hex');

    // Check collision
    const existingSpace = await AnonymousSpace.findOne({ codeHash });
    if (existingSpace) {
      return res.status(409).json({ message: 'SPACE ALREADY EXISTS' });
    }

    // Create space
    const newSpace = new AnonymousSpace({ codeHash });
    await newSpace.save();

    // Create initial blank note
    const newNote = new AnonymousNote({ spaceId: newSpace._id });
    await newNote.save();

    // Create session token
    const token = jwt.sign(
      { spaceId: newSpace._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie('anonymous_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(201).json({ message: 'Space created', spaceId: newSpace._id });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
        return res.status(409).json({ message: 'SPACE ALREADY EXISTS' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

exports.joinSpace = async (req, res) => {
  try {
    const { code } = req.body;
    const normalizedCode = normalizeCode(code);
    
    if (!validateCode(normalizedCode)) {
      return res.status(400).json({ message: 'CODE MUST CONTAIN AT LEAST 3 CHARACTERS' });
    }

    const crypto = require('crypto');
    const codeHash = crypto.createHash('sha256').update(normalizedCode).digest('hex');

    const space = await AnonymousSpace.findOne({ codeHash });
    
    if (!space) {
      return res.status(404).json({ message: 'SPACE NOT FOUND' });
    }

    // Update last accessed
    space.lastAccessedAt = Date.now();
    await space.save();

    // Create session token
    const token = jwt.sign(
      { spaceId: space._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('anonymous_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({ message: 'Joined space', spaceId: space._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.leaveSpace = async (req, res) => {
  try {
    res.clearCookie('anonymous_session', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    res.status(200).json({ message: 'Left space' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getNote = async (req, res) => {
  try {
    const spaceId = req.anonymousSpaceId;
    
    const note = await AnonymousNote.findOne({ spaceId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Do not return spaceId/owner details, keep it isolated
    res.status(200).json({
      _id: note._id,
      title: note.title,
      content: note.content,
      revision: note.revision,
      updatedAt: note.updatedAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const spaceId = req.anonymousSpaceId;
    const { title, content, revision } = req.body;

    const note = await AnonymousNote.findOne({ spaceId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Optimistic concurrency check
    if (typeof revision === 'number' && note.revision !== revision) {
      return res.status(409).json({ 
        message: 'ANOTHER UPDATE WAS MADE',
        currentNote: {
            title: note.title,
            content: note.content,
            revision: note.revision
        }
      });
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    note.revision += 1;

    await note.save();

    res.status(200).json({
      _id: note._id,
      title: note.title,
      content: note.content,
      revision: note.revision,
      updatedAt: note.updatedAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
