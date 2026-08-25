# `rdf/sparql-indentation`

Enforce consistent indentation in SPARQL queries and updates.

🔧 This rule is automatically fixable by the `--fix` CLI option.

## Rule Details

This rule enforces consistent indentation inside SPARQL query blocks, `WHERE`, `SELECT`, `CONSTRUCT`, `INSERT`, `DELETE`, and graph patterns.

### Fail

```sparql
SELECT ?s ?p ?o
WHERE {
  ?s ?p ?o .
}
```

### Pass

With `{ spaces: 4 }`:

```sparql
PREFIX ex: <http://example.org/>

SELECT ?s ?p ?o
WHERE {
    ?s ?p ?o .
}
```

## Options

This rule accepts an optional object:

```json
{
  "rules": {
    "rdf/sparql-indentation": ["error", {
      "spaces": 4
    }]
  }
}
```

- `spaces`: (`integer`, 1–8, default: `4`) Number of spaces per indentation level.
