# `rdf/require-final-dot`

Require a trailing dot (`.`) at the end of RDF statements.

🔧 This rule is automatically fixable by the `--fix` CLI option.

## Rule Details

Ensures that statements end with a terminating dot `.`.

### Fail

```turtle
ex:s ex:p ex:o
```

### Pass

```turtle
ex:s ex:p ex:o .
```

## Options

This rule has no options.
