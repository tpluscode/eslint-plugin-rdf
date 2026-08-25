# `rdf/indentation`

Enforce consistent indentation for RDF documents (Turtle, TriG, N3, N-Triples, N-Quads).

🔧 This rule is automatically fixable by the `--fix` CLI option.

## Rule Details

This rule checks indentation across RDF statements, nested blank nodes, graphs, and statement-closing dots. It also ensures blank lines contain no trailing whitespace.

### Fail

```turtle
PREFIX ex: <http://example.org/>

ex:subject
  ex:predicate ex:object ;
.
```

### Pass

```turtle
PREFIX ex: <http://example.org/>

ex:subject
    ex:predicate ex:object ;
.
```

## Options

This rule accepts an optional object:

```json
{
  "rules": {
    "rdf/indentation": ["error", {
      "spaces": 2,
      "dotIndent": "subject"
    }]
  }
}
```

- `spaces`: (`integer`, 1–8, default: `4`) Number of spaces per indentation level.
- `dotIndent`: (`"subject"` | `"predicate"`, default: `"subject"`) Alignment for the standalone closing dot `.`.
  - `"subject"`: The dot is indented to match the statement subject.
  - `"predicate"`: The dot is indented to match the statement predicate.
