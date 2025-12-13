import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Explicitly load the correct .env file
const envPath = join(__dirname, '../.env');
console.log('🔍 env-loader trying path:', envPath);

// Verify file exists and is readable
import fs from 'fs';
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log(`📂 File found. Size: ${envContent.length} bytes.`);
  console.log(`📝 First 50 chars: ${envContent.substring(0, 50)}...`);
} catch (err) {
  console.error('❌ Failed to read .env file:', err.message);
}

dotenv.config({ path: envPath });

console.log('✅ Environment variables loaded via env-loader.js');
console.log('📍 MONGODB_URI exists:', !!process.env.MONGODB_URI);
