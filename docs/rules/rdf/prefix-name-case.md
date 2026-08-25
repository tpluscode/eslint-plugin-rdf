# `rdf/prefix-name-case`

Enforce consistent naming case for prefixes.

🔧 This rule is automatically fixable by the `--fix` CLI option.

## Rule Details

Enforces naming conventions (such as `camelCase`, `lower`, or `upper`) on prefix names in declarations and usages.

### Fail

With `case: "camelCase"` (default):

```turtle
PREFIX PrefixServer: <http://example.org/>

PrefixServer:s PrefixServer:p PrefixServer:o .
```

### Pass

With `case: "camelCase"`:

```turtle
PREFIX prefixServer: <http://example.org/>

prefixServer:s prefixServer:p prefixServer:o .
```

## Options

This rule accepts an optional object:

```json
{
  "rules": {
    "rdf/prefix-name-case": ["warn", {
      "case": "camelCase"
    }]
  }
}
```

- `case`: (`"camelCase"` | `"lower"` | `"upper"`, default: `"camelCase"`) Target casing for prefix names.
