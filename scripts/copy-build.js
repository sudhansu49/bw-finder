const fs = require('fs');
const path = require('path');

try {
  // Copy .next/static to .next/standalone/.next/static
  const staticSrc = path.join(__dirname, '../.next/static');
  const staticDest = path.join(__dirname, '../.next/standalone/.next/static');
  if (fs.existsSync(staticSrc)) {
    fs.mkdirSync(path.dirname(staticDest), { recursive: true });
    fs.cpSync(staticSrc, staticDest, { recursive: true });
    console.log('Successfully copied .next/static to standalone');
  }

  // Copy public to .next/standalone/public
  const publicSrc = path.join(__dirname, '../public');
  const publicDest = path.join(__dirname, '../.next/standalone/public');
  if (fs.existsSync(publicSrc)) {
    fs.mkdirSync(path.dirname(publicDest), { recursive: true });
    fs.cpSync(publicSrc, publicDest, { recursive: true });
    console.log('Successfully copied public to standalone');
  }
} catch (err) {
  console.error('Error during post-build copy:', err);
  process.exit(1);
}
