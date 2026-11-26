// Example 3: the sync "start job" function hands work to a background function.
// - creates the job (status queued) before invoking, so the worker can check it
// - authenticates the handoff with an internal secret header
// - returns 202 + jobId to the browser, which then polls
// Typechecked against @netlify/functions; the test below runs it with fakes.
import type { Config, Context } from "@netlify/functions";

export type JobStore = { create(id: string, job: object): Promise<boolean> };
export function makeHandler(store: JobStore, env: (k: string) => string | undefined, doFetch: typeof fetch) {
  return async (req: Request, _context: Context): Promise<Response> => {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
    const { agent, message } = await req.json() as { agent?: string; message?: string };
    if (!agent || !message) return Response.json({ error: "agent and message required" }, { status: 400 });
    const jobId = crypto.randomUUID();
    if (!(await store.create(`job:${jobId}`, { agent, status: "queued", messages: [{ role: "user", content: message }] })))
      return Response.json({ error: "conflict" }, { status: 409 });
    const res = await doFetch(new URL("/api/agent/run", req.url), {
      method: "POST", body: JSON.stringify({ jobId }),
      headers: { "content-type": "application/json", "x-internal-secret": env("INTERNAL_JOB_SECRET") ?? "" },
    });
    if (res.status !== 202) return Response.json({ error: "could not start job" }, { status: 502 });
    return Response.json({ jobId }, { status: 202, headers: { "Cache-Control": "no-store" } });
  };
}
// The background worker's own config would be: { path: "/api/agent/run", background: true }
export const config: Config = { path: "/api/agent/jobs", rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ["ip", "domain"] } };
