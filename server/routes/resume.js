// routes/resume.js
import express from 'express';
import Resume from '../models/Resume.js';
import { protect } from '../middleware/authMiddleware.js'; // Your auth middleware

const router = express.Router();

// GET resume by userId
router.get('/:userId', protect, async (req, res) => {
  try {
    let resume = await Resume.findOne({ userId: req.params.userId })
      .populate('selectedProjects')
      .populate('userId', 'fullName email avatar username');
    
    // Create empty resume if doesn't exist
    if (!resume) {
      resume = await Resume.create({ 
        userId: req.params.userId,
        jobTitle: '',
        phone: '',
        location: '',
        aboutMe: '',
        experiences: [],
        selectedProjects: [],
        skills: []
      });
    }
    
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE entire resume (personal info, experiences, etc)
router.put('/:userId', protect, async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { userId: req.params.userId },
      req.body,
      { new: true, upsert: true, runValidators: true }
    ).populate('selectedProjects');
    
    res.json(resume);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE selected projects only
router.put('/:userId/projects', protect, async (req, res) => {
  try {
    const { projectIds } = req.body;
    
    const resume = await Resume.findOneAndUpdate(
      { userId: req.params.userId },
      { selectedProjects: projectIds },
      { new: true, upsert: true }
    ).populate('selectedProjects');
    
    res.json(resume);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ADD experience
router.post('/:userId/experience', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.params.userId });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    resume.experiences.push(req.body);
    await resume.save();
    
    res.json(resume);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE experience
router.put('/:userId/experience/:expId', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.params.userId });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    const experience = resume.experiences.id(req.params.expId);
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }
    
    Object.assign(experience, req.body);
    await resume.save();
    
    res.json(resume);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE experience
router.delete('/:userId/experience/:expId', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.params.userId });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    resume.experiences.pull(req.params.expId);
    await resume.save();
    
    res.json(resume);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;