# TypeScript strictness

Source: TSConfig reference, `strict`: https://www.typescriptlang.org/tsconfig/#strict (retrieved 2026-11-26)

- Quoted: "The strict flag enables a wide range of type checking behavior that results in stronger guarantees of program correctness. Turning this on is equivalent to enabling all of the strict mode family options".
- The family: `alwaysStrict`, `strictNullChecks`, `strictBindCallApply`, `strictBuiltinIteratorReturn`, `strictFunctionTypes`, `strictPropertyInitialization`, `noImplicitAny`, `noImplicitThis`, `useUnknownInCatchVariables`.
- "Future versions of TypeScript may introduce additional stricter checking under this flag, so upgrades of TypeScript might result in new type errors". Pin the TypeScript version and upgrade deliberately.

## Beach Day `tsconfig` (recommended)

- `strict: true`, plus `noUncheckedIndexedAccess: true`. Hourly arrays index by position, so a missing hour must be typed `T | undefined`.
- `exactOptionalPropertyTypes: true`, so optional fields can't be set to `undefined` by mistake.
- `module` and `moduleResolution` set to `"Bundler"` for Vite, and `"NodeNext"` for function typechecks.
- `verbatimModuleSyntax: true`, so `import type` stays explicit. Node's `--experimental-strip-types` and esbuild both depend on that.
- Tests typecheck with the same config (`tsc --noEmit` in CI).

The contract example in `../examples/01-contracts.ts` passes `tsc --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes`.
