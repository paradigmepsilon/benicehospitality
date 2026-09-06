import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Nested sub-projects with their own toolchains and build output. Both
    // are excluded from tsconfig.json for the same reason; the-hosts-edge is
    // gitignored entirely, and its .next/ output is not source.
    "the-hosts-edge/**",
    "nice-courses/**",
    "**/.next/**",
  ]),
]);

export default eslintConfig;
