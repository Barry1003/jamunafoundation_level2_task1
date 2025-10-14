import express from "express";
import { 
  registerUser, 
  loginUser, 
  verifyToken, 
  githubCallback,
  getCurrentUser,
  changePassword  // ✅ NEW
} from "../controllers/authController.js";
import passport from "../config/passport.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 📝 Local Authentication Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify", verifyToken);

// ✅ GET CURRENT USER
router.get("/me", protect, getCurrentUser);

// ✅ CHANGE PASSWORD (NEW)
router.post("/change-password", protect, changePassword);

// 🆕 GitHub OAuth Routes
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=github_auth_failed`,
    session: false,
  }),
  githubCallback
);

export default router;
