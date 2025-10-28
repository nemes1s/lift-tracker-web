/**
 * Parse CHANGELOG.md and extract changes for a specific version
 */

export interface VersionChanges {
  version: string;
  date: string;
  features: string[];
  bugFixes: string[];
  improvements: string[];
  breakingChanges: string[];
}

/**
 * Fetch and parse the CHANGELOG.md file
 * Returns the changes for the specified version (or current version if not specified)
 */
export async function parseChangelog(targetVersion?: string): Promise<VersionChanges | null> {
  try {
    const response = await fetch('/CHANGELOG.md');
    if (!response.ok) {
      console.warn('Failed to fetch CHANGELOG.md');
      return null;
    }

    const content = await response.text();
    const version = targetVersion || getPackageVersion();

    return parseChangelogContent(content, version);
  } catch (error) {
    console.warn('Error parsing changelog:', error);
    return null;
  }
}

/**
 * Fetch and parse all versions from CHANGELOG.md
 * Returns an array of all versions in order (newest first)
 */
export async function parseAllVersions(): Promise<VersionChanges[]> {
  try {
    const response = await fetch('/CHANGELOG.md');
    if (!response.ok) {
      console.warn('Failed to fetch CHANGELOG.md');
      return [];
    }

    const content = await response.text();
    const versions: VersionChanges[] = [];

    // Find all version headers (e.g., "## [0.3.0] - 2025-10-28")
    const versionRegex = /^## \[([\d.]+)\]\s*-\s*(.+)$/gm;
    let match;

    while ((match = versionRegex.exec(content)) !== null) {
      const version = match[1];
      const parsed = parseChangelogContent(content, version);
      if (parsed) {
        versions.push(parsed);
      }
    }

    return versions;
  } catch (error) {
    console.warn('Error parsing all versions:', error);
    return [];
  }
}

/**
 * Parse the raw changelog content and extract a specific version
 */
function parseChangelogContent(content: string, version: string): VersionChanges | null {
  // Find the version header (e.g., "## [0.2.1] - 2025-10-28")
  const versionRegex = new RegExp(`^## \\[${version}\\]\\s*-\\s*(.+)$`, 'm');
  const versionMatch = content.match(versionRegex);

  if (!versionMatch) {
    console.warn(`Version ${version} not found in CHANGELOG.md`);
    return null;
  }

  const date = versionMatch[1];
  const versionStartIdx = content.indexOf(versionMatch[0]);

  // Find the next version header to know where this version ends
  const remainingContent = content.substring(versionStartIdx + versionMatch[0].length);
  const nextVersionMatch = remainingContent.match(/^## \[[\d.]+\]/m);
  const versionEndIdx = nextVersionMatch
    ? versionStartIdx + versionMatch[0].length + remainingContent.indexOf(nextVersionMatch[0])
    : content.length;

  const versionContent = content.substring(versionStartIdx, versionEndIdx);

  // Parse sections
  const features = parseSection(versionContent, 'Features');
  const bugFixes = parseSection(versionContent, 'Bug Fixes');
  const improvements = parseSection(versionContent, 'Improvements');
  const breakingChanges = parseSection(versionContent, 'Breaking Changes');

  return {
    version,
    date,
    features,
    bugFixes,
    improvements,
    breakingChanges,
  };
}

/**
 * Extract items from a specific section in the changelog
 */
function parseSection(content: string, sectionName: string): string[] {
  const sectionRegex = new RegExp(`^### ${sectionName}$`, 'm');
  const sectionMatch = content.match(sectionRegex);

  if (!sectionMatch) {
    return [];
  }

  const sectionStart = content.indexOf(sectionMatch[0]) + sectionMatch[0].length;
  const remainingContent = content.substring(sectionStart);

  // Find the next section header
  const nextSectionMatch = remainingContent.match(/^###/m);
  const sectionEnd = nextSectionMatch
    ? sectionStart + remainingContent.indexOf(nextSectionMatch[0])
    : content.length;

  const sectionContent = content.substring(sectionStart, sectionEnd);

  // Extract bullet points (both "- " and "* " formats)
  const items: string[] = [];
  const lines = sectionContent.split('\n');

  for (const line of lines) {
    const match = line.match(/^\s*[-*]\s+(.+)$/);
    if (match) {
      items.push(match[1]);
    }
  }

  return items;
}

/**
 * Get the current version from package.json
 */
function getPackageVersion(): string {
  // This will be replaced at runtime by the actual version
  // Fallback to reading from package.json or using a version constant
  const packageVersion = (globalThis as any).__APP_VERSION__ || '0.2.1';
  return packageVersion;
}
