# `sparql/keyword-case`

Enforce consistent casing for SPARQL keywords.

🔧 This rule is automatically fixable by the `--fix` CLI option.

## Rule Details

SPARQL keywords (like `SELECT`, `WHERE`, `CONSTRUCT`, `ASK`, `DESCRIBE`, `PREFIX`, `BASE`, `FILTER`, `OPTIONAL`, `UNION`, `GRAPH`, `BIND`, `AS`, `DISTINCT`, `REDUCED`, `FROM`, `NAMED`, `ORDER`, `BY`, `ASC`, `DESC`, `LIMIT`, `OFFSET`, `VALUES`, `INSERT`, `DELETE`, `DATA`, `WITH`, `CLEAR`, `DROP`, `CREATE`, `LOAD`, `INTO`, `SILENT`, `DEFAULT`, `ALL`, `USING`, etc.) can be written in upper or lower case. This rule enforces consistent casing.

### Fail

With `case: "upper"` (default):

```sparql
select ?s ?p ?o where { ?s ?p ?o }
```

```sparql
BIND (sparqlc:param("x") as ?x)
```

### Pass

With `case: "upper"`:

```sparql
SELECT ?s ?p ?o WHERE { ?s ?p ?o }
```

```sparql
BIND (sparqlc:param("x") AS ?x)
```

With `case: "lower"`:

```sparql
select ?s ?p ?o where { ?s ?p ?o }
```

## Options

This rule accepts an optional object:

```json
{
  "rules": {
    "sparql/keyword-case": ["warn", {
      "case": "upper"
    }]
  }
}
```

- `case`: (`"upper"` | `"lower"`, default: `"upper"`) Enforce uppercase or lowercase for SPARQL keywords.
