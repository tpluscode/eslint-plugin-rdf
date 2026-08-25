# `rdf/no-unused-prefixes`

Disallow unused prefix declarations in RDF documents.

🔧 This rule is automatically fixable by the `--fix` CLI option.

## Rule Details

Unused prefix declarations add noise to RDF files. This rule reports prefixes that are declared but never referenced in the document.

### Fail

```turtle
PREFIX unused: <http://example.org/unused#>
PREFIX ex: <http://example.org/>

ex:subject a ex:Type .
```

### Pass

```turtle
PREFIX ex: <http://example.org/>

ex:subject a ex:Type .
```

## Options

This rule has no options.
