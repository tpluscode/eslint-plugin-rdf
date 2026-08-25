# `rdf/object-per-line`

Enforce placement of objects on separate lines in predicate-object lists.

🔧 This rule is automatically fixable by the `--fix` CLI option.

## Rule Details

When a predicate has multiple objects separated by commas (`,`), this rule can enforce placing each object on a new line.

### Fail

With `mode: "multiline"`:

```turtle
ex:s ex:p :o1, :o2 .
```

### Pass

With `mode: "multiline"`:

```turtle
ex:s ex:p :o1,
    :o2 .
```

With `mode: "as-needed"`:

```turtle
ex:s ex:p :o1, :o2, :o3 .
```

## Options

This rule accepts an optional object:

```json
{
  "rules": {
    "rdf/object-per-line": ["error", {
      "mode": "multiline"
    }]
  }
}
```

- `mode`: (`"multiline"` | `"as-needed"`, default: `"as-needed"`)
  - `"multiline"`: Each object in a comma-separated list must be placed on its own line.
  - `"as-needed"`: Objects may be placed on the same line.
