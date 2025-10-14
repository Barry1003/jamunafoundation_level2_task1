import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Resume from '../models/resume.js';
import Project from '../models/Project.js';

const router = express.Router();

// ✅ UPDATE USER PROFILE
router.put('/:userId', protect, async (req, res) => {
  try {
    const { fullName, email, avatar } = req.body;
    
    // Validate userId matches authenticated user
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if email already exists (if changing email)
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { fullName, email, avatar },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ EXPORT USER DATA
router.get('/:userId/export', protect, async (req, res) => {
  try {
    // Validate userId matches authenticated user
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all user data
    const resume = await Resume.findOne({ userId: req.params.userId })
      .populate('selectedProjects');
    
    const projects = await Project.find({ userId: req.params.userId });

    const exportData = {
      user: {
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
      },
      resume: resume || null,
      projects: projects || [],
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="employx-data-${Date.now()}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ DEACTIVATE ACCOUNT
router.post('/:userId/deactivate', protect, async (req, res) => {
  try {
    // Validate userId matches authenticated user
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { active: false, deactivatedAt: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
