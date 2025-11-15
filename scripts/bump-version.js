#!/usr/bin/env node

/**
 * Manual Release Version Bump Script
 * Only bumps version when commit message contains release tags
 * Usage: node scripts/bump-version.js
 *
 * Add one of these to your commit message to trigger a bump:
 * - [release-major] → Bumps major version (1.0.0 → 2.0.0)
 * - [release-minor] → Bumps minor version (1.0.0 → 1.1.0)
 * - [release-patch] → Bumps patch version (1.0.0 → 1.0.1)
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

function getLatestCommitMessage() {
  try {
    return execSync('git log -1 --pretty=%B', { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch {
    return '';
  }
}

function detectBumpType(commitMessage) {
  if (commitMessage.includes('[release-major]')) return 'major';
  if (commitMessage.includes('[release-minor]')) return 'minor';
  if (commitMessage.includes('[release-patch]')) return 'patch';
  return null;
}

try {
  // Get latest commit message
  const commitMessage = getLatestCommitMessage();
  const bumpType = detectBumpType(commitMessage);

  // If no release tag found, exit silently
  if (!bumpType) {
    console.log('ℹ️  No release tag found in commit message.');
    console.log('   Add one of these to bump version:');
    console.log('   • [release-major] for major version bump');
    console.log('   • [release-minor] for minor version bump');
    console.log('   • [release-patch] for patch version bump');
    process.exit(0);
  }

  // Read package.json
  const packageJsonPath = join(rootDir, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

  // Parse current version
  const [major, minor, patch] = packageJson.version.split('.').map(Number);

  // Calculate new version
  let newVersion;
  switch (bumpType) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
  }

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

  console.log(`✅ Version bumped [${bumpType.toUpperCase()}]: ${packageJson.version.replace(/\.\d+$/, `.${patch}`)} → ${newVersion}`);
  console.log(`📅 Build date: ${buildDate}`);
  console.log(`💬 Trigger: Found [release-${bumpType}] in commit message`);

  process.exit(0);
} catch (error) {
  console.error('❌ Error bumping version:', error.message);
  process.exit(1);
}
