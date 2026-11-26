// Example 1: the Agent Console's tool loop against the Messages API shape.
// - strict tools with additionalProperties:false
// - ALL tool_results for one assistant turn go back in ONE user message; failures use is_error
// - stop_reason handled before running tools; iteration cap
// Runs offline with a scripted fake client; the real code passes `new Anthropic()`.
// Run: node --experimental-strip-types 01-tool-loop.ts   (typechecks against @anthropic-ai/sdk)
import type Anthropic from "@anthropic-ai/sdk";
import assert from "node:assert/strict";

type MessagesClient = { messages: { create(p: Anthropic.MessageCreateParamsNonStreaming): Promise<Anthropic.Message> } };

export const TOOLS: Anthropic.Tool[] = [
  {
    name: "read_file",
    description: "Reads one text file from the Beach Day repository at the current main branch and returns its contents. Use it before proposing a change to a file so the proposal is based on the real code. Paths are repository-relative, such as src/app/dayCard.ts. It refuses .env files and files over 1 MB.",
    input_schema: { type: "object", properties: { path: { type: "string", description: "Repository-relative file path" } }, required: ["path"], additionalProperties: false },
    strict: true,
  },
  {
    name: "propose_changes",
    description: "Stores a proposed set of file changes for the human lead to review. It never commits; nothing reaches GitHub until the lead clicks Approve. Each file must be inside the allowed paths. Use it once, at the end, with a one-line summary.",
    input_schema: {
      type: "object",
      properties: {
        summary: { type: "string" },
        files: { type: "array", items: { type: "object", properties: {
          path: { type: "string" }, action: { type: "string", enum: ["create", "update", "delete"] }, content: { type: "string" },
        }, required: ["path", "action"], additionalProperties: false } },
      },
      required: ["summary", "files"], additionalProperties: false,
    },
    strict: true,
  },
];

type ToolImpl = (input: Record<string, unknown>) => Promise<string>;

export async function runAgent(client: MessagesClient, system: string, messages: Anthropic.MessageParam[],
  impl: Record<string, ToolImpl>, maxIterations = 12): Promise<{ status: string; text: string; messages: Anthropic.MessageParam[] }> {
  for (let i = 0; i < maxIterations; i++) {
    const msg = await client.messages.create({
      model: "claude-opus-5-5", max_tokens: 16000,
      thinking: { type: "adaptive" }, output_config: { effort: "high" },
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      tools: TOOLS, tool_choice: { type: "auto" }, messages,
    });
    messages.push({ role: "assistant", content: msg.content });           // keep full content, incl. thinking
    const text = msg.content.flatMap(b => (b.type === "text" ? [b.text] : [])).join("");
    if (msg.stop_reason === "refusal") return { status: "refused", text, messages };
    if (msg.stop_reason === "max_tokens") return { status: "error:max_tokens", text, messages };
    if (msg.stop_reason !== "tool_use") return { status: "done", text, messages };
    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const block of msg.content) {
      if (block.type !== "tool_use") continue;
      const fn = impl[block.name];
      try {
        if (!fn) throw new Error(`unknown tool ${block.name}`);
        results.push({ type: "tool_result", tool_use_id: block.id, content: await fn(block.input as Record<string, unknown>) });
      } catch (e) {
        results.push({ type: "tool_result", tool_use_id: block.id, content: String((e as Error).message), is_error: true });
      }
    }
    messages.push({ role: "user", content: results });                    // one message, all results
  }
  return { status: "paused:iteration-cap", text: "", messages };
}

// ---- offline demo with a scripted fake client ----
const usage = { input_tokens: 10, output_tokens: 10, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 } as Anthropic.Usage;
const reply = (content: unknown[], stop_reason: string) =>
  ({ id: "msg_x", type: "message", role: "assistant", model: "claude-opus-5-5", content, stop_reason, stop_sequence: null, usage } as unknown as Anthropic.Message);
const script = [
  reply([{ type: "text", text: "Reading two files." },
    { type: "tool_use", id: "t1", name: "read_file", input: { path: "src/app/dayCard.ts" } },
    { type: "tool_use", id: "t2", name: "read_file", input: { path: ".env" } }], "tool_use"),
  reply([{ type: "tool_use", id: "t3", name: "propose_changes", input: { summary: "Add UV chip", files: [{ path: "src/app/dayCard.ts", action: "update", content: "x" }] } }], "tool_use"),
  reply([{ type: "text", text: "Proposal ready for review." }], "end_turn"),
];
const seen: Anthropic.MessageCreateParamsNonStreaming[] = [];
const fake: MessagesClient = { messages: { create: async (p) => { seen.push(structuredClone(p)); return script.shift()!; } } };
const proposals: unknown[] = [];
const out = await runAgent(fake, "You are pwa-engineer.", [{ role: "user", content: "Add a UV chip to day cards" }], {
  read_file: async ({ path }) => { if (String(path).startsWith(".env")) throw new Error("refused: secret-like path"); return "export {}"; },
  propose_changes: async (input) => { proposals.push(input); return "stored proposal prop_1 (not committed)"; },
});
assert.equal(out.status, "done");
const toolResultMsg = seen[1].messages.at(-1)!;
assert.equal(toolResultMsg.role, "user");
assert.equal((toolResultMsg.content as Anthropic.ToolResultBlockParam[]).length, 2, "both results in one message");
assert.equal((toolResultMsg.content as Anthropic.ToolResultBlockParam[])[1].is_error, true);
assert.equal(proposals.length, 1);
console.log("ok: tool loop —", out.text);
