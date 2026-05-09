import Groq from "groq-sdk";
import type { ParsedFile } from "@/lib/diff-parser";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export type ReviewIssue = {
  file: string;
  line: number | null;
  severity: "CRITICAL" | "WARNING" | "SUGGESTION";
  message: string;
  suggestion: string | null;
};

const SYSTEM_PROMPT = `You are an expert code reviewer. Analyze the provided git diff and return a JSON array of issues found.

Rules:
- Only report real issues — bugs, security risks, performance problems, bad practices
- Do not comment on formatting, whitespace, or style unless it causes bugs
- Be specific and actionable
- severity levels:
  - CRITICAL: bugs, security vulnerabilities, data loss risks
  - WARNING: performance issues, bad patterns, potential bugs
  - SUGGESTION: improvements, readability, best practices

Return ONLY a valid JSON array with this exact shape (no markdown, no explanation):
[
  {
    "line": <line number from diff or null if file-level>,
    "severity": "CRITICAL" | "WARNING" | "SUGGESTION",
    "message": "<clear description of the issue>",
    "suggestion": "<how to fix it, or null>"
  }
]

If there are no issues, return an empty array: []`;

const reviewFile = async (file: ParsedFile): Promise<ReviewIssue[]> => {
  const userPrompt = `File: ${file.filename}\n\nDiff:\n\`\`\`\n${file.diff}\n\`\`\``;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2, // low temperature = more consistent, less hallucination
    max_tokens: 2048,
  });

  const content = completion.choices[0]?.message?.content?.trim() ?? "[]";

  try {
    // Strip markdown code fences if the model wraps the JSON
    const clean = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const parsed = JSON.parse(clean) as Array<{
      line: number | null;
      severity: "CRITICAL" | "WARNING" | "SUGGESTION";
      message: string;
      suggestion: string | null;
    }>;

    return parsed.map((issue) => ({
      file: file.filename,
      line: issue.line ?? null,
      severity: issue.severity,
      message: issue.message,
      suggestion: issue.suggestion ?? null,
    }));
  } catch {
    console.error(`[ai] Failed to parse response for ${file.filename}:`, content);
    return [];
  }
};

// Review all files and aggregate results
export const reviewDiff = async (files: ParsedFile[]): Promise<ReviewIssue[]> => {
  const results = await Promise.allSettled(files.map(reviewFile));

  const allIssues: ReviewIssue[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      allIssues.push(...result.value);
    } else {
      console.error("[ai] File review failed:", result.reason);
    }
  }

  return allIssues;
};
