# `sparql/semicolon-spacing`

Enforce spacing before semicolons (`;`) in SPARQL patterns.

🔧 This rule is automatically fixable by the `--fix` CLI option.

## Rule Details

Enforces consistent spacing before semicolons in SPARQL predicate-object patterns.

### Fail

With `before: "space"` (default):

```sparql
SELECT * WHERE {
    ?s a ex:Type;
       ex:name "Test" .
}
```

### Pass

With `before: "space"`:

```sparql
SELECT * WHERE {
    ?s a ex:Type ;
       ex:name "Test" .
}
```

## Options

This rule accepts an optional object:

```json
{
  "rules": {
    "sparql/semicolon-spacing": ["error", {
      "before": "space"
    }]
  }
}
```

- `before`: (`"space"` | `"no-space"`, default: `"space"`) Space before semicolon.
