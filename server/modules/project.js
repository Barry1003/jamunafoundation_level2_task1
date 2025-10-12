const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  // GitHub Repository Info
  githubRepo: {
    repoId: Number,
    fullName: String,
    url: String,
    language: String,
    stars: Number,
    forks: Number,
    isPrivate: Boolean,
    defaultBranch: String,
    lastCommitDate: Date
  },
  // Project Status
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'on-hold'],
    default: 'planning'
  },
  // Technologies used
  technologies: [{
    type: String
  }],
  // Project links
  links: {
    live: String,
    demo: String,
    documentation: String
  },
  // Track which job applications this project is linked to
  relatedApplications: [{
    type: Schema.Types.ObjectId,
    ref: 'JobApplication'
  }],
  // User who owns this project
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Notes and progress
  notes: String,
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  // Timeline
  startDate: Date,
  targetDate: Date,
  completedDate: Date
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);