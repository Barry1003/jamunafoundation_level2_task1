// models/Resume.js
import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String },
  description: { type: String },
  current: { type: Boolean, default: false }
});

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Personal/Contact Info
  jobTitle: { type: String, default: '' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  aboutMe: { type: String, default: '' },
  
  // Social Links
  socialLinks: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    instagram: { type: String, default: '' }
  },
  
  // Professional Info
  experiences: [experienceSchema],
  
  // 🔗 Reference existing projects instead of duplicating
  selectedProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  
  skills: [{ type: String }],
  
  education: [{
    degree: String,
    institution: String,
    year: String
  }],
  
  certifications: [{
    name: String,
    issuer: String,
    date: String
  }]
}, { timestamps: true });

const Resume = mongoose.model("Resume", resumeSchema);
export default Resume;