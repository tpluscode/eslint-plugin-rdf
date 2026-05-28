import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import rdf from "./index.js";

// Flat config: compose recommended configs directly, no FlatCompat/extends.
export default [
  // ESLint's recommended base rules (only for JS files)
  { files: ["**/*.{js,cjs,mjs}"], ...js.configs.recommended },

  // Apply this plugin's recommended rules to TS files only
  { files: ["**/*.ts"], ...rdf.configs.recommended[0] },

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
