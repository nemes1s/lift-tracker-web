import fs from 'fs';
import path from 'path';

const sourceFile = 'CHANGELOG.md';
const destDir = 'public';
const destFile = path.join(destDir, 'CHANGELOG.md');

try {
  // Ensure public directory exists
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Copy CHANGELOG.md to public
  fs.copyFileSync(sourceFile, destFile);
  console.log(`✓ Copied CHANGELOG.md to ${destFile}`);
} catch (error) {
  console.error(`✗ Error copying CHANGELOG.md:`, error.message);
  process.exit(1);
}
