const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  // GitHub Integration
  github: {
    username: String,
    githubId: Number,
    accessToken: String,
    avatar: String,
    connectedAt: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);