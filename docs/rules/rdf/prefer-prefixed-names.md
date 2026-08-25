# `rdf/prefer-prefixed-names`

Enforce using prefixed names instead of full URIs when a prefix is available.

🔧 This rule is automatically fixable by the `--fix` CLI option.

## Rule Details

When an IRI matches a declared prefix or a well-known prefix from `@zazuko/prefixes`, this rule enforces using the compact prefixed name (`prefix:localName`) instead of the full `<URI>`. Auto-fix will also declare the prefix if not already declared.

### Fail

```turtle
PREFIX schema: <http://schema.org/>

<http://schema.org/Person> a <http://schema.org/Thing> .
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
    "rdf/prefer-prefixed-names": ["warn", {
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
