# `rdf/trailing-semicolon`

Enforce or disallow a trailing semicolon (`;`) on the last predicate-object pair of a statement.

🔧 This rule is automatically fixable by the `--fix` CLI option.

## Rule Details

In Turtle/TriG, a statement ending with a standalone dot can optionally include a trailing semicolon after the final predicate-object pair before the `.`.

### Fail

With `mode: "require"`:

```turtle
ex:s ex:p ex:o .
```

With `mode: "disallow"`:

```turtle
ex:s ex:p ex:o ; .
```

### Pass

With `mode: "require"`:

```turtle
ex:s ex:p ex:o ; .
```

With `mode: "disallow"`:

```turtle
ex:s ex:p ex:o .
```

## Options

This rule accepts an optional object:

```json
{
  "rules": {
    "rdf/trailing-semicolon": ["error", {
      "mode": "require"
    }]
  }
}
```

- `mode`: (`"require"` | `"disallow"`, default: `"require"`) Whether to require or disallow the trailing semicolon before the final `.`.
