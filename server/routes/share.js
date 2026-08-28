const express = require('express');
const router = express.Router();
const shareController = require('../controllers/shareController');

// Public route for retrieving a shared note
router.get('/:token', shareController.getSharedNote);

module.exports = router;
