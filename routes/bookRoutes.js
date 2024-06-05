const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

/**
 * Routes for book management
 * Includes routes to get, create, update, delete, and rate books
 */
router.get('/bestrating', bookController.getBestRatedBooks);
router.get('/:id', bookController.getBookById);
router.get('/', bookController.getAllBooks);
router.post('/:id/rating', authMiddleware, bookController.rateBookById);
router.put('/:id', authMiddleware, uploadMiddleware, bookController.updateBook);
router.post('/', authMiddleware, uploadMiddleware, bookController.createBook);
router.delete('/:id', authMiddleware, bookController.deleteBookById);

module.exports = router;
