// routes/resumeRoutes.js
import express from 'express';
import Resume from '../models/resume.js';
import Project from '../models/Project.js'; // ✅ Add this import
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET resume by userId
router.get('/:userId', protect, async (req, res) => {
  try {
    console.log('📋 Fetching resume for user:', req.params.userId);
    
    // First, get resume without population to see raw data
    let resumeRaw = await Resume.findOne({ userId: req.params.userId });
    
    if (!resumeRaw) {
      console.log('📝 No resume found, creating new one');
      resumeRaw = await Resume.create({ 
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
          instagram: '',
          github: ''
        },
        experiences: [],
        selectedProjects: [],
        skills: [],
        education: [],
        certifications: []
      });
    }
    
    console.log('📦 Raw selectedProjects (as stored in DB):', resumeRaw.selectedProjects);
    console.log('📦 Number of selected project IDs:', resumeRaw.selectedProjects?.length || 0);
    
    // Now populate
    let resume = await Resume.findOne({ userId: req.params.userId })
      .populate({
        path: 'selectedProjects',
        select: 'name description status technologies links createdAt'
      })
      .populate('userId', 'fullName email avatar username');
    
    console.log('✅ Resume fetched with population');
    console.log('📦 Populated Projects Count:', resume.selectedProjects?.length || 0);
    
    if (resume.selectedProjects && resume.selectedProjects.length > 0) {
      console.log('📦 First populated project:', JSON.stringify(resume.selectedProjects[0], null, 2));
    } else {
      console.log('⚠️ No projects were populated - this means either:');
      console.log('   1. The project IDs don\'t exist in the Project collection');
      console.log('   2. The ref name doesn\'t match the model name');
      console.log('   3. The projects were deleted');
    }
    
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
    console.log('📥 Data received:', JSON.stringify(req.body, null, 2));
    console.log('📦 Selected Project IDs received:', req.body.selectedProjects);
    
    // Validate selectedProjects are valid ObjectIds (if provided)
    if (req.body.selectedProjects && Array.isArray(req.body.selectedProjects)) {
      console.log('✅ Validating project IDs...');
      req.body.selectedProjects.forEach((id, index) => {
        console.log(`   Project ${index + 1}:`, id);
      });
    }
    
    const resume = await Resume.findOneAndUpdate(
      { userId: req.params.userId },
      req.body,
      { new: true, upsert: true, runValidators: true }
    ).populate({
      path: 'selectedProjects',
      select: 'name description status technologies links createdAt'
    });
    
    console.log('✅ Resume updated successfully');
    console.log('📦 Populated Projects Count:', resume.selectedProjects?.length || 0);
    console.log('📦 Populated Projects:', JSON.stringify(resume.selectedProjects, null, 2));
    
    res.json(resume);
  } catch (error) {
    console.error('❌ Error updating resume:', error);
    console.error('❌ Error details:', error.stack);
    res.status(400).json({ message: error.message, error: error.toString() });
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
    
    console.log('📦 Project IDs to save:', projectIds);
    
    const resume = await Resume.findOneAndUpdate(
      { userId: req.params.userId },
      { selectedProjects: projectIds },
      { new: true, upsert: true }
    ).populate({
      path: 'selectedProjects',
      select: 'name description status technologies links createdAt'
    });
    
    console.log('✅ Projects updated');
    console.log('📦 Populated Projects:', resume.selectedProjects);
    res.json(resume);
  } catch (error) {
    console.error('❌ Error updating projects:', error);
    res.status(400).json({ message: error.message });
  }
});

// 🧪 TEST ENDPOINT - Verify project population works
router.get('/:userId/test-projects', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.params.userId });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    console.log('🧪 Testing project population...');
    console.log('📦 Raw Project IDs:', resume.selectedProjects);
    
    // Check if these projects actually exist
    const projects = await Project.find({ _id: { $in: resume.selectedProjects } });
    console.log('📦 Found Projects in DB:', projects.length);
    console.log('📦 Project Details:', projects.map(p => ({ id: p._id, name: p.name })));
    
    // Now test population
    const populatedResume = await Resume.findOne({ userId: req.params.userId })
      .populate('selectedProjects');
    
    console.log('📦 Populated Count:', populatedResume.selectedProjects.length);
    
    res.json({
      rawProjectIds: resume.selectedProjects,
      projectsFoundInDB: projects.length,
      projectDetails: projects.map(p => ({ id: p._id, name: p.name })),
      populatedProjects: populatedResume.selectedProjects
    });
  } catch (error) {
    console.error('❌ Test error:', error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
});

export default router;