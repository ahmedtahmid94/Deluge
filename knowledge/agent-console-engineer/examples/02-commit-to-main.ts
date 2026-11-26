// Example 2: commit an approved proposal straight to main (decision D2) with the Git Data API,
// atomically, with a conflict check and force:false. Runs against an in-memory fake GitHub.
// Run: node --experimental-strip-types 02-commit-to-main.ts
import assert from "node:assert/strict";

type FileChange = { path: string; action: "create" | "update" | "delete"; content?: string; baseBlobSha: string | null };
type Proposal = { id: string; agent: string; summary: string; baseCommit: string; files: FileChange[] };
type Fetch = (url: string, init?: { method?: string; headers?: Record<string, string>; body?: string }) => Promise<Response>;

export async function commitProposal(fetchFn: Fetch, repo: string, token: string, p: Proposal) {
  const api = `https://api.github.com/repos/${repo}`;
  const headers = { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2026-03-10" };
  const call = async (method: string, path: string, body?: unknown) => {
    const res = await fetchFn(api + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    if (!res.ok) throw Object.assign(new Error(`GitHub ${method} ${path} -> ${res.status}`), { status: res.status });
    return res.json() as Promise<any>;
  };
  const ref = await call("GET", "/git/ref/heads/main");
  const head: string = ref.object.sha;
  if (head !== p.baseCommit) {                       // main moved: only proceed if our files are untouched
    for (const f of p.files) {
      const cur = await fetchFn(`${api}/contents/${f.path}?ref=main`, { method: "GET", headers });
      const curSha = cur.status === 404 ? null : (await cur.json()).sha;
      if (curSha !== f.baseBlobSha) return { status: "stale" as const, path: f.path };
    }
  }
  const commit = await call("GET", `/git/commits/${head}`);
  const tree = await call("POST", "/git/trees", {
    base_tree: commit.tree.sha,
    tree: p.files.map(f => f.action === "delete"
      ? { path: f.path, mode: "100644", type: "blob", sha: null }
      : { path: f.path, mode: "100644", type: "blob", content: f.content }),
  });
  const created = await call("POST", "/git/commits", {
    message: `agent(${p.agent}): ${p.summary} [proposal ${p.id}]`, tree: tree.sha, parents: [head],
  });
  await call("PATCH", "/git/refs/heads/main", { sha: created.sha, force: false });
  return { status: "committed" as const, sha: created.sha as string, url: created.html_url as string };
}

// ---- in-memory fake GitHub ----
function fakeGitHub(state: { head: string; blobs: Record<string, string> }) {
  const log: string[] = [];
  const fetchFn: Fetch = async (url, init = {}) => {
    const u = new URL(url); const path = u.pathname.replace(/^\/repos\/[^/]+\/[^/]+/, ""); const m = init.method ?? "GET";
    log.push(`${m} ${path}`);
    assert.equal(init.headers?.Authorization, "Bearer test-token");
    const ok = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s });
    if (m === "GET" && path === "/git/ref/heads/main") return ok({ ref: "refs/heads/main", object: { type: "commit", sha: state.head } });
    if (m === "GET" && path.startsWith("/contents/")) { const p = path.slice(10); return p in state.blobs ? ok({ type: "file", sha: state.blobs[p] }) : ok({}, 404); }
    if (m === "GET" && path.startsWith("/git/commits/")) return ok({ sha: path.slice(13), tree: { sha: "tree-" + path.slice(13) } });
    if (m === "POST" && path === "/git/trees") { assert.ok(JSON.parse(init.body!).base_tree); return ok({ sha: "newtree" }, 201); }
    if (m === "POST" && path === "/git/commits") { const b = JSON.parse(init.body!); assert.deepEqual(b.parents, [state.head]); return ok({ sha: "newcommit", html_url: "https://github.com/o/r/commit/newcommit" }, 201); }
    if (m === "PATCH" && path === "/git/refs/heads/main") { const b = JSON.parse(init.body!); assert.equal(b.force, false); state.head = b.sha; return ok({ object: { sha: b.sha } }); }
    return ok({ message: "Not Found" }, 404);
  };
  return { fetchFn, log };
}

const proposal: Proposal = { id: "prop_1", agent: "pwa-engineer", summary: "Add UV chip", baseCommit: "c1",
  files: [{ path: "src/app/dayCard.ts", action: "update", content: "export const x = 1;\n", baseBlobSha: "b1" }] };

// 1) Happy path: head unchanged.
let gh = fakeGitHub({ head: "c1", blobs: { "src/app/dayCard.ts": "b1" } });
let r = await commitProposal(gh.fetchFn, "o/r", "test-token", proposal);
assert.equal(r.status, "committed");
assert.deepEqual(gh.log, ["GET /git/ref/heads/main", "GET /git/commits/c1", "POST /git/trees", "POST /git/commits", "PATCH /git/refs/heads/main"]);

// 2) main moved but our file untouched: still commits, parented on the new head.
gh = fakeGitHub({ head: "c2", blobs: { "src/app/dayCard.ts": "b1" } });
r = await commitProposal(gh.fetchFn, "o/r", "test-token", proposal);
assert.equal(r.status, "committed");

// 3) main moved AND our file changed: stale, nothing written.
gh = fakeGitHub({ head: "c3", blobs: { "src/app/dayCard.ts": "b9" } });
r = await commitProposal(gh.fetchFn, "o/r", "test-token", proposal);
assert.deepEqual(r, { status: "stale", path: "src/app/dayCard.ts" });
assert.ok(!gh.log.some(l => l.startsWith("POST") || l.startsWith("PATCH")));
console.log("ok: commit-to-main flow verified (happy, moved-but-clean, stale)");
