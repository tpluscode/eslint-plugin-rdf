# `sparql/sort-prefixes`

Require prefix declarations to be sorted alphabetically in SPARQL documents.

🔧 This rule is automatically fixable by the `--fix` CLI option.

## Rule Details

Sorting prefix declarations alphabetically makes queries cleaner and easier to maintain.

### Fail

```sparql
PREFIX z: <http://example.org/z#>
PREFIX a: <http://example.org/a#>

SELECT * WHERE { ?s ?p ?o }
```

### Pass

```sparql
PREFIX a: <http://example.org/a#>
PREFIX z: <http://example.org/z#>

SELECT * WHERE { ?s ?p ?o }
```

## Options

This rule has no options.
