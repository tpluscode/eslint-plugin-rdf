# eslint-plugin-rdf

Linting rules for RDF/JS projects.

## Installation

```bash
npm i -D eslint-plugin-rdf
```

This plugin ships a flat-config `recommended` preset compatible with ESLint 9 and 10.

Peer dependencies you’ll typically have in your app/project:
- `eslint` (v9 or v10)
- `@eslint/js` (v9 or v10)
- `@typescript-eslint/parser` (if you lint TypeScript)

## Usage (ESLint 9+ flat config)

Create or edit `eslint.config.js` in your project and compose the plugin’s flat config.

### TypeScript projects (type-aware)

```js
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import rdf from "eslint-plugin-rdf";

export default [
  { 
    files: ["**/*.{js,mjs,ts}"], 
    ...js.configs.recommended, 
    ...rdf.configs.recommended
  },

  // TypeScript parser/project options for TS/TSX files
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        // Anchor the tsconfig to this file location for reliable editor resolution
        tsconfigRootDir: import.meta.dirname,
        project: ["./tsconfig.json"],
        // Recommended for editors with @typescript-eslint v8+
        projectService: true,
      },
    },
  },
];
```

### Enabling a rule without the preset

If you prefer not to use the preset, import the plugin and enable rules directly:

```js
import rdf from "eslint-plugin-rdf";

export default [
  {
    plugins: { rdf },
    rules: {
      "rdf/ban-rdf-js": "error",
    },
  },
];
```

### CLI

Run ESLint normally (add `--fix` to auto-fix):

```bash
npx eslint . --ext .ts
npx eslint . --ext .ts --fix
```

## Rules

### `rdf/ban-rdf-js`

🔧 This rule is automatically fixable by the [`--fix` CLI option][fix].

The `rdf-js` package is deprecated. Its usages should be replaced with `@rdfjs/types`.

#### Fail

```ts
import { DataFactory } from 'rdf-js'
import type { NamedNode } from 'rdf-js'
import * as RDF from 'rdf-js'
```

#### Pass

```ts
import { DataFactory } from '@rdfjs/types'
import type { NamedNode } from '@rdfjs/types'
import * as RDF from '@rdfjs/types'
```

#### Options

This rule has no options.

[fix]: https://eslint.org/docs/latest/user-guide/command-line-interface#--fix
