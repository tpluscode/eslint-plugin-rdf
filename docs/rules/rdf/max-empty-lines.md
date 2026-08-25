# `rdf/max-empty-lines`

Enforce a maximum number of consecutive empty lines in RDF documents.

🔧 This rule is automatically fixable by the `--fix` CLI option.

## Rule Details

This rule restricts consecutive empty lines within RDF files and at the beginning/end of files.

### Fail

```turtle
ex:s1 ex:p1 ex:o1 .



ex:s2 ex:p2 ex:o2 .
```

### Pass

```turtle
ex:s1 ex:p1 ex:o1 .

ex:s2 ex:p2 ex:o2 .
```

## Options

This rule accepts an optional object:

```json
{
  "rules": {
    "rdf/max-empty-lines": ["error", {
      "max": 1,
      "maxEOF": 0,
      "maxBOF": 0
    }]
  }
}
```

- `max`: (`integer`, >= 0, default: `1`) Maximum consecutive empty lines permitted inside the document.
- `maxEOF`: (`integer`, >= 0, default: `0`) Maximum empty lines permitted at the end of the file.
- `maxBOF`: (`integer`, >= 0, default: `0`) Maximum empty lines permitted at the beginning of the file.
