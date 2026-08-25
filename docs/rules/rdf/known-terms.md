# `rdf/known-terms`

Verify that terms from known vocabularies (`@tpluscode/rdf-ns-builders`) actually exist.

## Rule Details

This rule validates prefixed names against well-known vocabularies bundled with `@tpluscode/rdf-ns-builders` (such as `schema`, `rdf`, `rdfs`, `sh`, `foaf`, `dc`, `skos`, etc.). If a term is not part of the vocabulary definition, an error is reported.

### Fail

```turtle
PREFIX schema: <http://schema.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

schema:InvalidNonExistentTerm a schema:Person .
rdf:invalidRdfTerm rdf:type rdf:Property .
```

### Pass

```turtle
PREFIX schema: <http://schema.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX sh: <http://www.w3.org/ns/shacl#>

schema:Person a rdfs:Class ;
    schema:name "John" ;
    rdf:type schema:Thing ;
    rdf:_1 "First item" ;
    sh:targetClass schema:Person ;
.
```

## Options

This rule accepts an optional object:

```json
{
  "rules": {
    "rdf/known-terms": ["error", {
      "customTerms": {
        "schema": ["CustomUnknown"]
      },
      "ignoredVocabularies": ["myVocab"],
      "ignoredTerms": ["schema:IgnoredProp"]
    }]
  }
}
```

- `customTerms`: (`object`) Map of vocabulary prefix/namespace to an array of additional valid term strings.
- `ignoredVocabularies`: (`string[]`) List of vocabulary prefixes/namespaces to bypass validation for.
- `ignoredTerms`: (`string[]`) List of specific terms or qualified names (`prefix:term`) to ignore.
