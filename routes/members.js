const express = require('express');
const router = express.Router();
const Member = require('../models/member'); // ensure filename matches (member.js)
const { memberValidation, validate } = require('../middleware/validation');

/**
 * @swagger
 * tags:
 *   name: Members
 *   description: API endpoints for managing library members
 */

/**
 * @swagger
 * /api/members:
 *   get:
 *     summary: Get all members
 *     tags: [Members]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *         description: Number of items per page
 *       - in: query
 *         name: membershipType
 *         schema: { type: string }
 *         description: Filter by membership type
 *       - in: query
 *         name: active
 *         schema: { type: boolean }
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of members
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.membershipType) filter.membershipType = req.query.membershipType;
    if (req.query.active !== undefined) filter.active = req.query.active === 'true';

    const members = await Member.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ lastName: 1, firstName: 1 });

    const total = await Member.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: members.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: members
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// GET member by ID
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.status(200).json(member);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid member ID' });
    }
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// CREATE new member
router.post('/', validate(memberValidation.create), async (req, res) => {
  try {
    const member = new Member(req.body);
    const savedMember = await member.save();
    res.status(201).json(savedMember);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Duplicate email', message: 'A member with this email already exists' });
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

// UPDATE member
router.put('/:id', validate(memberValidation.update), async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.status(200).json(member);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid member ID' });
    }
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Duplicate email', message: 'A member with this email already exists' });
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

// DELETE member
router.delete('/:id', async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.status(200).json({ message: 'Member deleted successfully', deletedMember: member });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid member ID' });
    }
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

module.exports = router;
