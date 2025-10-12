// config/passportProjects.js

import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import dotenv from "dotenv";

dotenv.config();

// Validate required environment variables
if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
  console.error("❌ ERROR: GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be set in .env file");
  process.exit(1);
}

// Configure GitHub OAuth Strategy for PROJECT INTEGRATION
const githubProjectStrategy = new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL_PROJECTS || "http://localhost:5000/api/github/callback",
    scope: ["repo", "user:email"], // Request repo access for project integration
    passReqToCallback: true, // Pass request to callback
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      console.log("🔧 GitHub Project Integration Strategy triggered");
      
      // Extract GitHub user info
      const githubData = {
        githubToken: accessToken,
        githubId: profile.id,
        username: profile.username,
        name: profile.displayName || profile.username,
        avatar: profile.photos?.[0]?.value || profile.avatar_url || null,
        email: profile.emails?.[0]?.value || null,
      };

      console.log("✅ GitHub project data collected:", {
        username: githubData.username,
        githubId: githubData.githubId,
      });

      // Return the data (will be available in req.user)
      return done(null, githubData);
    } catch (err) {
      console.error("❌ GitHub Project Strategy Error:", err);
      return done(err, null);
    }
  }
);

// Name the strategy to avoid conflicts with auth strategy
passport.use("github-projects", githubProjectStrategy);

// Serialize user for session (project integration)
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;