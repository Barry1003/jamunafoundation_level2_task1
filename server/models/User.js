// models/User.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: function() {
        return this.authProvider === 'local';
      },
      unique: true,
      sparse: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: function() {
        return this.authProvider === 'local';
      },
      minlength: [6, "Password must be at least 6 characters"],
    },
    username: {
      type: String,
      unique: true,
      required: [true, "Username is required"],
      trim: true,
    },
    // GitHub OAuth Login fields
    githubId: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    authProvider: {
      type: String,
      enum: ['local', 'github'],
      default: 'local',
      required: true,
    },
    hasResume: {
      type: Boolean,
      default: false
    },
    // 🆕 GitHub Project Integration fields (separate from login)
    githubProjectToken: {
      type: String,
      default: null,
    },
    githubProjectUsername: {
      type: String,
      default: null,
    },
    githubProjectId: {
      type: Number,
      default: null,
    },
    githubProjectAvatar: {
      type: String,
      default: null,
    },
    githubProjectEmail: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.authProvider !== 'local' || !this.isModified("password")) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (this.authProvider !== 'local') {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;