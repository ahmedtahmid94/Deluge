#!/usr/bin/env bash
# Re-runs every knowledge example that needs no npm install (Node 22+ with --experimental-strip-types).
# Browser examples need Playwright with Chromium; set SKIP_BROWSER=1 to skip them.
# Examples that need extra packages (@axe-core/playwright, @netlify/blobs, vitest, @playwright/test) are
# listed at the end with the command to run them.
set -u
cd "$(dirname "$0")"
pass=0; fail=0
run() { local dir=$1; shift; echo "== $dir: $*"; if (cd "$dir" && "$@" >/tmp/knowledge-verify.log 2>&1); then tail -1 /tmp/knowledge-verify.log; pass=$((pass+1)); else cat /tmp/knowledge-verify.log; echo "FAILED"; fail=$((fail+1)); fi; }
TS="node --experimental-strip-types --no-warnings"
run open-meteo-integrator/examples $TS 01-build-requests.ts
run open-meteo-integrator/examples $TS 02-parse-and-merge.ts
run open-meteo-integrator/examples $TS 03-fetch-with-fallback.ts
run beach-conditions-analyst/examples $TS 01-worked-example.test.ts
run beach-conditions-analyst/examples $TS 02-score-live-fixture.ts
run pwa-engineer/examples/01-manifest $TS check-manifest.ts manifest.webmanifest
run agent-console-engineer/examples $TS 01-tool-loop.ts
run agent-console-engineer/examples $TS 02-commit-to-main.ts
run agent-console-engineer/examples $TS 03-job-idempotency.ts
run security-engineer/examples $TS 01-password-hash.ts
run security-engineer/examples $TS 02-path-allowlist.ts
run security-engineer/examples $TS 03-session-csrf.ts
run netlify-engineer/examples $TS 01-forecast-function.test.mts
run netlify-engineer/examples $TS 03-agent-start.test.mts
run software-architect/examples $TS 01-contracts.ts
run software-architect/examples $TS 02-boundary-check.ts
run accessibility-specialist/examples $TS 01-contrast-on-glass.ts
run ui-designer-apple-liquid-glass/examples $TS 02-token-contrast.ts
run ux-designer-apple-hig/examples $TS 04-lint-copy.ts 03-copy-deck.json
run orchestrator/examples $TS 03-handoff-parser.ts
run .. $TS knowledge/meta-agent/examples/01-team-sync-check.ts
if [ "${SKIP_BROWSER:-0}" != "1" ]; then
  run pwa-engineer/examples/02-service-worker node test.mjs
  run pwa-engineer/examples/03-install-ui node test.mjs
  run ui-designer-apple-liquid-glass/examples/01-glass-tokens node verify.mjs
fi
echo
echo "passed: $pass  failed: $fail"
cat <<'MORE'
Needs extra packages (install them in a scratch directory, copy the example there, then run it):
  accessibility-specialist/examples/02-axe-and-dialog.mjs   npm i @axe-core/playwright  -> node 02-axe-and-dialog.mjs
  netlify-engineer/examples/02-blobs-local.mjs               npm i @netlify/blobs        -> node 02-blobs-local.mjs
  qa-engineer/examples/01-vitest-uv-and-scoring.test.ts      npm i vitest                -> npx vitest run 01-vitest-uv-and-scoring.test.ts
  qa-engineer/examples/02-playwright-forecast.spec.ts        npm i @playwright/test      -> npx playwright test --config playwright.config.ts --trace off
MORE
[ "$fail" -eq 0 ]
