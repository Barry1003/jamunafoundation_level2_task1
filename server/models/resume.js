// models/Resume.js
import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, default: '' },
  description: { type: String, default: '' },
  current: { type: Boolean, default: false }
}, { _id: false }); // ✅ Add this to disable _id generation

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Personal Info
  fullName: { type: String, default: '' },
  jobTitle: { type: String, default: '' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  aboutMe: { type: String, default: '' },
  
  // Social Links
  socialLinks: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    instagram: { type: String, default: '' },
    github: { type: String, default: '' } // Added missing github
  },
  
  // Professional Info
  experiences: [experienceSchema],
  
  // Reference existing projects
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
