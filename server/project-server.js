// project-server.js - Complete backend for Project Tracker with JWT and GitHub Integration
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken'); 
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/job-tracker') 
.then(() => console.log('✅ Project Tracker - MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ==========================================
// MODEL IMPORTS
// ==========================================
const User = require('./models/User'); 
const Project = require('./models/Project'); 
const JobApplication = require('./models/Application'); 
const Commit = require('./models/Commit'); 

// Environment Variables
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'http://localhost:5001/api/github/callback';
const JWT_SECRET = process.env.JWT_SECRET;

// Validate required environment variables
if (!JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET is not defined in .env file');
  process.exit(1);
}

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
  console.warn('⚠️  WARNING: GitHub OAuth credentials not configured');
}

// ==========================================
// 🛠️ GITHUB UTILITIES
// ==========================================

const fetchRepoDetails = async (repoFullName, accessToken) => {
  const GITHUB_API_BASE = 'https://api.github.com';
  const url = `${GITHUB_API_BASE}/repos/${repoFullName}`;

  try {
    const repoResponse = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const repoData = repoResponse.data;

    const commitUrl = `${url}/commits?per_page=1`;
    const commitResponse = await axios.get(commitUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const lastCommitDate = commitResponse.data.length > 0 
      ? new Date(commitResponse.data[0].commit.author.date) 
      : null;

    return {
      repoId: repoData.id,
      fullName: repoData.full_name,
      url: repoData.html_url,
      language: repoData.language,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      isPrivate: repoData.private,
      defaultBranch: repoData.default_branch,
      lastCommitDate: lastCommitDate,
      description: repoData.description,
      name: repoData.name
    };

  } catch (error) {
    const githubError = error.response?.data?.message 
        ? `GitHub API Error: ${error.response.data.message}` 
        : `Failed to communicate with GitHub API for repo: ${repoFullName}`;
    console.error(`Error fetching GitHub repo details:`, githubError);
    throw new Error(githubError);
  }
};

// ==========================================
// 🔑 JWT UTILITIES & MIDDLEWARE
// ==========================================

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

const authMiddleware = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-github.accessToken -password'); 

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error('JWT Error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed or expired' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// ==========================================
// USER ROUTES
// ==========================================

app.post('/api/users', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    let user = await User.findOne({ email });
    
    if (!user) {
      user = new User({ email, name });
      await user.save();
    }
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      github: user.github
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    if (req.params.id !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this user profile' });
    }
    
    const user = await User.findById(req.params.id).select('-github.accessToken');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    if (req.params.id !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this user profile' });
    }
      
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-github.accessToken');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ==========================================
// GITHUB OAUTH ROUTES
// ==========================================

app.get('/api/github/auth', (req, res) => {
  const { userId } = req.query;
  const state = userId || 'default';
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_CALLBACK_URL}&scope=repo,user&state=${state}`;
  res.redirect(githubAuthUrl);
});

app.get('/api/github/callback', async (req, res) => {
  const { code, state } = req.query;
  const userIdFromState = state !== 'default' ? state : null;

  if (!code) {
    return res.redirect('http://localhost:5173/projects?error=no_code');
  }

  try {
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      { client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code, redirect_uri: GITHUB_CALLBACK_URL },
      { headers: { Accept: 'application/json' } }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) { return res.redirect('http://localhost:5173/projects?error=no_token'); }

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const githubUser = userResponse.data;

    let user = null;
    if (userIdFromState) {
        user = await User.findById(userIdFromState);
    } 
    if (!user) {
        user = await User.findOne({ email: githubUser.email });
    }
    if (!user) {
      user = new User({ 
          email: githubUser.email || `${githubUser.login}@github-user.com`, 
          name: githubUser.name || githubUser.login 
      });
      await user.save();
    }
    
    user.github = {
        username: githubUser.login,
        githubId: githubUser.id,
        accessToken: accessToken,
        avatar: githubUser.avatar_url,
        connectedAt: new Date()
    };
    await user.save();

    const token = generateToken(user._id);
    
    const userData = encodeURIComponent(JSON.stringify({
      userId: user._id.toString(),
      token: token,
      username: githubUser.login,
      name: githubUser.name,
      avatar: githubUser.avatar_url,
      email: user.email,
      githubId: githubUser.id,
    }));

    res.redirect(`http://localhost:5173/projects?github_connected=true&data=${userData}`);
  } catch (error) {
    console.error('GitHub OAuth Error:', error.response?.data || error.message);
    res.redirect('http://localhost:5173/projects?error=auth_failed');
  }
});

app.get('/api/github/repos', authMiddleware, async (req, res) => {
  const accessToken = req.user.github?.accessToken; 

  if (!accessToken) {
    return res.status(401).json({ error: 'GitHub access token not found for user. Please reconnect GitHub.' });
  }
  
  try {
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        sort: 'updated',
        per_page: 100,
        affiliation: 'owner,collaborator',
      },
    });

    const repos = response.data.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        isPrivate: repo.private,
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
        defaultBranch: repo.default_branch,
    }));

    res.json(repos);
  } catch (error) {
    console.error('GitHub API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

app.get('/api/github/repos/:owner/:repo', authMiddleware, async (req, res) => {
  const { owner, repo } = req.params;
  const accessToken = req.user.github?.accessToken;

  if (!accessToken) {
    return res.status(401).json({ error: 'GitHub access token required' });
  }

  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    res.json(response.data);
  } catch (error) {
    console.error('GitHub API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch repository details' });
  }
});

app.get('/api/github/repos/:owner/:repo/commits', authMiddleware, async (req, res) => {
  const { owner, repo } = req.params;
  const accessToken = req.user.github?.accessToken;

  if (!accessToken) {
    return res.status(401).json({ error: 'GitHub access token required' });
  }

  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { per_page: 30 },
      }
    );

    const commits = response.data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        url: commit.html_url,
    }));

    res.json(commits);
  } catch (error) {
    console.error('GitHub API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch commits' });
  }
});

app.post('/api/github/disconnect', authMiddleware, async (req, res) => {
  const userId = req.user._id; 
  const accessToken = req.user.github?.accessToken;

  if (!accessToken) {
    await User.findByIdAndUpdate(userId, { $unset: { github: 1 } });
    return res.json({ success: true, message: 'GitHub connection already removed from database.' });
  }

  try {
    await axios.delete(
      `https://api.github.com/applications/${GITHUB_CLIENT_ID}/token`,
      {
        auth: {
          username: GITHUB_CLIENT_ID,
          password: GITHUB_CLIENT_SECRET,
        },
        data: { access_token: accessToken },
      }
    );

    await User.findByIdAndUpdate(userId, { $unset: { github: 1 } });

    res.json({ success: true, message: 'GitHub disconnected' });
  } catch (error) {
    console.error('Disconnect Error:', error.response?.data || error.message);
    await User.findByIdAndUpdate(userId, { $unset: { github: 1 } });
    res.status(200).json({ success: true, message: 'GitHub disconnected (Revocation failed on GitHub but database link was cleared)' });
  }
});

// ==========================================
// PROJECT ROUTES
// ==========================================

app.get('/api/projects', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const projects = await Project.find({ user: userId })
      .populate('relatedApplications', 'title company status')
      .sort({ updatedAt: -1 });
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('relatedApplications', 'title company status')
      .populate('user', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (project.user._id.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this project' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/projects', authMiddleware, async (req, res) => {
  let {
    name, description, githubFullName, status, technologies, links, notes, progress, startDate, targetDate
  } = req.body;
  
  try {
    const userId = req.user.id; 
    const accessToken = req.user.github?.accessToken;

    let githubRepoData = null;

    if (githubFullName) {
        if (!accessToken) {
             return res.status(401).json({ message: 'GitHub access token is required to link a repository. Please connect your GitHub account.' });
        }
        githubRepoData = await fetchRepoDetails(githubFullName, accessToken);
        name = name || githubRepoData.name;
        description = description || githubRepoData.description;
    }

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const project = new Project({
      name,
      description,
      githubRepo: githubRepoData,
      status: status || 'planning',
      technologies: technologies || [],
      links,
      user: userId,
      notes,
      progress: progress || 0,
      startDate,
      targetDate
    });

    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (error) {
    console.error("Project Creation Error:", error.message);
    const statusCode = error.message.includes('GitHub API Error') ? 400 : 500;
    res.status(statusCode).json({ 
        message: `Failed to create project: ${error.message}`,
        githubError: error.message.includes('GitHub API Error') ? error.message : undefined
    });
  }
});

app.patch('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    const projectId = req.params.id;
    const updates = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (project.user.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this project' });
    }
    
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      updates,
      { new: true, runValidators: true }
    ).populate('relatedApplications', 'title company status');

    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.user.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await Project.deleteOne({ _id: req.params.id });

    if (project.relatedApplications && project.relatedApplications.length > 0) {
      await JobApplication.updateMany(
        { _id: { $in: project.relatedApplications } },
        { $pull: { relatedProjects: project._id } }
      );
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/projects/:projectId/link-application/:applicationId', authMiddleware, async (req, res) => {
  try {
    const { projectId, applicationId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) { return res.status(404).json({ message: 'Project not found' }); }

    if (project.user.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Not authorized to modify this project' });
    }
    
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $addToSet: { relatedApplications: applicationId } },
      { new: true }
    ).populate('relatedApplications', 'title company status');

    await JobApplication.findByIdAndUpdate(
      applicationId,
      { $addToSet: { relatedProjects: projectId } }
    );

    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/projects/:projectId/unlink-application/:applicationId', authMiddleware, async (req, res) => {
  try {
    const { projectId, applicationId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) { return res.status(404).json({ message: 'Project not found' }); }

    if (project.user.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Not authorized to modify this project' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $pull: { relatedApplications: applicationId } },
      { new: true }
    ).populate('relatedApplications', 'title company status');

    await JobApplication.findByIdAndUpdate(
      applicationId,
      { $pull: { relatedProjects: projectId } }
    );

    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ==========================================
// COMMIT TRACKING ROUTES
// ==========================================

app.get('/api/projects/:projectId/commits', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) { return res.status(404).json({ message: 'Project not found' }); }
    
    if (project.user.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view commits for this project' });
    }

    const commits = await Commit.find({ project: req.params.projectId })
      .sort({ date: -1 })
      .limit(50);
    
    res.json(commits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/projects/:projectId/sync-commits', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId);
    
    if (!project || !project.githubRepo?.fullName) {
      return res.status(404).json({ message: 'Project or GitHub repo not found' });
    }

    if (project.user.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Not authorized to sync this project' });
    }

    const accessToken = req.user.github?.accessToken; 
    if (!accessToken) {
        return res.status(401).json({ message: 'GitHub not connected or access token missing' });
    }

    const [owner, repo] = project.githubRepo.fullName.split('/');

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { per_page: 30 }
      }
    );

    const commitPromises = response.data.map(async (commitData) => {
      const existingCommit = await Commit.findOne({ sha: commitData.sha });
      
      if (!existingCommit) {
        const commit = new Commit({
          project: projectId,
          sha: commitData.sha,
          message: commitData.commit.message,
          author: commitData.commit.author.name,
          date: commitData.commit.author.date,
          url: commitData.html_url
        });
        
        return commit.save();
      }
    });

    await Promise.all(commitPromises);

    const latestCommit = response.data[0];
    if (latestCommit) {
      await Project.findByIdAndUpdate(projectId, {
        'githubRepo.lastCommitDate': latestCommit.commit.author.date
      });
    }

    const commits = await Commit.find({ project: projectId })
      .sort({ date: -1 })
      .limit(30);

    res.json(commits);
  } catch (error) {
    console.error('Sync Commits Error:', error.response?.data || error.message);
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/commits/:id', authMiddleware, async (req, res) => {
  try {
    const commit = await Commit.findById(req.params.id).populate('project');
    
    if (!commit) {
      return res.status(404).json({ message: 'Commit not found' });
    }
    
    if (commit.project.user.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this commit' });
    }

    await Commit.deleteOne({ _id: req.params.id });

    res.json({ message: 'Commit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// STATISTICS & ANALYTICS
// ==========================================

app.get('/api/users/:userId/stats', authMiddleware, async (req, res) => {
  try {
    if (req.params.userId !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view these stats' });
    }
    
    const userId = req.user.id;

    const userProjects = await Project.find({ user: userId }).select('_id technologies');
    const projectIds = userProjects.map(p => p._id);

    const totalProjects = userProjects.length;
    const completedProjects = await Project.countDocuments({ 
      user: userId, 
      status: 'completed' 
    });
    const inProgressProjects = await Project.countDocuments({ 
      user: userId, 
      status: 'in-progress' 
    });
    const totalCommits = await Commit.countDocuments({
      project: { $in: projectIds }
    });

    const techCount = {};
    userProjects.forEach(project => {
      if (project.technologies) {
        project.technologies.forEach(tech => {
          techCount[tech] = (techCount[tech] || 0) + 1;
        });
      }
    });

    res.json({
      totalProjects,
      completedProjects,
      inProgressProjects,
      totalCommits,
      topTechnologies: Object.entries(techCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tech, count]) => ({ technology: tech, count }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Project Tracker API',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// ERROR HANDLING
// ==========================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// ==========================================
// SERVER START
// ==========================================
const PORT = process.env.PROJECT_PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Project Tracker Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});