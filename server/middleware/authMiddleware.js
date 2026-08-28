const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // 1. Read the authentication information from cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // 2. Validate the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3 & 4. Determine user ID and attach to request
    req.user = {
      id: decoded.userId
    };

    next();
  } catch (error) {
    // 5. Reject unauthenticated requests
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
