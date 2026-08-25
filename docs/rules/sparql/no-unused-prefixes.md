# `rdf/sparql-no-unused-prefixes`

Disallow unused prefix declarations in SPARQL documents.

🔧 This rule is automatically fixable by the `--fix` CLI option.

## Rule Details

Unused prefix declarations add noise to SPARQL queries and updates.

### Fail

```sparql
PREFIX unused: <http://example.org/unused#>
PREFIX ex: <http://example.org/>

SELECT ?s WHERE { ?s a ex:Type }
```

### Pass

```sparql
PREFIX ex: <http://example.org/>

SELECT ?s WHERE { ?s a ex:Type }
```

## Options

This rule has no options.
