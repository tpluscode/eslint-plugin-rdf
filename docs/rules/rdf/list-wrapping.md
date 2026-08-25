# `rdf/list-wrapping`

Enforce formatting and wrapping for RDF collections / lists (`(...)`).

🔧 This rule is automatically fixable by the `--fix` CLI option.

## Rule Details

This rule enforces consistent formatting and line wrapping of RDF lists/collections (`(...)`).

### Fail

```turtle
ex:subject ex:predicate (
    :a :b
    :c
) .
```

### Pass

```turtle
# Single line list
ex:subject ex:predicate ( :a :b :c ) .

# Multiline list
ex:subject
    ex:predicate (
        :a
        :b
        :c
    ) ;
.
```

## Options

This rule accepts an optional object:

```json
{
  "rules": {
    "rdf/list-wrapping": ["error", {
      "multiline": "as-needed",
      "maxItems": 4,
      "maxLineLength": 80
    }]
  }
}
```

- `multiline`: (`"as-needed"` | `"always"` | `"never"`, default: `"as-needed"`)
  - `"as-needed"`: Lists are multiline if they exceed `maxItems` or `maxLineLength`.
  - `"always"`: Non-empty lists must always span multiple lines.
  - `"never"`: Lists must stay on a single line.
- `maxItems`: (`number`, default: `3`) Maximum number of items in a single-line list before wrapping is required.
- `maxLineLength`: (`number`, default: `80`) Maximum length of a line with a list before multiline formatting is required.
