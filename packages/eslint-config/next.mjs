import { FlatCompat } from "@eslint/eslintrc";

/**
 * Shared ESLint config for both Next apps.
 *
 * One file rather than a copy per app: admin and student are the same kind of
 * thing, and two configs drift the moment someone silences a rule in one of
 * them. Consumed as `@unitrack/eslint-config/next`.
 *
 * `eslint-config-next` is still published as an eslintrc-style config, so it is
 * bridged into flat config with FlatCompat. That is the same approach
 * `create-next-app` generates on Next 15.
 */
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [
  // Build output and dependencies. Linting generated code produces noise that
  // nobody can act on, and `next/dist` alone is thousands of files.
  {
    ignores: [
      "**/.next/**",
      "**/node_modules/**",
      "**/out/**",
      "**/next-env.d.ts",
      // Generated from the backend's openapi.json — regenerated, never edited.
      "**/src/schema.d.ts",
    ],
  },

  // core-web-vitals adds the accessibility and performance rules on top of the
  // base React/hooks set; `next/typescript` wires up the TS parser.
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    rules: {
      // An unused variable is usually a half-finished edit. Warn rather than
      // error so it never blocks a build, but allow the `_`-prefix convention
      // for deliberately-ignored bindings (destructuring, catch params).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];
