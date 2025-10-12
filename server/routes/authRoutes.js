import express from "express";
import { registerUser, loginUser, verifyToken, githubCallback } from "../controllers/authController.js";
import passport from "../config/passport.js";

const router = express.Router();

// 📝 Local Authentication Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify", verifyToken);

// 🆕 GitHub OAuth Routes
// Route 1: Redirect user to GitHub for authentication
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// Route 2: GitHub callback after successful authentication
router.get(
  "/github/callback",
  passport.authenticate("github", { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=github_auth_failed`,
    session: false, // We're using JWT, not sessions
  }),
  githubCallback
);

export default router;