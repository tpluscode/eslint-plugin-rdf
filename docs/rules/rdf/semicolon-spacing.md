# `rdf/semicolon-spacing`

Enforce spacing before and after semicolons (`;`).

🔧 This rule is automatically fixable by the `--fix` CLI option.

## Rule Details

Enforces consistent spacing before semicolons in predicate-object lists.

### Fail

With `before: "space"` (default):

```turtle
ex:s ex:p ex:o; .
```

With `before: "no-space"`:

```turtle
ex:s ex:p ex:o ; .
```

### Pass

With `before: "space"`:

```turtle
ex:s ex:p ex:o ; .
```

With `before: "no-space"`:

```turtle
ex:s ex:p ex:o; .
```

## Options

This rule accepts an optional object:

```json
{
  "rules": {
    "rdf/semicolon-spacing": ["error", {
      "before": "space"
    }]
  }
}
```

- `before`: (`"space"` | `"no-space"`, default: `"space"`) Space before semicolon.
