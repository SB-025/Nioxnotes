const Note = require('../models/Note');
const cloudinary = require('../config/cloudinary');

const cleanupExpiredTrash = async () => {
  console.log('Running Trash Cleanup Service...');
  try {
    // 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find notes older than 30 days that are deleted
    const expiredNotes = await Note.find({
      isDeleted: true,
      deletedAt: { $lt: thirtyDaysAgo }
    });

    if (expiredNotes.length === 0) {
      console.log('No expired trash to clean up.');
      return;
    }

    let deletedCount = 0;

    for (const note of expiredNotes) {
      // Clean up cloudinary images
      if (note.attachments && note.attachments.length > 0 && process.env.CLOUDINARY_API_KEY) {
        for (const attachment of note.attachments) {
          try {
            await cloudinary.uploader.destroy(attachment.publicId);
          } catch (imgErr) {
            console.error(`Cleanup: Failed to delete image ${attachment.publicId}`, imgErr);
          }
        }
      }

      // Delete the note
      await Note.deleteOne({ _id: note._id });
      deletedCount++;
    }

    console.log(`Trash Cleanup Complete: Permanently deleted ${deletedCount} notes.`);
  } catch (error) {
    console.error('Trash Cleanup Service Error:', error);
  }
};

const startTrashCleanupJob = () => {
  // Run once immediately on startup (useful for testing/dev environments)
  cleanupExpiredTrash();
  
  // Run every 24 hours (24 * 60 * 60 * 1000)
  setInterval(cleanupExpiredTrash, 24 * 60 * 60 * 1000);
};

module.exports = { startTrashCleanupJob, cleanupExpiredTrash };
