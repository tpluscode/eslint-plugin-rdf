# `sparql/predicate-per-line`

Enforce placement of each predicate on a new line in SPARQL patterns.

🔧 This rule is automatically fixable by the `--fix` CLI option.

## Rule Details

In SPARQL triple patterns with multiple predicate-object pairs separated by semicolons (`;`), each predicate should start on its own line for clarity and readability.

### Fail

```sparql
SELECT * WHERE { ?s a ex:Type ; ex:prop "value" . }
```

### Pass

```sparql
SELECT * WHERE {
    ?s a ex:Type ;
       ex:prop "value" .
}
```

## Options

This rule has no options.
