# `rdf/no-undeclared-prefixes`

Disallow the use of undeclared prefixes in RDF documents.

🔧 This rule is automatically fixable by the `--fix` CLI option (if prefix is known via `@zazuko/prefixes`).

## Rule Details

Using prefixed names without declaring the corresponding `PREFIX` or `@prefix` directive causes syntax errors or invalid RDF. This rule detects undeclared prefixes and automatically inserts the standard prefix declaration if the prefix is known.

### Fail

```turtle
schema:Person a schema:Thing .
```

### Pass

```turtle
PREFIX schema: <http://schema.org/>

schema:Person a schema:Thing .
```

## Options

This rule accepts an optional object:

```json
{
  "rules": {
    "rdf/no-undeclared-prefixes": ["error", {
      "prefixes": {
        "myCustom": "http://example.org/custom#"
      },
      "autoImport": true
    }]
  }
}
```

- `prefixes`: (`object`) Custom mapping of prefix to namespace URI for auto-fixing.
- `autoImport`: (`boolean`, default: `true`) Whether to automatically insert known prefix declarations from `@zazuko/prefixes` or custom prefixes during auto-fix.
