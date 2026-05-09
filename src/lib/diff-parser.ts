export type ParsedFile = {
  filename: string;
  diff: string;
};

// Files we never want to review — lock files, generated files, configs
const IGNORED_PATTERNS = [
  /package-lock\.json$/,
  /yarn\.lock$/,
  /pnpm-lock\.yaml$/,
  /bun\.lockb$/,
  /\.lock$/,
  /dist\//,
  /build\//,
  /\.next\//,
  /out\//,
  /coverage\//,
  /node_modules\//,
  /\.min\.(js|css)$/,
  /\.generated\./,
  /src\/generated\//,
  /prisma\/migrations\//,
  /\.d\.ts$/,
];

const isIgnored = (filename: string): boolean =>
  IGNORED_PATTERNS.some((pattern) => pattern.test(filename));

// Parse a unified diff string into per-file chunks
// Each chunk has the filename and the diff content for that file only
export const parseDiff = (rawDiff: string): ParsedFile[] => {
  const files: ParsedFile[] = [];

  // Split on "diff --git" which starts each file's diff block
  const chunks = rawDiff.split(/^diff --git /m).filter(Boolean);

  for (const chunk of chunks) {
    // Extract filename from "a/path/to/file b/path/to/file"
    const filenameMatch = chunk.match(/^a\/.+ b\/(.+)\n/);
    if (!filenameMatch) continue;

    const filename = filenameMatch[1].trim();
    if (isIgnored(filename)) continue;

    // Skip binary files
    if (chunk.includes("Binary files")) continue;

    // Keep only meaningful diffs (must have +/- lines)
    const hasDiff = chunk.includes("\n+") || chunk.includes("\n-");
    if (!hasDiff) continue;

    files.push({ filename, diff: chunk });
  }

  return files;
};
