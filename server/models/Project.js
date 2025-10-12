// models/Project.js
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'on-hold'],
    default: 'planning'
  },
  technologies: [{
    type: String,
    trim: true
  }],
  githubRepo: {
    repoId: Number,
    fullName: String,
    name: String,
    url: String,
    language: String,
    stars: Number,
    forks: Number,
    description: String
  },
  links: {
    live: String,
    demo: String,
    documentation: String
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  relatedApplications: [{
    _id: String,
    title: String,
    company: String,
    status: String
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Project = mongoose.model('Project', projectSchema);

export default Project;