import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/User.js";

// 🔧 Load environment variables FIRST
dotenv.config();

// 🔧 Validate required environment variables
if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
  console.error("❌ ERROR: GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be set in .env file");
  process.exit(1);
}

// 🔧 Configure GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email'], // Request user's email
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract GitHub user info
        const githubId = profile.id;
        const fullName = profile.displayName || profile.username;
        const avatar = profile.photos?.[0]?.value || profile.avatar_url || null;
        const email = profile.emails?.[0]?.value || null;
        
        // Generate username from GitHub username
        let username = profile.username;

        // Check if user already exists with this GitHub ID
        let user = await User.findOne({ githubId });

        if (user) {
          // ✅ User exists - return existing user
          console.log("✅ Existing GitHub user logged in:", user.username);
          return done(null, user);
        }

        // 🆕 User doesn't exist - create new user
        // Ensure username is unique
        let uniqueUsername = username;
        let counter = 1;
        while (await User.findOne({ username: uniqueUsername })) {
          uniqueUsername = `${username}${counter}`;
          counter++;
        }

        user = await User.create({
          githubId,
          fullName,
          email: email || undefined, // Don't store null, store undefined
          username: uniqueUsername,
          avatar,
          authProvider: 'github',
        });

        console.log("🆕 New GitHub user created:", user.username);
        return done(null, user);
      } catch (err) {
        console.error("GitHub Strategy Error:", err);
        return done(err, null);
      }
    }
  )
);

// Serialize user (store user ID in session)
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user (retrieve user from session)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select("-password");
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;