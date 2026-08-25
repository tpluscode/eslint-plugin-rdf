# `rdf/sparql-max-empty-lines`

Enforce a maximum number of consecutive empty lines in SPARQL documents.

🔧 This rule is automatically fixable by the `--fix` CLI option.

## Rule Details

This rule restricts consecutive empty lines within SPARQL queries/updates.

### Fail

```sparql
PREFIX ex: <http://example.org/>



SELECT * WHERE { ?s ?p ?o }
```

### Pass

```sparql
PREFIX ex: <http://example.org/>

SELECT * WHERE { ?s ?p ?o }
```

## Options

This rule accepts an optional object:

```json
{
  "rules": {
    "rdf/sparql-max-empty-lines": ["error", {
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
