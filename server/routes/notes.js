const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// All note routes require authentication
router.use(authMiddleware);

router.route('/')
  .post(noteController.createNote)
  .get(noteController.getNotes);

router.route('/trash')
  .get(noteController.getTrashNotes);

router.route('/:id/restore')
  .patch(noteController.restoreNote);

router.route('/:id/permanent')
  .delete(noteController.permanentDeleteNote);

router.route('/:id')
  .get(noteController.getNoteById)
  .put(noteController.updateNote)
  .delete(noteController.deleteNote);

router.route('/:id/share')
  .post(noteController.enableShare)
  .delete(noteController.disableShare);

router.route('/:id/images')
  .post(uploadMiddleware.single('image'), noteController.uploadImage);

router.route('/:id/images/:attachmentId')
  .delete(noteController.removeImage);

module.exports = router;
