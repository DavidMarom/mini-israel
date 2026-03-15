/**
 * Reads a feature idea from MongoDB and uses Claude Agent SDK to implement it,
 * then creates a pull request.
 *
 * Usage: node scripts/implement-idea.mjs <ideaId>
 */

import { readFileSync } from "fs";
import { execSync, execFileSync } from "child_process";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

// ── Load .env.local ────────────────────────────────────────────────────────────
function loadEnvFile(filePath) {
  try {
    const content = readFileSync(filePath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // no .env.local — rely on environment
  }
}

loadEnvFile(".env.local");

// ── Args ───────────────────────────────────────────────────────────────────────
const ideaId = process.argv[2];
if (!ideaId) {
  console.error("Usage: node scripts/implement-idea.mjs <ideaId>");
  process.exit(1);
}

const MONGO_URI = process.env.MONGODB || process.env.MONGO;
if (!MONGO_URI) {
  console.error("MONGODB / MONGO env var not set");
  process.exit(1);
}

const PROJECT_DIR = process.cwd();

// ── Helpers ────────────────────────────────────────────────────────────────────
function git(...args) {
  return execFileSync("git", args, { cwd: PROJECT_DIR, encoding: "utf8" }).trim();
}

function gh(...args) {
  return execFileSync("gh", args, { cwd: PROJECT_DIR, encoding: "utf8" }).trim();
}

function safeBranchName(id) {
  return `idea/${id.slice(-8)}`;
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  // 1. Connect to MongoDB and fetch the idea
  const mongoClient = new MongoClient(MONGO_URI, {
    serverApi: { version: ServerApiVersion.v1 },
  });
  await mongoClient.connect();
  const db = mongoClient.db("main");
  const ideas = db.collection("feature_ideas");

  const idea = await ideas.findOne({ _id: new ObjectId(ideaId) });
  if (!idea) {
    console.error(`Idea ${ideaId} not found`);
    process.exit(1);
  }

  console.log(`\n💡 Implementing idea: "${idea.idea}"\n`);

  // 2. Mark as implementing
  await ideas.updateOne(
    { _id: new ObjectId(ideaId) },
    { $set: { status: "implementing", startedAt: new Date() } }
  );

  // 3. Create a fresh branch from main
  const branch = safeBranchName(ideaId);
  const currentBranch = git("rev-parse", "--abbrev-ref", "HEAD");

  try {
    git("checkout", "main");
    git("pull", "--ff-only");
  } catch {
    // may fail if working tree is dirty — continue anyway on the current branch
    console.warn("Could not switch to main, continuing on current branch.");
  }

  git("checkout", "-b", branch);
  console.log(`✅ Created branch: ${branch}`);

  // 4. Run Claude Agent SDK to implement the feature
  const prompt = `You are implementing a user-requested feature for the **מיני ישראל** (Mini Israel) game — a Next.js 16 + MongoDB web game in Hebrew with a dark CoC-inspired UI.

## The feature request
"${idea.idea}"
${idea.name ? `\nRequested by: ${idea.name}` : ""}

## Your task
Implement this feature in the codebase. Follow the existing patterns exactly:
- **Framework**: Next.js App Router (src/app/), JavaScript (not TypeScript)
- **Database**: MongoDB via \`src/services/mongo.js\` (native driver, db name "main")
- **UI language**: Hebrew, RTL (\`direction: rtl\`)
- **Styling**: CSS Modules (.module.css files co-located with components)
- **State**: Zustand (\`src/store/useUserStore.js\`), React Query for server data
- **Auth**: Firebase Google OAuth — user uid available from stored user
- **API pattern**: Next.js route handlers under \`src/app/api/\`, return \`NextResponse.json({ ok: true })\` / \`{ error }\`

## Steps
1. First read the relevant existing files to understand the codebase structure and patterns.
2. Implement the feature by editing/creating files.
3. Do NOT run any git commands.
4. Keep changes minimal and focused — only what's needed for this specific feature.
5. Make sure all new UI text is in Hebrew.

Start by exploring the codebase to find the best place to add this feature.`;

  let agentResult = null;

  try {
    for await (const message of query({
      prompt,
      options: {
        cwd: PROJECT_DIR,
        allowedTools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash"],
        permissionMode: "bypassPermissions",
        allowDangerouslySkipPermissions: true,
        maxTurns: 60,
        model: "claude-opus-4-6",
      },
    })) {
      if ("result" in message) {
        agentResult = message.result;
        console.log("\n🤖 Agent result:", agentResult);
      }
    }
  } catch (err) {
    console.error("Agent error:", err.message);
    // Restore branch and mark failed
    try { git("checkout", currentBranch); } catch {}
    try { git("branch", "-D", branch); } catch {}
    await ideas.updateOne(
      { _id: new ObjectId(ideaId) },
      { $set: { status: "new", startedAt: null } }
    );
    await mongoClient.close();
    process.exit(1);
  }

  // 5. Check if there are any changes to commit
  let hasChanges = false;
  try {
    const diff = git("status", "--porcelain");
    hasChanges = diff.length > 0;
  } catch {}

  if (!hasChanges) {
    console.warn("⚠️  Agent made no file changes — aborting PR creation.");
    git("checkout", currentBranch);
    git("branch", "-D", branch);
    await ideas.updateOne(
      { _id: new ObjectId(ideaId) },
      { $set: { status: "new" } }
    );
    await mongoClient.close();
    return;
  }

  // 6. Commit
  const commitTitle = `feat: ${idea.idea.replace(/"/g, "'").slice(0, 72)}`;
  git("add", "-A");
  execFileSync(
    "git",
    [
      "commit",
      "-m",
      `${commitTitle}\n\nCo-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`,
    ],
    { cwd: PROJECT_DIR, encoding: "utf8" }
  );
  console.log("✅ Committed changes");

  // 7. Push branch
  git("push", "-u", "origin", branch);
  console.log("✅ Pushed branch");

  // 8. Create PR
  const prBody = `## Feature request
> "${idea.idea}"
${idea.name ? `\nRequested by: **${idea.name}**` : ""}

## Changes
${agentResult || "Implemented as requested."}

---
🤖 Auto-implemented by Claude Opus 4.6`;

  const prUrl = gh(
    "pr",
    "create",
    "--title",
    commitTitle,
    "--body",
    prBody,
    "--base",
    "main",
    "--head",
    branch
  );
  console.log(`\n✅ PR created: ${prUrl}`);

  // 9. Update idea status
  await ideas.updateOne(
    { _id: new ObjectId(ideaId) },
    { $set: { status: "done", prUrl, implementedAt: new Date() } }
  );

  await mongoClient.close();
  console.log("\n🎉 Done!");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
