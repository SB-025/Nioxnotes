const Note = require('../models/Note');
const cloudinary = require('../config/cloudinary');

// @route   POST /api/notes
// @desc    Create a new note
// @access  Private
exports.createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Force userId to be the authenticated user
    const note = await Note.create({
      userId: req.user.id,
      title,
      content: content || ''
    });

    res.status(201).json({ note });
  } catch (error) {
    next(error);
  }
};

// Utility to prevent ReDoS by escaping regex characters
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// @route   GET /api/notes
// @desc    Get all notes for authenticated user with search and pagination
// @access  Private
exports.getNotes = async (req, res, next) => {
  try {
    const { search, page = '1', limit = '20' } = req.query;
    
    // Pagination logic
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20)); // Max 100 per page
    const skip = (pageNum - 1) * limitNum;

    // Base query: strict ownership and exclude deleted notes
    const query = { userId: req.user.id, isDeleted: false };

    // Search logic using safely escaped Regex
    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { content: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    const notes = await Note.find(query)
      .sort({ isPinned: -1, updatedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Note.countDocuments(query);

    res.json({
      notes,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/notes/:id
// @desc    Get a single note by ID
// @access  Private
exports.getNoteById = async (req, res, next) => {
  try {
    // Find note ensuring it belongs to the authenticated user
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ note });
  } catch (error) {
    // If id is invalid objectId format, Mongoose throws a CastError, handle as 404
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Note not found' });
    }
    next(error);
  }
};

// @route   PUT /api/notes/:id
// @desc    Update note
// @access  Private
exports.updateNote = async (req, res, next) => {
  try {
    const { title, content, isPinned } = req.body;

    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (isPinned !== undefined) note.isPinned = isPinned;

    const updatedNote = await note.save();

    res.json({ note });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Note not found' });
    }
    next(error);
  }
};

// @route   DELETE /api/notes/:id
// @desc    Move a note to trash (Soft Delete)
// @access  Private
exports.deleteNote = async (req, res, next) => {
  try {
    // Find and update the note, moving it to trash
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found or already deleted' });
    }

    res.json({ message: 'Note moved to trash', note });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Note not found' });
    }
    next(error);
  }
};

// @route   GET /api/notes/trash
// @desc    Get all trashed notes for authenticated user
// @access  Private
exports.getTrashNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ userId: req.user.id, isDeleted: true })
      .sort({ deletedAt: -1 });
    
    res.json({ notes });
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/notes/:id/restore
// @desc    Restore a note from trash
// @access  Private
exports.restoreNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, isDeleted: true },
      { $set: { isDeleted: false, deletedAt: null } },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found in trash' });
    }

    res.json({ message: 'Note restored successfully', note });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Note not found' });
    }
    next(error);
  }
};

// @route   DELETE /api/notes/:id/permanent
// @desc    Permanently delete a note and its images
// @access  Private
exports.permanentDeleteNote = async (req, res, next) => {
  try {
    // 1. Find the note first to get attachments
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // 2. Delete images from Cloudinary if configured and attachments exist
    if (note.attachments && note.attachments.length > 0 && process.env.CLOUDINARY_API_KEY) {
      for (const attachment of note.attachments) {
        try {
          await cloudinary.uploader.destroy(attachment.publicId);
        } catch (imgErr) {
          console.error(`Failed to delete image ${attachment.publicId} from Cloudinary:`, imgErr);
        }
      }
    }

    // 3. Delete the note from MongoDB
    await Note.deleteOne({ _id: note._id });

    res.json({ message: 'Note permanently deleted' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Note not found' });
    }
    next(error);
  }
};

// @route   POST /api/notes/:id/images
// @desc    Upload an image to a note
// @access  Private
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please select an image file.' });
    }

    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check maximum images limit
    if (note.attachments && note.attachments.length >= 10) {
      return res.status(400).json({ message: 'Maximum of 10 images per note.' });
    }

    if (!process.env.CLOUDINARY_API_KEY) {
      return res.status(500).json({ message: 'Cloudinary is not configured on the server.' });
    }

    // Upload to Cloudinary using stream
    const uploadToCloudinary = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `nns/notes/${req.user.id}/${note._id}` },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        stream.end(buffer);
      });
    };

    const result = await uploadToCloudinary(req.file.buffer);

    const attachment = {
      url: result.secure_url,
      publicId: result.public_id,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      size: result.bytes,
      width: result.width,
      height: result.height
    };

    note.attachments.push(attachment);
    await note.save();

    res.status(201).json({ attachment });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Note not found' });
    }
    next(error);
  }
};

// @route   DELETE /api/notes/:id/images/:attachmentId
// @desc    Remove an image from a note
// @access  Private
exports.removeImage = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const attachment = note.attachments.id(req.params.attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: 'Image not found in this note' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(attachment.publicId);

    // Remove from MongoDB
    note.attachments.pull(req.params.attachmentId);
    const updatedNote = await note.save();

    res.json({ note: updatedNote });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Note or attachment not found' });
    }
    next(error);
  }
};

// @desc    Enable sharing for a note
// @route   POST /api/notes/:id/share
// @access  Private
exports.enableShare = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id, isDeleted: false });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (!note.isShared) {
      const crypto = require('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      note.isShared = true;
      note.shareToken = token;
      await note.save();
    }

    res.json({
      message: 'Sharing enabled',
      shareToken: note.shareToken
    });
  } catch (error) {
    console.error('Error enabling share:', error);
    res.status(500).json({ message: 'Server error while enabling share' });
  }
};

// @desc    Disable sharing for a note
// @route   DELETE /api/notes/:id/share
// @access  Private
exports.disableShare = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id, isDeleted: false });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.isShared) {
      note.isShared = false;
      note.shareToken = undefined; // Clears the token so old links break
      await note.save();
    }

    res.json({ message: 'Sharing disabled' });
  } catch (error) {
    console.error('Error disabling share:', error);
    res.status(500).json({ message: 'Server error while disabling share' });
  }
};
