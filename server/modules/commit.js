// models/Commit.js (Track GitHub commits for projects)
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commitSchema = new Schema({
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  sha: {
    type: String,
    required: true,
    unique: true
  },
  message: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  url: String,
  additions: Number,
  deletions: Number
}, { timestamps: true });

module.exports = mongoose.model('Commit', commitSchema);