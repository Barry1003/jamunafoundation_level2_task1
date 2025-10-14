import User from "../models/User.js";
import jwt from "jsonwebtoken";

// 🧠 Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret123", {
    expiresIn: "90d",
  });
};

// 📝 REGISTER CONTROLLER (Local Auth)
export async function registerUser(req, res) {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const firstName = fullName.split(" ")[0].toLowerCase();
    const username = `${firstName}${Math.floor(Math.random() * 10000)}`;

    const user = await User.create({
      fullName,
      email,
      password,
      username,
      authProvider: 'local',
    });

    res.status(201).json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        authProvider: user.authProvider,
      },
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: err.message });
  }
}

// 🔐 LOGIN CONTROLLER (Local Auth)
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, authProvider: 'local' });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        authProvider: user.authProvider,
      },
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: err.message });
  }
}

// ✅ VERIFY TOKEN
export const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ valid: false, message: "No token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return res.status(404).json({ valid: false, message: "User not found" });

    res.status(200).json({ valid: true, user });
  } catch (err) {
    res.status(401).json({ valid: false, message: "Invalid token" });
  }
};

// ✅ GET CURRENT USER CONTROLLER
export const getCurrentUser = async (req, res) => {
  try {
    res.json({
      _id: req.user._id,
      username: req.user.username,
      fullName: req.user.fullName,
      email: req.user.email,
      avatar: req.user.avatar,
      authProvider: req.user.authProvider,
      hasResume: req.user.hasResume,
      githubId: req.user.githubId,
      githubProjectUsername: req.user.githubProjectUsername,
      githubProjectAvatar: req.user.githubProjectAvatar,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Error fetching user data" });
  }
};

// ✅ CHANGE PASSWORD (NEW)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(req.user._id);

    if (!user || user.authProvider !== 'local') {
      return res.status(400).json({ message: "Password change not available for this account type" });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Error changing password" });
  }
};

// 🆕 GITHUB OAUTH CALLBACK HANDLER
export const githubCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
    }

    const token = generateToken(req.user._id);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (err) {
    console.error("GitHub Callback Error:", err);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
};
