# `rdf/sort-prefixes`

Require prefix declarations to be sorted alphabetically.

🔧 This rule is automatically fixable by the `--fix` CLI option.

## Rule Details

Sorting prefix declarations alphabetically makes them easier to navigate and maintain.

### Fail

```turtle
PREFIX z: <http://example.org/z#>
PREFIX a: <http://example.org/a#>

ex:s a ex:Thing .
```

### Pass

```turtle
PREFIX a: <http://example.org/a#>
PREFIX z: <http://example.org/z#>

ex:s a ex:Thing .
```

## Options

This rule has no options.
