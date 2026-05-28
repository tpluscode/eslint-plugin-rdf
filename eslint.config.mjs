import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import rdf from "./index.js";

// Flat config: compose recommended configs directly, no FlatCompat/extends.
export default [
  // Global linter options
  {
    linterOptions: {
      // Fail on unused eslint-disable comments (works in v9 and v10)
      reportUnusedDisableDirectives: "error",
    },
  },

  // Apply recommended configs separately (they are arrays in flat config)
  // Note: spreading them into a single object breaks because arrays become numeric keys ("0", "1", ...)
  js.configs.recommended,
  rdf.configs.recommended,

  // TS parser/project settings for matched files
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  },
];
