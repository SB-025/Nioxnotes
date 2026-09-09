const express = require('express');
const router = express.Router();
const anonymousController = require('../controllers/anonymousController');
const anonymousAuth = require('../middleware/anonymousAuth');
const rateLimit = require('express-rate-limit');

// Rate limiting specifically for code entry
const entryLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // Limit each IP to 30 requests per window
  message: { message: 'Too many attempts, please try again later.' }
});

router.post('/create', entryLimiter, anonymousController.createSpace);
router.post('/join', entryLimiter, anonymousController.joinSpace);
router.post('/leave', anonymousAuth, anonymousController.leaveSpace);

router.get('/note', anonymousAuth, anonymousController.getNote);
router.put('/note', anonymousAuth, anonymousController.updateNote);

module.exports = router;
