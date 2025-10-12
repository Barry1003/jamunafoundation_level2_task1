import express from "express";
import JobApplication from "../modules/Application.js";

const router = express.Router();

// GET all applications
router.get("/", async (req, res) => {
  try {
    const applications = await JobApplication.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single application
router.get("/:id", async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new application
router.post("/", async (req, res) => {
  try {
    const { title, company, status, link, notes, project } = req.body;
    if (!title || !company) {
      return res.status(400).json({ message: "Title and company are required" });
    }

    const projectId = project || "507f1f77bcf86cd799439011";

    const application = new JobApplication({
      title,
      company,
      status: status || "applied",
      link,
      notes,
      project: projectId,
    });

    const savedApplication = await application.save();
    res.status(201).json(savedApplication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH update application
router.patch("/:id", async (req, res) => {
  try {
    const { status, notes, title, company, link } = req.body;
    const updateFields = {};

    if (status) updateFields.status = status;
    if (notes !== undefined) updateFields.notes = notes;
    if (title) updateFields.title = title;
    if (company) updateFields.company = company;
    if (link) updateFields.link = link;

    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE application
router.delete("/:id", async (req, res) => {
  try {
    const application = await JobApplication.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;