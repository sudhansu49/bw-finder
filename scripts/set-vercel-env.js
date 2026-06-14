const { spawn, execSync } = require('child_process');

function addEnv(name, value) {
  return new Promise((resolve, reject) => {
    console.log(`Adding ${name}...`);
    const proc = spawn('npx', ['vercel', 'env', 'add', name, 'production'], {
      shell: true,
      stdio: ['pipe', 'inherit', 'inherit']
    });
    proc.stdin.write(value + '\n');
    proc.stdin.end();
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Failed to add ${name} (exit code ${code})`));
    });
  });
}

async function run() {
  const dbUrl = "postgresql://postgres.srctwgpggwemoucxotbs:mSCUCr4BI8MU00P7@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";
  const jwtSecret = "bw-finder-production-secret-key-2026";
  
  try {
    // Delete existing keys to clean start
    console.log("Cleaning up existing Vercel env variables...");
    try {
      execSync('npx vercel env rm DATABASE_URL production -y', { stdio: 'ignore' });
    } catch (e) {}
    try {
      execSync('npx vercel env rm JWT_SECRET production -y', { stdio: 'ignore' });
    } catch (e) {}

    await addEnv('DATABASE_URL', dbUrl);
    await addEnv('JWT_SECRET', jwtSecret);
    console.log("\nSUCCESS: Vercel environment variables have been set cleanly!");
  } catch (err) {
    console.error("\nERROR: Setting variables failed:", err.message);
  }
}

run();
