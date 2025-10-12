import express from "express";
import https from "https";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";
import passport from "./config/passport.js";

import authRoutes from "./routes/authRoutes.js";
import githubRoutes from "./routes/githubRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js"; // 🆕 NEW - Application routes

dotenv.config();

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(express.json());

// Configure CORS to allow credentials
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Session middleware (required for passport and GitHub OAuth)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // true in production (HTTPS)
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// ==========================================
// MONGODB CONNECTION
// ==========================================
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/job-tracker", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ==========================================
// ROUTES
// ==========================================

// Auth Routes (Login, Register, GitHub OAuth Login)
app.use("/api/auth", authRoutes);

// GitHub Routes (Project Integration - Connect GitHub, Fetch Repos, Disconnect)
app.use("/api/github", githubRoutes);

// Project routes 
app.use("/api/projects", projectRoutes);

// Application routes (Job Applications CRUD)
app.use("/api/applications", applicationRoutes);

// ==========================================
// JOBS ENDPOINT (RAPID API)
// ==========================================
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

app.get("/api/jobs", (req, res) => {
  const { what, where, page } = req.query;
  const query = what || "developer";
  const location = where || "lagos";
  const pageNum = page || 1;

  const options = {
    method: "GET",
    hostname: "jsearch.p.rapidapi.com",
    port: null,
    path: `/search?query=${encodeURIComponent(query)}%20in%20${encodeURIComponent(location)}&page=${pageNum}&num_pages=1&country=ng`,
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": "jsearch.p.rapidapi.com",
    },
  };

  const apiReq = https.request(options, (apiRes) => {
    const chunks = [];
    apiRes.on("data", (chunk) => chunks.push(chunk));
    apiRes.on("end", () => {
      try {
        const body = Buffer.concat(chunks).toString();
        const data = JSON.parse(body);
        res.json(data);
      } catch (err) {
        console.error("JSON Parse Error:", err);
        res.status(500).json({ error: "Failed to parse API response" });
      }
    });
  });

  apiReq.on("error", (err) => {
    console.error("API Request Error:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  });

  apiReq.end();
});

// ==========================================
// ROOT CHECK
// ==========================================
app.get("/", (req, res) => {
  res.send("🚀 Job Tracker + Auth API is running...");
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));