import express from "express";
import https from "https";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";
import passport from "./config/passport.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";   
import githubRoutes from "./routes/githubRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import resumeRoutes from "./routes/resume.js";

dotenv.config();

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
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
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/job-tracker")  // ✅ Removed deprecated options
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ==========================================
// ROUTES
// ==========================================

// Auth Routes (Login, Register, GitHub OAuth Login, Password Management)
app.use("/api/auth", authRoutes);

// User Routes (Profile Management, Export Data, Deactivate Account)
app.use("/api/users", userRoutes);

// ✅ FIXED: GitHub Routes now mounted at /api/auth/github to match OAuth callback
app.use("/api/auth/github", githubRoutes);

// Project routes 
app.use("/api/projects", projectRoutes);

// Application routes (Job Applications CRUD)
app.use("/api/applications", applicationRoutes);

// Resume routes (Resume CRUD)
app.use("/api/resume", resumeRoutes);

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
// HEALTH CHECK
// ==========================================
app.get("/api/health", (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ==========================================
// ROOT CHECK
// ==========================================
app.get("/", (req, res) => {
  res.send("🚀 EmployX API is running...");
});

// ==========================================
// 404 HANDLER
// ==========================================
app.all("/*splat", (req, res) => {
  res.status(404).json({ 
    message: "Route not found",
    path: req.originalUrl 
  });
});

// ==========================================
// ERROR HANDLER
// ==========================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

// Start server locally (Vercel will ignore this in production)
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

// Export for Vercel serverless functions
export default app;
