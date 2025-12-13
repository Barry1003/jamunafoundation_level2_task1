import "../config/env-loader.js"; // Must be first
import express from "express";
import https from "https";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";
import passport from "../config/passport.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import routes
import authRoutes from "../routes/authRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import githubRoutes from "../routes/githubRoutes.js";
import projectRoutes from "../routes/projectRoutes.js";
import applicationRoutes from "../routes/applicationRoutes.js";
import resumeRoutes from "../routes/resume.js";

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const app = express();

// ==========================================
// MONGODB CONNECTION (CACHED FOR SERVERLESS)
// ==========================================
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("✅ Using existing MongoDB connection");
    return;
  }

  try {
    console.log("🔌 Attempting MongoDB connection...");
    console.log("📍 MongoDB URI exists:", !!process.env.MONGODB_URI);
    
    const sanitizedUri = process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':****@');
    console.log("🔗 Connection URI:", sanitizedUri);
    
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }
    
    // Enhanced connection options for better reliability
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 60000,
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      family: 4, // Force IPv4
      retryWrites: true,
      retryReads: true,
    });
    
    isConnected = db.connections[0].readyState === 1;
    console.log("✅ MongoDB connected successfully");
    console.log("📊 Database name:", db.connections[0].name);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    throw err;
  }
};

// Initialize connection
connectDB();

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Define allowed origins for CORS
const allowedOrigins = [
  'https://jamunafoundationlevel2task1.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.FRONTEND_URL
].filter(Boolean);

// Configure CORS to allow your frontend
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('❌ CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400,
    optionsSuccessStatus: 200
  })
);

// Explicit CORS headers for all responses (Additional layer for compatibility)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Session middleware (required for passport and GitHub OAuth)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// ==========================================
// ROUTES
// ==========================================

// Auth Routes (Login, Register, GitHub OAuth Login, Password Management)
app.use("/api/auth", authRoutes);

// User Routes (Profile Management, Export Data, Deactivate Account)
app.use("/api/users", userRoutes);

// GitHub Routes now mounted at /api/auth/github to match OAuth callback
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
// TEST CHECK
// ==========================================
// Add this test endpoint
app.get("/api/db-test", async (req, res) => {
  try {
    console.log('🔍 Testing MongoDB connection...');
    console.log('📍 MongoDB URI exists:', !!process.env.MONGODB_URI);
    
    // Try to connect
    await connectDB();
    
    // Try a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    res.json({ 
      success: true,
      message: 'MongoDB connected successfully!',
      isConnected,
      collections: collections.map(c => c.name),
      dbName: mongoose.connection.db.databaseName
    });
  } catch (error) {
    console.error('❌ MongoDB test failed:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});
// ==========================================
// HEALTH CHECK
// ==========================================
app.get("/api/health", (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: isConnected ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
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
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
    method: req.method
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
// START SERVER (LOCAL ONLY)
// ==========================================
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  });
}

// Export for Vercel serverless functions
export default app;
