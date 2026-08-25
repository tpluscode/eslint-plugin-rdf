# `rdf/no-relative-iris`

Disallow relative IRIs in RDF documents.

## Rule Details

Relative IRIs can lead to resolution ambiguities when the document base URI changes or is not explicitly set.

### Fail

```turtle
</api/Prefix> a <http://example.org/Thing> .
```

### Pass

```turtle
<http://example.org/api/Prefix> a <http://example.org/Thing> .
ex:prefix a ex:Thing .
<> a <http://example.org/Api> .
<#fragment> a <http://example.org/Thing> .
```

## Options

This rule accepts an optional object:

```json
{
  "rules": {
    "rdf/no-relative-iris": ["error", {
      "allowEmpty": true,
      "allowFragments": true
    }]
  }
}
```

- `allowEmpty`: (`boolean`, default: `true`) Allow the empty relative IRI `<>` (often used to refer to current document).
- `allowFragments`: (`boolean`, default: `true`) Allow relative fragment IRIs like `<#foo>`.
