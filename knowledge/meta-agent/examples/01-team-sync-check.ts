// Example 1: the meta-agent's team consistency check, run against THIS repository.
// Checks (from the Claude Code docs + CLAUDE.md rules):
//  - every agent file starts with '---', has name + description, valid name, known model
//  - every skills: entry exists in .claude/skills/, <= 32 per agent, none has disable-model-invocation
//  - only the orchestrator has the Agent tool, and its Agent(...) list equals all other agents
//  - each agent's skills match the wiring table in docs/expert-roster.md (section 5)
//  - each agent has a knowledge/<name>/ folder with docs/ and examples/, and a "Before you answer" section
// Run from the repo root: node --experimental-strip-types knowledge/meta-agent/examples/01-team-sync-check.ts
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";
type FM = Record<string, string | string[]>;
function frontmatter(text: string): FM | null {           // minimal parser for our flat frontmatter
  if (!text.startsWith("---\n")) return null;
  const end = text.indexOf("\n---", 4); if (end < 0) return null;
  const fm: FM = {}; let listKey: string | null = null;
  for (const line of text.slice(4, end).split("\n")) {
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && listKey) { (fm[listKey] as string[]).push(item[1].trim()); continue; }
    const kv = line.match(/^([A-Za-z-]+):\s*(.*)$/);
    if (!kv) continue;
    listKey = null;
    if (kv[2] === "") { fm[kv[1]] = []; listKey = kv[1]; } else fm[kv[1]] = kv[2].replace(/^"(.*)"$/, "$1");
  }
  return fm;
}
const errors: string[] = [];
const agentsDir = join(root, ".claude/agents"), skillsDir = join(root, ".claude/skills");
const skills = new Set(readdirSync(skillsDir));
for (const s of skills) {
  const fm = frontmatter(readFileSync(join(skillsDir, s, "SKILL.md"), "utf8"));
  if (!fm?.description) errors.push(`skill ${s}: missing frontmatter/description`);
  if (fm?.["disable-model-invocation"] === "true") errors.push(`skill ${s}: disable-model-invocation blocks preloading`);
  if (String(fm?.description ?? "").length > 1536) errors.push(`skill ${s}: description over 1,536 chars`);
}
const agents = readdirSync(agentsDir).filter(f => f.endsWith(".md"));
const names = new Map<string, FM>();
for (const f of agents) {
  const text = readFileSync(join(agentsDir, f), "utf8"); const fm = frontmatter(text);
  if (!fm) { errors.push(`${f}: no frontmatter on line 1`); continue; }
  const name = String(fm.name ?? "");
  if (!/^[a-z0-9-]{1,256}$/.test(name)) errors.push(`${f}: bad name ${name}`);
  if (!fm.description) errors.push(`${f}: missing description`);
  if (!["opus", "sonnet", "haiku", "fable", "inherit"].includes(String(fm.model)) && !/^claude-/.test(String(fm.model))) errors.push(`${f}: unknown model ${fm.model}`);
  const sk = (fm.skills as string[]) ?? [];
  if (sk.length > 32) errors.push(`${name}: ${sk.length} skills (max 32 preloaded)`);
  for (const s of sk) if (!skills.has(s)) errors.push(`${name}: skill ${s} not found`);
  const hasAgentTool = /(^|,\s*)Agent(\(|,|$)/.test(String(fm.tools));
  if (hasAgentTool !== (name === "orchestrator")) errors.push(`${name}: Agent tool only allowed on orchestrator`);
  if (!/^## Before you answer$/m.test(text)) errors.push(`${name}: missing "## Before you answer" section`);
  for (const sub of ["docs", "examples"]) if (!existsSync(join(root, "knowledge", name, sub))) errors.push(`${name}: knowledge/${name}/${sub} missing`);
  names.set(name, fm);
}
const orch = String(names.get("orchestrator")?.tools ?? "");
const listed = (orch.match(/Agent\(([^)]*)\)/)?.[1] ?? "").split(",").map(s => s.trim()).filter(Boolean).sort();
const others = [...names.keys()].filter(n => n !== "orchestrator").sort();
if (JSON.stringify(listed) !== JSON.stringify(others)) errors.push(`orchestrator Agent(...) list ${listed} != agents ${others}`);
// Roster wiring table: "| `agent` | `skill`, `skill` |"
const roster = readFileSync(join(root, "docs/expert-roster.md"), "utf8");
const wiring = roster.slice(roster.indexOf("### Agent wiring"));
for (const m of wiring.matchAll(/^\| `([a-z0-9-]+)` \| (.*) \|$/gm)) {
  const want = [...m[2].matchAll(/`([a-z0-9-]+)`/g)].map(x => x[1]);
  const have = (names.get(m[1])?.skills as string[]) ?? [];
  if (JSON.stringify(want) !== JSON.stringify(have)) errors.push(`${m[1]}: skills differ from docs/expert-roster.md`);
}
errors.forEach(e => console.log("FAIL", e));
console.log(errors.length ? `${errors.length} problem(s)` : `ok: ${names.size} agents and ${skills.size} skills are consistent`);
process.exit(errors.length ? 1 : 0);
