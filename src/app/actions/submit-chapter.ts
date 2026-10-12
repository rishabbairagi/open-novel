"use server";

import { Octokit } from "@octokit/rest";
import matter from "gray-matter";
import { customAlphabet } from "nanoid";
import { novelMetaSchema, submissionSchema } from "@/lib/schemas";
import { countWords } from "@/lib/utils";
import type { SubmitResult } from "@/lib/types";

// Lowercase alphanumerics only so the webhook can parse the branch name reliably.
const shortId = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 8);

function isPlaceholder(v: string | undefined): boolean {
  return !v || v.includes("your") || v.includes("changeme");
}

async function fileExists(octokit: Octokit, owner: string, repo: string, path: string, ref: string): Promise<boolean> {
  try {
    await octokit.rest.repos.getContent({ owner, repo, path, ref });
    return true;
  } catch (err) {
    if ((err as { status?: number }).status === 404) return false;
    throw err;
  }
}

const b64 = (text: string) => Buffer.from(text, "utf8").toString("base64");

export async function submitChapterAction(formData: FormData): Promise<SubmitResult> {
  // 1. Validate
  const parsed = submissionSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { success: false, error: "Some fields need attention.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const p = parsed.data;
  const wordCount = countWords(p.content);
  const padded = String(p.chapterNum).padStart(2, "0");
  const novelDir = `content/novels/${p.novelSlug}`;
  const chapterPath = `${novelDir}/ch-${padded}.md`;
  const metaPath = `${novelDir}/meta.json`;
  const branch = `submission/${p.novelSlug}-ch${p.chapterNum}-${shortId()}`;
  const title = `[Submission] ${p.novelTitle} - Chapter ${p.chapterNum}`;

  const chapterFile = matter.stringify(`${p.content.trim()}\n`, {
    chapter: p.chapterNum,
    title: p.chapterTitle,
    publishedAt: new Date().toISOString(),
    author: p.author,
    wordCount,
  });

  let metaFile: string | null = null;
  if (p.mode === "new") {
    const meta = novelMetaSchema.safeParse({
      title: p.novelTitle, slug: p.novelSlug, author: p.author, synopsis: p.synopsis,
      cover: p.cover, genres: p.genres, status: p.status,
    });
    if (!meta.success) return { success: false, error: "Novel details are invalid.", fieldErrors: meta.error.flatten().fieldErrors };
    metaFile = `${JSON.stringify(meta.data, null, 2)}\n`;
  }

  const body = [
    p.mode === "new" ? "## New novel proposal" : "## New chapter submission",
    "",
    `**Novel:** ${p.novelTitle} (\`${p.novelSlug}\`)`,
    `**Chapter:** ${p.chapterNum}, ${p.chapterTitle}`,
    `**Author:** ${p.author}`,
    `**Word count:** ${wordCount}`,
    "",
    "### Author notes",
    p.authorNotes || "_None provided._",
    "",
    "---",
    `Files: \`${chapterPath}\`${metaFile ? `, \`${metaPath}\`` : ""}`,
    "Submitted through the OpenNovel web studio. Check quality, content policy and licensing before merging.",
  ].join("\n");

  // 2. Env (server-only) + mock fallback for local development
  const token = process.env.GITHUB_PAT_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  const configured = !isPlaceholder(token) && !!owner && !!repo;

  if (!configured) {
    if (process.env.NODE_ENV === "production") {
      console.error("[submit] GITHUB_PAT_TOKEN / GITHUB_REPO_OWNER / GITHUB_REPO_NAME are not configured.");
      return { success: false, error: "Submissions are temporarily unavailable. Please try again later." };
    }
    const prNumber = Math.floor(1000 + Math.random() * 9000);
    console.log("[submit:MOCK] GitHub is not configured; simulating Git operations:", {
      base: "main", branch, files: [chapterPath, ...(metaFile ? [metaPath] : [])], pullRequest: { title, body },
    });
    return { success: true, mock: true, prUrl: `https://github.com/${owner ?? "mock-owner"}/${repo ?? "opennovel"}/pull/${prNumber}` };
  }

  const octokit = new Octokit({ auth: token });
  const base = process.env.GITHUB_BASE_BRANCH || "main";
  let branchCreated = false;

  try {
    // 3. Latest commit SHA on base branch
    const { data: baseBranch } = await octokit.rest.repos.getBranch({ owner: owner!, repo: repo!, branch: base });
    const baseSha = baseBranch.commit.sha;

    // Guard against clobbering existing content (checked on the base branch).
    if (metaFile && (await fileExists(octokit, owner!, repo!, metaPath, base))) {
      return { success: false, error: `A novel with the slug "${p.novelSlug}" already exists. Pick another slug or add a chapter to it.`, fieldErrors: { novelSlug: ["Slug already taken."] } };
    }
    if (await fileExists(octokit, owner!, repo!, chapterPath, base)) {
      return { success: false, error: `Chapter ${p.chapterNum} already exists for this novel.`, fieldErrors: { chapterNum: ["Chapter already exists."] } };
    }

    // 4. Branch
    await octokit.rest.git.createRef({ owner: owner!, repo: repo!, ref: `refs/heads/${branch}`, sha: baseSha });
    branchCreated = true;

    // 5. Files
    const commit = (path: string, content: string, message: string) =>
      octokit.rest.repos.createOrUpdateFileContents({ owner: owner!, repo: repo!, path, message, content: b64(content), branch });
    if (metaFile) await commit(metaPath, metaFile, `feat(${p.novelSlug}): add novel metadata`);
    await commit(chapterPath, chapterFile, `feat(${p.novelSlug}): add chapter ${p.chapterNum}`);

    // 6. Pull request
    const { data: pr } = await octokit.rest.pulls.create({ owner: owner!, repo: repo!, title, head: branch, base, body });

    // 7. Result
    return { success: true, prUrl: pr.html_url };
  } catch (err) {
    console.error("[submit] GitHub error:", err);
    if (branchCreated) {
      await octokit.rest.git.deleteRef({ owner: owner!, repo: repo!, ref: `heads/${branch}` }).catch(() => undefined);
    }
    const status = (err as { status?: number }).status;
    const error =
      status === 401 || status === 403 ? "The server's GitHub credentials were rejected. The maintainers have been notified via logs."
      : status === 404 ? "The content repository or base branch could not be found."
      : status === 422 ? "GitHub rejected the submission (it may already exist)."
      : "Could not reach GitHub. Please try again in a minute.";
    return { success: false, error };
  }
}
