const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [1, 'Title must be at least 1 character long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    minlength: [1, 'Author must be at least 1 character long'],
    maxlength: [100, 'Author cannot exceed 100 characters']
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true,
    match: [/^(?:\d{10}|\d{13})$/, 'ISBN must be 10 or 13 digits']
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    trim: true,
    enum: {
      values: ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Fantasy', 'Mystery', 'Romance', 'Other'],
      message: '{VALUE} is not a valid genre'
    }
  },
  publishedYear: {
    type: Number,
    required: [true, 'Published year is required'],
    min: [1000, 'Published year must be after 1000'],
    max: [new Date().getFullYear(), 'Published year cannot be in the future']
  },
  publisher: {
    type: String,
    required: [true, 'Publisher is required'],
    trim: true,
    minlength: [1, 'Publisher must be at least 1 character long'],
    maxlength: [100, 'Publisher cannot exceed 100 characters']
  },
  pageCount: {
    type: Number,
    required: [true, 'Page count is required'],
    min: [1, 'Page count must be at least 1'],
    max: [5000, 'Page count cannot exceed 5000']
  },
  available: {
    type: Boolean,
    default: true
  },
  location: {
    shelf: {
      type: String,
      required: [true, 'Shelf location is required'],
      trim: true
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      trim: true
    }
  }
}, {
  timestamps: true
});

// Index for better search performance
bookSchema.index({ title: 'text', author: 'text' });
bookSchema.index({ isbn: 1 }, { unique: true });

module.exports = mongoose.model('Book', bookSchema);