# `sparql/no-duplicate-prefixes`

Disallow duplicate prefix declarations in SPARQL documents.

## Rule Details

Declaring the same prefix multiple times in a SPARQL query or update causes ambiguity or parse errors.

### Fail

```sparql
PREFIX ex: <http://example.org/1#>
PREFIX ex: <http://example.org/2#>

SELECT * WHERE { ?s ?p ?o }
```

### Pass

```sparql
PREFIX ex: <http://example.org/1#>
PREFIX other: <http://example.org/2#>

SELECT * WHERE { ?s ?p ?o }
```

## Options

This rule has no options.
