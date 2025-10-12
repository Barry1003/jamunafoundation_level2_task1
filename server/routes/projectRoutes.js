// routes/projectRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Project from "../models/Project.js"; // You'll need to create this model too

const router = express.Router();

// Get all projects for authenticated user
router.get("/", protect, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id })
      .sort({ updatedAt: -1 });
    
    res.json(projects);
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

// Create new project
router.post("/", protect, async (req, res) => {
  try {
    const { name, description, status, technologies, progress, links, githubFullName } = req.body;
    
    const projectData = {
      name,
      description,
      status,
      technologies,
      progress,
      links,
      user: req.user._id
    };

    // If GitHub repo is linked, fetch and store repo data
    if (githubFullName && req.user.githubProjectToken) {
      const response = await fetch(
        `https://api.github.com/repos/${githubFullName}`,
        {
          headers: {
            Authorization: `Bearer ${req.user.githubProjectToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      
      if (response.ok) {
        const repo = await response.json();
        projectData.githubRepo = {
          repoId: repo.id,
          fullName: repo.full_name,
          name: repo.name,
          url: repo.html_url,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          description: repo.description,
        };
      }
    }

    const project = await Project.create(projectData);
    res.status(201).json(project);
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ message: "Failed to create project" });
  }
});

// Update project status
router.patch("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const { status, progress, ...otherUpdates } = req.body;
    
    if (status) project.status = status;
    if (progress !== undefined) project.progress = progress;
    
    Object.assign(project, otherUpdates);
    
    await project.save();
    res.json(project);
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).json({ message: "Failed to update project" });
  }
});

// Delete project
router.delete("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await project.deleteOne();
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({ message: "Failed to delete project" });
  }
});

export default router;