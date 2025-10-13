// routes/resumeRoutes.js
import express from 'express';
import Resume from '../models/resume.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET resume by userId
router.get('/:userId', protect, async (req, res) => {
  try {
    console.log('📋 Fetching resume for user:', req.params.userId);
    
    let resume = await Resume.findOne({ userId: req.params.userId })
      .populate('selectedProjects')
      .populate('userId', 'fullName email avatar username');
    
    if (!resume) {
      console.log('📝 No resume found, creating new one');
      resume = await Resume.create({ 
        userId: req.params.userId,
        fullName: '',
        jobTitle: '',
        phone: '',
        location: '',
        aboutMe: '',
        socialLinks: {
          facebook: '',
          twitter: '',
          linkedin: '',
          instagram: ''
        },
        experiences: [],
        selectedProjects: [],
        skills: [],
        education: [],
        certifications: []
      });
    }
    
    console.log('✅ Resume sent');
    res.json(resume);
  } catch (error) {
    console.error('❌ Error fetching resume:', error);
    res.status(500).json({ message: error.message });
  }
});

// UPDATE entire resume (handles experiences, skills, projects together)
router.put('/:userId', protect, async (req, res) => {
  try {
    console.log('💾 Updating resume for user:', req.params.userId);
    console.log('Data received:', req.body);
    
    const resume = await Resume.findOneAndUpdate(
      { userId: req.params.userId },
      req.body,
      { new: true, upsert: true, runValidators: true }
    ).populate('selectedProjects');
    
    console.log('✅ Resume updated');
    res.json(resume);
  } catch (error) {
    console.error('❌ Error updating resume:', error);
    res.status(400).json({ message: error.message });
  }
});

// ADD single experience (optional - if you want to add one at a time)
router.post('/:userId/experience', protect, async (req, res) => {
  try {
    console.log('➕ Adding experience for user:', req.params.userId);
    
    const resume = await Resume.findOne({ userId: req.params.userId });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    resume.experiences.push(req.body);
    await resume.save();
    
    console.log('✅ Experience added');
    res.json(resume);
  } catch (error) {
    console.error('❌ Error adding experience:', error);
    res.status(400).json({ message: error.message });
  }
});

// UPDATE single experience by ID
router.put('/:userId/experience/:expId', protect, async (req, res) => {
  try {
    console.log('✏️ Updating experience:', req.params.expId);
    
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
    
    console.log('✅ Experience updated');
    res.json(resume);
  } catch (error) {
    console.error('❌ Error updating experience:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE single experience by ID
router.delete('/:userId/experience/:expId', protect, async (req, res) => {
  try {
    console.log('🗑️ Deleting experience:', req.params.expId);
    
    const resume = await Resume.findOne({ userId: req.params.userId });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    resume.experiences.pull(req.params.expId);
    await resume.save();
    
    console.log('✅ Experience deleted');
    res.json(resume);
  } catch (error) {
    console.error('❌ Error deleting experience:', error);
    res.status(400).json({ message: error.message });
  }
});

// UPDATE selected projects only
router.put('/:userId/projects', protect, async (req, res) => {
  try {
    console.log('🔗 Updating projects for user:', req.params.userId);
    const { projectIds } = req.body;
    
    const resume = await Resume.findOneAndUpdate(
      { userId: req.params.userId },
      { selectedProjects: projectIds },
      { new: true, upsert: true }
    ).populate('selectedProjects');
    
    console.log('✅ Projects updated');
    res.json(resume);
  } catch (error) {
    console.error('❌ Error updating projects:', error);
    res.status(400).json({ message: error.message });
  }
});

export default router;