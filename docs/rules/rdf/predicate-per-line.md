# `rdf/predicate-per-line`

Enforce placement of each predicate on a new line.

🔧 This rule is automatically fixable by the `--fix` CLI option.

## Rule Details

In RDF statements with multiple predicate-object pairs separated by semicolons (`;`), each predicate should start on its own line for readability.

### Fail

```turtle
ex:subject ex:predicate1 "value1" ; ex:predicate2 "value2" .
```

### Pass

```turtle
ex:subject
    ex:predicate1 "value1" ;
    ex:predicate2 "value2" ;
.
```

## Options

This rule has no options.
