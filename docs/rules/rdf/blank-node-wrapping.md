# `rdf/blank-node-wrapping`

Enforce formatting and wrapping for RDF blank node property lists (`[...]`).

🔧 This rule is automatically fixable by the `--fix` CLI option.

## Rule Details

This rule ensures that blank nodes in Turtle, TriG, and N3 documents follow consistent line wrapping and bracket placement. When blank nodes span multiple lines, each property and the closing bracket should be placed on separate lines.

### Fail

```turtle
ex:subject
    ex:predicate [
        a ex:Thing ;
        ex:name "Value" ] ;
.

ex:subject
    ex:predicate [ a ex:Thing ;
        ex:name "Value" ;
    ] ;
.
```

### Pass

```turtle
# Single-line blank node
ex:subject ex:predicate [ a ex:Thing ; ex:name "Value" ] .

# Multi-line blank node
ex:subject
    ex:predicate [
        a ex:Thing ;
        ex:name "Value" ;
    ] ;
.
```

## Options

This rule accepts an optional object:

```json
{
  "rules": {
    "rdf/blank-node-wrapping": ["error", {
      "multiline": "as-needed",
      "propertiesOnNewline": true,
      "closeBracketOnNewline": true
    }]
  }
}
```

- `multiline`: Controls whether blank nodes should be multiline.
  - `"as-needed"` (default): Single-line blank nodes are allowed if they fit on one line.
  - `"always"`: Blank nodes must always be formatted across multiple lines.
  - `"never"`: Blank nodes must always be on a single line.
- `propertiesOnNewline`: (`boolean`, default: `true`) Requires properties inside multiline blank nodes to be on separate lines.
- `closeBracketOnNewline`: (`boolean`, default: `true`) Requires the closing bracket `]` of a multiline blank node to be on its own line.
