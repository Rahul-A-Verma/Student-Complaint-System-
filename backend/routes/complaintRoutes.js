const express = require('express');
const Complaint = require('../models/Complaint');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

const VALID_CATEGORIES = ['Academic', 'Hostel', 'Library', 'Internet', 'Infrastructure', 'Other'];
const VALID_STATUSES = ['Pending', 'In Progress', 'Resolved'];

router.get('/', verifyToken, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { student: req.user.id };
    const complaints = await Complaint.find(filter)
      .populate('student', 'name email')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch complaints.', error: err.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('student', 'name email');
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }
    if (req.user.role !== 'admin' && complaint.student._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching complaint details.', error: err.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit complaints.' });
    }
    const { title, description, category } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required.' });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid category selected.' });
    }
    const complaint = new Complaint({
      title,
      description,
      category,
      status: 'Pending',
      student: req.user.id
    });
    await complaint.save();
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create complaint.', error: err.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }
    if (req.user.role === 'admin') {
      const { status } = req.body;
      if (!status || !VALID_STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Valid status is required.' });
      }
      complaint.status = status;
      await complaint.save();
      return res.json(complaint);
    }
    if (complaint.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    if (complaint.status !== 'Pending') {
      return res.status(400).json({ message: 'Cannot edit complaint after processing has started.' });
    }
    const { title, description, category } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required.' });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid category.' });
    }
    complaint.title = title;
    complaint.description = description;
    complaint.category = category;
    await complaint.save();
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update complaint.', error: err.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }
    if (req.user.role === 'admin') {
      await complaint.deleteOne();
      return res.json({ message: 'Complaint deleted by admin.' });
    }
    if (complaint.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    if (complaint.status !== 'Pending') {
      return res.status(400).json({ message: 'Only Pending complaints can be deleted.' });
    }
    await complaint.deleteOne();
    res.json({ message: 'Complaint deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete complaint.', error: err.message });
  }
});

module.exports = router;