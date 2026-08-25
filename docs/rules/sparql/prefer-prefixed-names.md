# `sparql/prefer-prefixed-names`

Enforce using prefixed names instead of full URIs in SPARQL queries.

🔧 This rule is automatically fixable by the `--fix` CLI option.

## Rule Details

When an IRI matches a declared prefix or a well-known prefix from `@zazuko/prefixes`, this rule enforces using the compact prefixed name (`prefix:localName`) instead of the full `<URI>`. Auto-fix will also declare the prefix if not already declared.

### Fail

```sparql
CONSTRUCT WHERE { ?s a <http://schema.org/Person> }
```

### Pass

```sparql
PREFIX schema: <http://schema.org/>

CONSTRUCT WHERE { ?s a schema:Person }
```

## Options

This rule accepts an optional object:

```json
{
  "rules": {
    "sparql/prefer-prefixed-names": ["warn", {
      "prefixes": {
        "custom": "http://example.org/custom#"
      },
      "autoImport": true
    }]
  }
}
```

- `prefixes`: (`object`) Custom mapping of prefix to namespace URI.
- `autoImport`: (`boolean`, default: `true`) Whether to automatically add prefix declarations for matched prefixes.
