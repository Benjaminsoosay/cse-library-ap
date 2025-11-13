const Joi = require('joi');

const bookValidation = {
  create: Joi.object({
    title: Joi.string().min(1).max(200).required().trim(),
    author: Joi.string().min(1).max(100).required().trim(),
    isbn: Joi.string().pattern(/^(?:\d{10}|\d{13})$/).required().trim(),
    genre: Joi.string().valid('Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Fantasy', 'Mystery', 'Romance', 'Other').required(),
    publishedYear: Joi.number().integer().min(1000).max(new Date().getFullYear()).required(),
    publisher: Joi.string().min(1).max(100).required().trim(),
    pageCount: Joi.number().integer().min(1).max(5000).required(),
    available: Joi.boolean().default(true),
    location: Joi.object({
      shelf: Joi.string().required().trim(),
      section: Joi.string().required().trim()
    }).required()
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(200).trim(),
    author: Joi.string().min(1).max(100).trim(),
    isbn: Joi.string().pattern(/^(?:\d{10}|\d{13})$/).trim(),
    genre: Joi.string().valid('Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Fantasy', 'Mystery', 'Romance', 'Other'),
    publishedYear: Joi.number().integer().min(1000).max(new Date().getFullYear()),
    publisher: Joi.string().min(1).max(100).trim(),
    pageCount: Joi.number().integer().min(1).max(5000),
    available: Joi.boolean(),
    location: Joi.object({
      shelf: Joi.string().trim(),
      section: Joi.string().trim()
    })
  }).min(1)
};

const memberValidation = {
  create: Joi.object({
    firstName: Joi.string().min(1).max(50).required().trim(),
    lastName: Joi.string().min(1).max(50).required().trim(),
    email: Joi.string().email().required().trim().lowercase(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]{10,}$/).required().trim(),
    membershipType: Joi.string().valid('Standard', 'Premium', 'Student', 'Senior').required(),
    joinDate: Joi.date().max('now').required(),
    address: Joi.object({
      street: Joi.string().required().trim(),
      city: Joi.string().required().trim(),
      state: Joi.string().required().trim(),
      zipCode: Joi.string().pattern(/^\d{5}(-\d{4})?$/).required().trim()
    }).required(),
    active: Joi.boolean().default(true)
  }),

  update: Joi.object({
    firstName: Joi.string().min(1).max(50).trim(),
    lastName: Joi.string().min(1).max(50).trim(),
    email: Joi.string().email().trim().lowercase(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]{10,}$/).trim(),
    membershipType: Joi.string().valid('Standard', 'Premium', 'Student', 'Senior'),
    joinDate: Joi.date().max('now'),
    address: Joi.object({
      street: Joi.string().trim(),
      city: Joi.string().trim(),
      state: Joi.string().trim(),
      zipCode: Joi.string().pattern(/^\d{5}(-\d{4})?$/).trim()
    }),
    active: Joi.boolean()
  }).min(1)
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

module.exports = {
  bookValidation,
  memberValidation,
  validate
};