# `sparql/prefix-name-case`

Enforce consistent naming case for prefixes in SPARQL queries and updates.

🔧 This rule is automatically fixable by the `--fix` CLI option.

## Rule Details

Enforces naming conventions (such as `camelCase`, `lower`, or `upper`) on prefix names in declarations and usages.

### Fail

With `case: "camelCase"` (default):

```sparql
PREFIX PrefixServer: <http://example.org/>

SELECT * WHERE { ?s a PrefixServer:Type ; PrefixServer:prop ?o }
```

### Pass

With `case: "camelCase"`:

```sparql
PREFIX prefixServer: <http://example.org/>

SELECT * WHERE { ?s a prefixServer:Type ; prefixServer:prop ?o }
```

## Options

This rule accepts an optional object:

```json
{
  "rules": {
    "sparql/prefix-name-case": ["warn", {
      "case": "camelCase"
    }]
  }
}
```

- `case`: (`"camelCase"` | `"lower"` | `"upper"`, default: `"camelCase"`) Target casing for prefix names.
