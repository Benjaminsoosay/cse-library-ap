const express = require('express');
const router = express.Router();
const Book = require('../models/book'); // file is book.js (singular, lowercase)
const { bookValidation, validate } = require('../middleware/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - isbn
 *         - genre
 *         - publishedYear
 *         - publisher
 *         - pageCount
 *         - location
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the book
 *         title:
 *           type: string
 *           description: The book title
 *         author:
 *           type: string
 *           description: The book author
 *         isbn:
 *           type: string
 *           description: The ISBN number
 *         genre:
 *           type: string
 *           enum: [Fiction, Non-Fiction, Science, Technology, History, Biography, Fantasy, Mystery, Romance, Other]
 *           description: The book genre
 *         publishedYear:
 *           type: integer
 *           description: The year the book was published
 *         publisher:
 *           type: string
 *           description: The publisher name
 *         pageCount:
 *           type: integer
 *           description: Number of pages
 *         available:
 *           type: boolean
 *           description: Availability status
 *         location:
 *           type: object
 *           properties:
 *             shelf:
 *               type: string
 *             section:
 *               type: string
 *       example:
 *         _id: 650a1b2c3d4e5f0012345678
 *         title: The Great Gatsby
 *         author: F. Scott Fitzgerald
 *         isbn: "9780743273565"
 *         genre: Fiction
 *         publishedYear: 1925
 *         publisher: Scribner
 *         pageCount: 180
 *         available: true
 *         location: { shelf: "A1", section: "Classics" }
 */

// GET all books
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.genre) filter.genre = req.query.genre;
    if (req.query.available !== undefined) filter.available = req.query.available === 'true';

    const books = await Book.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ title: 1 });

    const total = await Book.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: books
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// GET book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.status(200).json(book);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid book ID' });
    }
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// CREATE new book
router.post('/', validate(bookValidation.create), async (req, res) => {
  try {
    const book = new Book(req.body);
    const savedBook = await book.save();
    res.status(201).json(savedBook);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Duplicate ISBN', message: 'A book with this ISBN already exists' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// UPDATE book
router.put('/:id', validate(bookValidation.update), async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.status(200).json(book);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid book ID' });
    }
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Duplicate ISBN', message: 'A book with this ISBN already exists' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// DELETE book
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.status(200).json({ message: 'Book deleted successfully', deletedBook: book });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid book ID' });
    }
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

module.exports = router;
