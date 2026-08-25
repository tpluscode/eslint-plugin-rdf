# `sparql/known-terms`

Verify that terms from known vocabularies (`@tpluscode/rdf-ns-builders`) actually exist in SPARQL queries.

## Rule Details

This rule validates prefixed names in SPARQL queries and updates against vocabulary definitions from `@tpluscode/rdf-ns-builders` (such as `schema`, `rdf`, `rdfs`, `sh`, `foaf`, `dc`, `skos`, etc.).

### Fail

```sparql
PREFIX schema: <http://schema.org/>

SELECT * WHERE {
    ?s a schema:NotARealTerm .
}
```

### Pass

```sparql
PREFIX schema: <http://schema.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT * WHERE {
    ?s a schema:Person ;
       schema:name ?name ;
       rdf:type ?type ;
       rdf:_1 ?item .
}
```

## Options

This rule accepts an optional object:

```json
{
  "rules": {
    "sparql/known-terms": ["error", {
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
