# `sparql/no-undeclared-prefixes`

Disallow the use of undeclared prefixes in SPARQL documents.

🔧 This rule is automatically fixable by the `--fix` CLI option (if prefix is known via `@zazuko/prefixes`).

## Rule Details

Referencing a prefix in SPARQL without declaring it via `PREFIX` causes syntax/execution errors. This rule detects undeclared prefixes and auto-fixes by prepending the appropriate `PREFIX` declaration if the namespace is known.

### Fail

```sparql
SELECT * WHERE { ?s a schema:Person }
```

### Pass

```sparql
PREFIX schema: <http://schema.org/>

SELECT * WHERE { ?s a schema:Person }
```

## Options

This rule accepts an optional object:

```json
{
  "rules": {
    "sparql/no-undeclared-prefixes": ["error", {
      "prefixes": {
        "custom": "http://example.org/custom#"
      },
      "autoImport": true
    }]
  }
}
```

- `prefixes`: (`object`) Custom mapping of prefix to namespace URI.
- `autoImport`: (`boolean`, default: `true`) Whether to automatically insert known prefix declarations from `@zazuko/prefixes` or custom prefixes during auto-fix.
