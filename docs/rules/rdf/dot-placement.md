# `rdf/dot-placement`

Enforce placement of statement closing dot (`.`).

🔧 This rule is automatically fixable by the `--fix` CLI option.

## Rule Details

This rule enforces whether the statement-terminating dot `.` should be placed on its own line (standalone) or at the end of the last statement line (end-of-line).

### Fail

With `style: "standalone"` (default):

```turtle
ex:subject
    ex:predicate ex:object .
```

With `style: "end-of-line"`:

```turtle
ex:subject
    ex:predicate ex:object
.
```

### Pass

With `style: "standalone"`:

```turtle
ex:subject
    ex:predicate ex:object ;
.
```

With `style: "end-of-line"`:

```turtle
ex:subject ex:predicate ex:object .
```

With `style: "standalone"` and `allowSingleLine: true`:

```turtle
ex:subject ex:predicate ex:object .
```

## Options

This rule accepts an optional object:

```json
{
  "rules": {
    "rdf/dot-placement": ["error", {
      "style": "standalone",
      "allowSingleLine": false
    }]
  }
}
```

- `style`: (`"standalone"` | `"end-of-line"`, default: `"standalone"`)
  - `"standalone"`: Statement terminator dot must be on its own line.
  - `"end-of-line"`: Statement terminator dot must follow the last object on the same line (used for N-Triples and N-Quads).
- `allowSingleLine`: (`boolean`, default: `false`) When `style` is `"standalone"`, permits single-line statements to keep the dot on the same line.
