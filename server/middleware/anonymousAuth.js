const jwt = require('jsonwebtoken');

const anonymousAuthMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.anonymous_session;

    if (!token) {
      return res.status(401).json({ message: 'Anonymous session required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.spaceId) {
      return res.status(401).json({ message: 'Invalid anonymous session' });
    }

    req.anonymousSpaceId = decoded.spaceId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired anonymous session' });
  }
};

module.exports = anonymousAuthMiddleware;
