# `rdf/no-duplicate-prefixes`

Disallow duplicate prefix declarations in RDF documents.

## Rule Details

Declaring the same prefix multiple times causes ambiguity and can lead to unintended IRI expansions.

### Fail

```turtle
PREFIX a: <http://a.org/>
PREFIX a: <http://duplicate.org/>

ex:s a ex:Type .
```

### Pass

```turtle
PREFIX a: <http://a.org/>
PREFIX b: <http://b.org/>

ex:s a ex:Type .
```

## Options

This rule has no options.
