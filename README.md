# eslint-plugin-rdf

ESLint plugin for RDF/JS projects, RDF data formats (Turtle, TriG, N3, N-Triples, N-Quads), and SPARQL queries/updates.

## Installation

```bash
npm i -D eslint-plugin-rdf
```

This plugin supports ESLint 9+ flat configuration.

## Usage (ESLint Flat Config)

Add `eslint-plugin-rdf` to your `eslint.config.js` or `eslint.config.mjs`.

### Recommended Config (All Languages)

To enable the recommended configurations for JS/TS, RDF formats, and SPARQL queries all at once:

```js
import js from "@eslint/js";
import rdf from "eslint-plugin-rdf";

export default [
  js.configs.recommended,
  ...rdf.configs.recommended,
];
```

### Individual Language Configs

You can also import and use specific configs per language/format:

```js
import js from "@eslint/js";
import rdf from "eslint-plugin-rdf";

export default [
  js.configs.recommended,

  // Enable only JavaScript/TypeScript RDF rules
  rdf.configs.js,

  // Enable only RDF documents (Turtle, TriG, N3, N-Triples, N-Quads)
  rdf.configs.rdf,

  // Enable only SPARQL queries and updates (.rq, .ru, .sparql)
  rdf.configs.sparql,
];
```

### RDF Dialect-Specific Configs

If you want tailored configs for specific RDF dialects:

```js
import rdf from "eslint-plugin-rdf";

export default [
  // Turtle, TriG, and N3 (.ttl, .trig, .n3)
  rdf.configs.turtle,

  // N-Triples (.nt)
  rdf.configs.ntriples,

  // N-Quads (.nq)
  rdf.configs.nquads,
];
```

### TypeScript Projects

```js
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import rdf from "eslint-plugin-rdf";

export default [
  js.configs.recommended,
  ...rdf.configs.recommended,

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ["./tsconfig.json"],
      },
    },
  },
];
```

### CLI

Run ESLint normally (add `--fix` to auto-fix fixable rules):

```bash
npx eslint .
npx eslint . --fix
```

## Configs

| Config | Target Files | Description |
| :--- | :--- | :--- |
| `rdf.configs.recommended` | `*` | Array containing `[rdf.configs.js, rdf.configs.rdf, rdf.configs.sparql]`. |
| `rdf.configs.js` | JS / TS | Recommended rules for JavaScript/TypeScript RDF code (`rdf/ban-rdf-js`). |
| `rdf.configs.rdf` | `**/*.{ttl,trig,n3,nt,nq}` | Recommended rules and custom parser for RDF documents. |
| `rdf.configs.turtle` | `**/*.{ttl,trig,n3}` | Rules tailored for Turtle, TriG, and N3 documents. |
| `rdf.configs.ntriples` | `**/*.nt` | Rules tailored for N-Triples line-based files. |
| `rdf.configs.nquads` | `**/*.nq` | Rules tailored for N-Quads line-based files. |
| `rdf.configs.sparql` | `**/*.{rq,ru,sparql}` | Recommended rules and custom parser for SPARQL queries and updates. |

## Rules

💼 Included in `recommended` config  
🔧 Automatically fixable by `--fix`

### JavaScript / TypeScript Rules

| Rule | Description | 💼 | 🔧 |
| :--- | :--- | :---: | :---: |
| [`rdf/ban-rdf-js`](docs/rules/js/ban-rdf-js.md) | Disallow deprecated `rdf-js` package imports in favor of `@rdfjs/types` | 💼 | 🔧 |

### RDF Rules (`rdf/*`)

Rules for Turtle, TriG, N3, N-Triples, and N-Quads files:

| Rule | Description | 💼 | 🔧 |
| :--- | :--- | :---: | :---: |
| [`rdf/blank-node-wrapping`](docs/rules/rdf/blank-node-wrapping.md) | Enforce formatting and wrapping for blank node property lists (`[...]`) | 💼 | 🔧 |
| [`rdf/dot-placement`](docs/rules/rdf/dot-placement.md) | Enforce placement of statement closing dot (`.`) | 💼 | 🔧 |
| [`rdf/indentation`](docs/rules/rdf/indentation.md) | Enforce consistent indentation in RDF documents | 💼 | 🔧 |
| [`rdf/known-terms`](docs/rules/rdf/known-terms.md) | Verify that terms from known vocabularies actually exist | 💼 | |
| [`rdf/list-wrapping`](docs/rules/rdf/list-wrapping.md) | Enforce formatting and wrapping for RDF collections / lists (`(...)`) | 💼 | 🔧 |
| [`rdf/max-empty-lines`](docs/rules/rdf/max-empty-lines.md) | Enforce a maximum number of consecutive empty lines | 💼 | 🔧 |
| [`rdf/no-duplicate-prefixes`](docs/rules/rdf/no-duplicate-prefixes.md) | Disallow duplicate prefix declarations | 💼 | |
| [`rdf/no-relative-iris`](docs/rules/rdf/no-relative-iris.md) | Disallow relative IRIs in RDF documents | | |
| [`rdf/no-undeclared-prefixes`](docs/rules/rdf/no-undeclared-prefixes.md) | Disallow the use of undeclared prefixes | 💼 | 🔧 |
| [`rdf/no-unused-prefixes`](docs/rules/rdf/no-unused-prefixes.md) | Disallow unused prefix declarations | 💼 | 🔧 |
| [`rdf/object-per-line`](docs/rules/rdf/object-per-line.md) | Enforce placement of objects on separate lines | | 🔧 |
| [`rdf/predicate-per-line`](docs/rules/rdf/predicate-per-line.md) | Enforce placement of each predicate on a new line | 💼 | 🔧 |
| [`rdf/prefer-prefixed-names`](docs/rules/rdf/prefer-prefixed-names.md) | Enforce using prefixed names instead of full URIs | 💼 | 🔧 |
| [`rdf/prefix-declaration-style`](docs/rules/rdf/prefix-declaration-style.md) | Enforce consistent style for prefix declarations (`@prefix` vs `PREFIX`) | 💼 | 🔧 |
| [`rdf/prefix-name-case`](docs/rules/rdf/prefix-name-case.md) | Enforce consistent naming case for prefixes | 💼 | 🔧 |
| [`rdf/require-final-dot`](docs/rules/rdf/require-final-dot.md) | Require a trailing dot (`.`) at the end of RDF statements | 💼 | 🔧 |
| [`rdf/semicolon-spacing`](docs/rules/rdf/semicolon-spacing.md) | Enforce spacing before and after semicolons (`;`) | 💼 | 🔧 |
| [`rdf/sort-prefixes`](docs/rules/rdf/sort-prefixes.md) | Require prefix declarations to be sorted alphabetically | 💼 | 🔧 |
| [`rdf/trailing-semicolon`](docs/rules/rdf/trailing-semicolon.md) | Enforce or disallow a trailing semicolon on statement before `.` | | 🔧 |

### SPARQL Rules (`rdf/sparql-*`)

Rules for SPARQL queries and updates (`.rq`, `.ru`, `.sparql`):

| Rule | Description | 💼 | 🔧 |
| :--- | :--- | :---: | :---: |
| [`rdf/sparql-indentation`](docs/rules/sparql/indentation.md) | Enforce consistent indentation in SPARQL queries and updates | 💼 | 🔧 |
| [`rdf/sparql-keyword-case`](docs/rules/sparql/keyword-case.md) | Enforce consistent casing for SPARQL keywords | 💼 | 🔧 |
| [`rdf/sparql-known-terms`](docs/rules/sparql/known-terms.md) | Verify that terms from known vocabularies actually exist | 💼 | |
| [`rdf/sparql-max-empty-lines`](docs/rules/sparql/max-empty-lines.md) | Enforce a maximum number of consecutive empty lines | 💼 | 🔧 |
| [`rdf/sparql-no-duplicate-prefixes`](docs/rules/sparql/no-duplicate-prefixes.md) | Disallow duplicate prefix declarations | 💼 | |
| [`rdf/sparql-no-undeclared-prefixes`](docs/rules/sparql/no-undeclared-prefixes.md) | Disallow the use of undeclared prefixes | 💼 | 🔧 |
| [`rdf/sparql-no-unused-prefixes`](docs/rules/sparql/no-unused-prefixes.md) | Disallow unused prefix declarations | 💼 | 🔧 |
| [`rdf/sparql-predicate-per-line`](docs/rules/sparql/predicate-per-line.md) | Enforce placement of each predicate on a new line in SPARQL patterns | 💼 | 🔧 |
| [`rdf/sparql-prefer-prefixed-names`](docs/rules/sparql/prefer-prefixed-names.md) | Enforce using prefixed names instead of full URIs | 💼 | 🔧 |
| [`rdf/sparql-prefix-name-case`](docs/rules/sparql/prefix-name-case.md) | Enforce consistent naming case for prefixes | 💼 | 🔧 |
| [`rdf/sparql-semicolon-spacing`](docs/rules/sparql/semicolon-spacing.md) | Enforce spacing before semicolons (`;`) | 💼 | 🔧 |
| [`rdf/sparql-sort-prefixes`](docs/rules/sparql/sort-prefixes.md) | Require prefix declarations to be sorted alphabetically | 💼 | 🔧 |
