const Note = require('../models/Note');

// Publicly retrieve a shared note by token
exports.getSharedNote = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: 'Share token is required' });
    }

    const note = await Note.findOne({ shareToken: token, isShared: true, isDeleted: false });

    if (!note) {
      return res.status(404).json({ message: 'Shared note unavailable' });
    }

    // Only return safe, non-private data
    res.json({
      note: {
        title: note.title,
        content: note.content,
        attachments: note.attachments || [],
        updatedAt: note.updatedAt,
      }
    });
  } catch (error) {
    console.error('Error fetching shared note:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
