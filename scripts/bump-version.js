#!/usr/bin/env node

/**
 * Version bump script
 * Increments the patch version in package.json and updates src/version.ts
 * Usage: node scripts/bump-version.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

try {
  // Read package.json
  const packageJsonPath = join(rootDir, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

  // Parse current version
  const [major, minor, patch] = packageJson.version.split('.').map(Number);

  // Increment patch version
  const newVersion = `${major}.${minor}.${patch + 1}`;

  // Update package.json
  packageJson.version = newVersion;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');

  // Update src/version.ts
  const versionTsPath = join(rootDir, 'src', 'version.ts');
  const buildDate = new Date().toISOString();
  const versionTsContent = `// Auto-generated version file
// This file is updated automatically by the version bump script

export const APP_VERSION = '${newVersion}';
export const BUILD_DATE = '${buildDate}';
`;
  writeFileSync(versionTsPath, versionTsContent, 'utf8');

  console.log(`✅ Version bumped: ${packageJson.version.split('.').slice(0, 2).join('.')}.${patch} → ${newVersion}`);
  console.log(`📅 Build date: ${buildDate}`);

  process.exit(0);
} catch (error) {
  console.error('❌ Error bumping version:', error.message);
  process.exit(1);
}
