// models/JobApplication.js
import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

const jobApplicationSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['applied', 'interview', 'offered', 'rejected'],
    default: 'applied'
  },
  link: {
    type: String
  },
  notes: {
    type: String
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  }
}, { timestamps: true });

export default model('JobApplication', jobApplicationSchema);
