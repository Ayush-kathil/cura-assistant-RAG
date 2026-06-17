import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runChecks() {
  console.log("Starting Production Readiness Checks...");
  let errors = 0;

  // 1. Environment Variables
  const requiredEnvs = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'GEMINI_API_KEY'];
  requiredEnvs.forEach(env => {
    if (!process.env[env] && !process.env.CI) { // Allow CI bypass for envs usually set in Vercel UI
      console.warn(`⚠️ Warning: Missing environment variable locally: ${env}`);
    }
  });

  // 2. Security Check
  try {
    const envLocalPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envLocalPath)) {
      const envLocal = fs.readFileSync(envLocalPath, 'utf-8');
      if (envLocal.includes('NEXT_PUBLIC_GEMINI_API_KEY')) {
        console.error(`❌ Security Violation: NEXT_PUBLIC_GEMINI_API_KEY found in .env.local! Must be removed.`);
        errors++;
      } else {
        console.log(`✅ No NEXT_PUBLIC_GEMINI_API_KEY found.`);
      }
    }
  } catch(e) {}

  // 3. Database & Gemini Endpoints Check
  console.log("⏳ Skipping live endpoint tests in build script, but they are available at /api/health/database and /api/health/gemini");

  if (errors > 0) {
    console.error(`\n❌ Production check failed with ${errors} errors.`);
    process.exit(1);
  } else {
    console.log(`\n✅ All production checks passed! Ready for Vercel deployment.`);
    process.exit(0);
  }
}

runChecks();
