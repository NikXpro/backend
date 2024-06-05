const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate requests
 * Verifies the JWT token and sets the userId in the request object
 */
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decodedToken.userId;
        next();
    } catch {
        res.status(401).json({ message: 'Unauthorized request' });
    }
};
