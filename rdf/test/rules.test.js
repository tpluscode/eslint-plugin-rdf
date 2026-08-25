import { describe } from 'node:test'
import { RuleTester } from 'eslint'
import parser from '../parser.js'
import blankNodeWrapping from '../rules/blank-node-wrapping.js'
import dotPlacement from '../rules/dot-placement.js'
import indentation from '../rules/indentation.js'
import listWrapping from '../rules/list-wrapping.js'
import maxEmptyLines from '../rules/max-empty-lines.js'
import noDuplicatePrefixes from '../rules/no-duplicate-prefixes.js'
import noRelativeIris from '../rules/no-relative-iris.js'
import noUnusedPrefixes from '../rules/no-unused-prefixes.js'
import objectPerLine from '../rules/object-per-line.js'
import predicatePerLine from '../rules/predicate-per-line.js'
import prefixDeclarationStyle from '../rules/prefix-declaration-style.js'
import prefixNameCase from '../rules/prefix-name-case.js'
import requireFinalDot from '../rules/require-final-dot.js'
import semicolonSpacing from '../rules/semicolon-spacing.js'
import sortPrefixes from '../rules/sort-prefixes.js'
import trailingSemicolon from '../rules/trailing-semicolon.js'
import knownTerms from '../rules/known-terms.js'
import preferPrefixedNames from '../rules/prefer-prefixed-names.js'
import noUndeclaredPrefixes from '../rules/no-undeclared-prefixes.js'

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
  },
})

describe('RDF stylistic rules', () => {
  describe('rdf/indentation', () => {
    ruleTester.run('indentation', indentation, {
      valid: [
        {
          code: `PREFIX ex: <http://example.org/>

ex:subject
    ex:predicate ex:object ;
.
`,
        },
        {
          code: `PREFIX ex: <http://example.org/>

ex:subject
    ex:predicate [
        a ex:Nested ;
        ex:name "Test" ;
    ] ;
.
`,
        },
        {
          code: `PREFIX prefixServer: <https://prefix.zazuko.com/schema/>

CONSTRUCT WHERE {
  ?prefix a prefixServer:Prefix .
}`,
          options: [{ spaces: 2 }],
        },
        {
          code: `PREFIX ex: <http://example.org/>

INSERT {
  GRAPH ?id {
    ?id a ex:Vocab ;
      ex:prefix ?prefix ;
  }
}
WHERE {
  BIND (IRI(?prefix) AS ?id)
}`,
          options: [{ spaces: 2 }],
        },
      ],
      invalid: [
        {
          code: `PREFIX ex: <http://example.org/>

ex:subject
  ex:predicate ex:object ;
.
`,
          errors: [{ messageId: 'wrongIndentation' }],
          output: `PREFIX ex: <http://example.org/>

ex:subject
    ex:predicate ex:object ;
.
`,
        },
      ],
    })
  })

  describe('rdf/blank-node-wrapping', () => {
    ruleTester.run('blank-node-wrapping', blankNodeWrapping, {
      valid: [
        {
          code: `ex:subject ex:predicate [ a ex:Thing ; ex:name "Value" ] .`,
        },
        {
          code: `ex:subject
    ex:predicate [
        a ex:Thing ;
        ex:name "Value" ;
    ] ;
.`,
        },
      ],
      invalid: [
        {
          code: `ex:subject
    ex:predicate [
        a ex:Thing ;
        ex:name "Value" ] ;
.`,
          errors: [{ messageId: 'closeBracketNewline' }],
          output: `ex:subject
    ex:predicate [
        a ex:Thing ;
        ex:name "Value" 
] ;
.`,
        },
        {
          code: `ex:subject
    ex:predicate [ a ex:Thing ;
        ex:name "Value" ;
    ] ;
.`,
          errors: [{ messageId: 'firstPropertyNewline' }],
          output: `ex:subject
    ex:predicate [ 
a ex:Thing ;
        ex:name "Value" ;
    ] ;
.`,
        },
      ],
    })
  })

  describe('rdf/dot-placement', () => {
    ruleTester.run('dot-placement', dotPlacement, {
      valid: [
        {
          code: `ex:subject
    ex:predicate ex:object ;
.`,
          options: [{ style: 'standalone' }],
        },
        {
          code: `ex:subject ex:predicate ex:object .`,
          options: [{ style: 'end-of-line' }],
        },
      ],
      invalid: [
        {
          code: `ex:subject
    ex:predicate ex:object .`,
          options: [{ style: 'standalone' }],
          errors: [{ messageId: 'expectedStandalone' }],
          output: `ex:subject
    ex:predicate ex:object 
.`,
        },
        {
          code: `ex:subject
    ex:predicate ex:object ;
.`,
          options: [{ style: 'end-of-line' }],
          errors: [{ messageId: 'expectedEndOfLine' }],
          output: `ex:subject
    ex:predicate ex:object ; .`,
        },
      ],
    })
  })

  describe('rdf/predicate-per-line', () => {
    ruleTester.run('predicate-per-line', predicatePerLine, {
      valid: [
        {
          code: `ex:subject
    a ex:Type ;
    ex:prop "value" ;
.`,
        },
      ],
      invalid: [
        {
          code: `ex:subject a ex:Type ; ex:prop "value" .`,
          errors: [{ messageId: 'predicateNewline' }],
          output: `ex:subject a ex:Type ; 
ex:prop "value" .`,
        },
      ],
    })
  })

  describe('rdf/no-unused-prefixes', () => {
    ruleTester.run('no-unused-prefixes', noUnusedPrefixes, {
      valid: [
        {
          code: `PREFIX ex: <http://example.org/>

ex:subject a ex:Type .`,
        },
        {
          code: `PREFIX sparqlc: <https://sparqlc.described.at/>
PREFIX rdfa: <http://www.w3.org/ns/rdfa#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

CONSTRUCT {
  ?term a ?type .
}
WHERE {
  BIND (sparqlc:param("prefix") as ?prefix)
  ?prefixMapping a rdfa:PrefixMapping ;
    rdfa:prefix ?prefix .
  FILTER (EXISTS { ?term rdfs:subClassOf* ?type })
}`,
        },
      ],
      invalid: [
        {
          code: `PREFIX unused: <http://example.org/unused#>
PREFIX ex: <http://example.org/>

ex:subject a ex:Type .`,
          errors: [{ messageId: 'unusedPrefix' }],
          output: `PREFIX ex: <http://example.org/>

ex:subject a ex:Type .`,
        },
        {
          code: `PREFIX ex: <http://example.org/>
PREFIX unused: <http://unused.org/>

SELECT ?x WHERE { ?x a ex:Type }`,
          errors: [{ messageId: 'unusedPrefix' }],
          output: `PREFIX ex: <http://example.org/>

SELECT ?x WHERE { ?x a ex:Type }`,
        },
      ],
    })
  })

  describe('rdf/sort-prefixes', () => {
    ruleTester.run('sort-prefixes', sortPrefixes, {
      valid: [
        {
          code: `PREFIX a: <http://a.org/>
PREFIX b: <http://b.org/>
PREFIX c: <http://c.org/>`,
        },
      ],
      invalid: [
        {
          code: `PREFIX b: <http://b.org/>
PREFIX a: <http://a.org/>`,
          errors: [{ messageId: 'unsortedPrefixes' }],
          output: `PREFIX a: <http://a.org/>
PREFIX b: <http://b.org/>`,
        },
      ],
    })
  })

  describe('rdf/prefix-declaration-style', () => {
    ruleTester.run('prefix-declaration-style', prefixDeclarationStyle, {
      valid: [
        {
          code: `PREFIX ex: <http://example.org/>`,
          options: [{ style: 'sparql', case: 'upper' }],
        },
        {
          code: `@prefix ex: <http://example.org/> .`,
          options: [{ style: 'turtle', case: 'lower' }],
        },
      ],
      invalid: [
        {
          code: `@prefix ex: <http://example.org/> .`,
          options: [{ style: 'sparql', case: 'upper' }],
          errors: [{ messageId: 'expectedSparql' }],
          output: `PREFIX ex: <http://example.org/>`,
        },
        {
          code: `PREFIX ex: <http://example.org/>`,
          options: [{ style: 'turtle', case: 'lower' }],
          errors: [{ messageId: 'expectedTurtle' }],
          output: `@prefix ex: <http://example.org/> .`,
        },
      ],
    })
  })

  describe('rdf/trailing-semicolon', () => {
    ruleTester.run('trailing-semicolon', trailingSemicolon, {
      valid: [
        {
          code: `ex:s ex:p ex:o ; .`,
          options: [{ mode: 'require' }],
        },
        {
          code: `ex:s ex:p ex:o .`,
          options: [{ mode: 'disallow' }],
        },
      ],
      invalid: [
        {
          code: `ex:s ex:p ex:o .`,
          options: [{ mode: 'require' }],
          errors: [{ messageId: 'missingTrailingSemicolon' }],
          output: `ex:s ex:p ex:o ; .`,
        },
        {
          code: `ex:s ex:p ex:o ; .`,
          options: [{ mode: 'disallow' }],
          errors: [{ messageId: 'unexpectedTrailingSemicolon' }],
          output: `ex:s ex:p ex:o .`,
        },
      ],
    })
  })

  describe('rdf/max-empty-lines', () => {
    ruleTester.run('max-empty-lines', maxEmptyLines, {
      valid: [
        {
          code: `ex:s ex:p ex:o .\n\nex:s2 ex:p2 ex:o2 .\n`,
          options: [{ max: 1, maxEOF: 0 }],
        },
      ],
      invalid: [
        {
          code: `ex:s ex:p ex:o .\n\n\n\nex:s2 ex:p2 ex:o2 .\n`,
          options: [{ max: 1, maxEOF: 0 }],
          errors: [{ messageId: 'tooManyBlankLines' }],
          output: `ex:s ex:p ex:o .\n\nex:s2 ex:p2 ex:o2 .\n`,
        },
      ],
    })
  })

  describe('rdf/semicolon-spacing', () => {
    ruleTester.run('semicolon-spacing', semicolonSpacing, {
      valid: [
        {
          code: `ex:s ex:p ex:o ; .`,
          options: [{ before: 'space' }],
        },
        {
          code: `ex:s ex:p ex:o; .`,
          options: [{ before: 'no-space' }],
        },
      ],
      invalid: [
        {
          code: `ex:s ex:p ex:o; .`,
          options: [{ before: 'space' }],
          errors: [{ messageId: 'expectedSpace' }],
          output: `ex:s ex:p ex:o ; .`,
        },
        {
          code: `ex:s ex:p ex:o ; .`,
          options: [{ before: 'no-space' }],
          errors: [{ messageId: 'unexpectedSpace' }],
          output: `ex:s ex:p ex:o; .`,
        },
      ],
    })
  })

  describe('rdf/list-wrapping', () => {
    ruleTester.run('list-wrapping', listWrapping, {
      valid: [
        {
          code: `ex:subject ex:predicate ( :a :b :c ) .`,
        },
        {
          code: `ex:subject ex:predicate () .`,
        },
        {
          code: `ex:subject
    ex:predicate (
        :a
        :b
        :c
    ) ;
.`,
        },
        {
          code: `ex:subject ex:predicate ( :a :b ) .`,
          options: [{ multiline: 'never' }],
        },
        {
          code: `SELECT * WHERE {
  FILTER(STRSTARTS(STR(?term), "http://") || ?count > 0)
  BIND(IF(bound(?name), ?name, "default") AS ?label)
}`,
        },
      ],
      invalid: [
        {
          code: `ex:subject ex:predicate ( ex:firstItem ex:secondItem ex:thirdItem ) .`,
          options: [{ maxLineLength: 30 }],
          errors: [{ messageId: 'mustBeMultiline' }],
          output: `ex:subject ex:predicate (
ex:firstItem
ex:secondItem
ex:thirdItem
) .`,
        },
        {
          code: `ex:s ex:p ( :a :b :c :d ) .`,
          options: [{ maxItems: 3 }],
          errors: [{ messageId: 'mustBeMultiline' }],
          output: `ex:s ex:p (
:a
:b
:c
:d
) .`,
        },
        {
          code: `ex:s ex:p ( :a
    :b
) .`,
          errors: [{ messageId: 'firstItemNewline' }],
          output: `ex:s ex:p (
:a
    :b
) .`,
        },
        {
          code: `ex:s ex:p (
    :a
    :b ) .`,
          errors: [{ messageId: 'closeParenNewline' }],
          output: `ex:s ex:p (
    :a
    :b
) .`,
        },
        {
          code: `ex:s ex:p (
    :a :b
    :c
) .`,
          errors: [{ messageId: 'itemNewline' }],
          output: `ex:s ex:p (
    :a
:b
    :c
) .`,
        },
        {
          code: `ex:s ex:p (
    :a
    :b
) .`,
          options: [{ multiline: 'never' }],
          errors: [{ messageId: 'mustBeSingleLine' }],
        },
      ],
    })
  })

  describe('rdf/no-duplicate-prefixes', () => {
    ruleTester.run('no-duplicate-prefixes', noDuplicatePrefixes, {
      valid: [
        {
          code: `PREFIX a: <http://a.org/>
PREFIX b: <http://b.org/>

ex:s a ex:Type .`,
        },
      ],
      invalid: [
        {
          code: `PREFIX a: <http://a.org/>
PREFIX a: <http://duplicate.org/>`,
          errors: [
            {
              messageId: 'duplicatePrefix',
              data: {
                name: 'a',
                line: '1',
              },
            },
          ],
        },
      ],
    })
  })

  describe('rdf/no-relative-iris', () => {
    ruleTester.run('no-relative-iris', noRelativeIris, {
      valid: [
        {
          code: `ex:s a <http://example.org/Type> .`,
        },
        {
          code: `<> a <http://example.org/Api> .`,
        },
        {
          code: `<#foo> a <http://example.org/Thing> .`,
        },
      ],
      invalid: [
        {
          code: `</api/Prefix> a <http://example.org/Thing> .`,
          errors: [
            {
              messageId: 'relativeIri',
              data: {
                iri: '/api/Prefix',
              },
            },
          ],
        },
        {
          code: `<> a <http://example.org/Api> .`,
          options: [{ allowEmpty: false }],
          errors: [
            {
              messageId: 'relativeIri',
              data: {
                iri: '',
              },
            },
          ],
        },
        {
          code: `<#foo> a <http://example.org/Thing> .`,
          options: [{ allowFragments: false }],
          errors: [
            {
              messageId: 'relativeIri',
              data: {
                iri: '#foo',
              },
            },
          ],
        },
      ],
    })
  })

  describe('rdf/object-per-line', () => {
    ruleTester.run('object-per-line', objectPerLine, {
      valid: [
        {
          code: `ex:s ex:p :o1, :o2, :o3 .`,
          options: [{ mode: 'as-needed' }],
        },
        {
          code: `ex:s ex:p :o1,
    :o2,
    :o3 .`,
          options: [{ mode: 'multiline' }],
        },
      ],
      invalid: [
        {
          code: `ex:s ex:p :o1, :o2 .`,
          options: [{ mode: 'multiline' }],
          errors: [{ messageId: 'objectNewline' }],
          output: `ex:s ex:p :o1, 
:o2 .`,
        },
      ],
    })
  })

  describe('rdf/prefix-name-case', () => {
    ruleTester.run('prefix-name-case', prefixNameCase, {
      valid: [
        {
          code: `PREFIX prefixServer: <http://example.org/>
PREFIX schema: <http://schema.org/>`,
          options: [{ case: 'camelCase' }],
        },
        {
          code: `PREFIX prefixServer: <http://example.org/>`,
        },
        {
          code: `PREFIX ex: <http://example.org/>`,
          options: [{ case: 'lower' }],
        },
        {
          code: `PREFIX EX: <http://example.org/>`,
          options: [{ case: 'upper' }],
        },
      ],
      invalid: [
        {
          code: `PREFIX PrefixServer: <http://example.org/>
PrefixServer:s PrefixServer:p PrefixServer:o .`,
          options: [{ case: 'camelCase' }],
          errors: [{ messageId: 'expectedCase' }],
          output: `PREFIX prefixServer: <http://example.org/>
prefixServer:s prefixServer:p prefixServer:o .`,
        },
        {
          code: `PREFIX EX: <http://example.org/>`,
          options: [{ case: 'lower' }],
          errors: [
            {
              messageId: 'expectedCase',
              data: {
                name: 'EX',
                expected: 'lower',
              },
            },
          ],
          output: `PREFIX ex: <http://example.org/>`,
        },
        {
          code: `PREFIX ex: <http://example.org/>`,
          options: [{ case: 'upper' }],
          errors: [
            {
              messageId: 'expectedCase',
              data: {
                name: 'ex',
                expected: 'upper',
              },
            },
          ],
          output: `PREFIX EX: <http://example.org/>`,
        },
      ],
    })
  })

  describe('rdf/require-final-dot', () => {
    ruleTester.run('require-final-dot', requireFinalDot, {
      valid: [
        {
          code: `ex:s ex:p ex:o .`,
        },
        {
          code: ``,
        },
      ],
      invalid: [
        {
          code: `ex:s ex:p ex:o`,
          errors: [{ messageId: 'missingFinalDot' }],
          output: `ex:s ex:p ex:o .`,
        },
      ],
    })
  })

  describe('N-Triples and N-Quads support', () => {
    describe('parsing & formatting N-Triples', () => {
      ruleTester.run('indentation (N-Triples)', indentation, {
        valid: [
          {
            code: `<http://example.org/subject> <http://example.org/predicate> <http://example.org/object> .\n`
              + `<http://example.org/subject> <http://example.org/predicate> "literal value" .\n`
              + `<http://example.org/subject> <http://example.org/predicate> "hello"@en .\n`
              + `<http://example.org/subject> <http://example.org/predicate> "123"^^<http://www.w3.org/2001/XMLSchema#integer> .\n`
              + `_:b0 <http://example.org/predicate> _:b1 .\n`
              + `# comment\n`
              + `_:b0 <http://example.org/predicate> <http://example.org/object> .\n`,
          },
        ],
        invalid: [
          {
            code: `  <http://example.org/subject> <http://example.org/predicate> <http://example.org/object> .\n`,
            errors: [{ messageId: 'wrongIndentation' }],
            output: `<http://example.org/subject> <http://example.org/predicate> <http://example.org/object> .\n`,
          },
        ],
      })

      ruleTester.run('dot-placement (N-Triples)', dotPlacement, {
        valid: [
          {
            code: `<http://example.org/s> <http://example.org/p> <http://example.org/o> .\n`
              + `<http://example.org/s> <http://example.org/p> "literal" .\n`,
            options: [{ style: 'end-of-line' }],
          },
        ],
        invalid: [
          {
            code: `<http://example.org/s> <http://example.org/p> <http://example.org/o>\n.`,
            options: [{ style: 'end-of-line' }],
            errors: [{ messageId: 'expectedEndOfLine' }],
            output: `<http://example.org/s> <http://example.org/p> <http://example.org/o> .`,
          },
        ],
      })

      ruleTester.run('require-final-dot (N-Triples)', requireFinalDot, {
        valid: [
          {
            code: `<http://example.org/s> <http://example.org/p> <http://example.org/o> .`,
          },
        ],
        invalid: [
          {
            code: `<http://example.org/s> <http://example.org/p> <http://example.org/o>`,
            errors: [{ messageId: 'missingFinalDot' }],
            output: `<http://example.org/s> <http://example.org/p> <http://example.org/o> .`,
          },
        ],
      })

      ruleTester.run('no-relative-iris (N-Triples)', noRelativeIris, {
        valid: [
          {
            code: `<http://example.org/s> <http://example.org/p> <http://example.org/o> .`,
          },
        ],
        invalid: [
          {
            code: `</relative/subject> <http://example.org/p> <http://example.org/o> .`,
            errors: [
              {
                messageId: 'relativeIri',
                data: { iri: '/relative/subject' },
              },
            ],
          },
        ],
      })
    })

    describe('parsing & formatting N-Quads', () => {
      ruleTester.run('indentation (N-Quads)', indentation, {
        valid: [
          {
            code: `<http://example.org/s> <http://example.org/p> <http://example.org/o> <http://example.org/g> .\n`
              + `_:b0 <http://example.org/p> "value"@en <http://example.org/g> .\n`
              + `_:b0 <http://example.org/p> "123"^^<http://www.w3.org/2001/XMLSchema#integer> _:g0 .\n`
              + `<http://example.org/s> <http://example.org/p> <http://example.org/o> .\n`,
          },
        ],
        invalid: [
          {
            code: `    <http://example.org/s> <http://example.org/p> <http://example.org/o> <http://example.org/g> .\n`,
            errors: [{ messageId: 'wrongIndentation' }],
            output: `<http://example.org/s> <http://example.org/p> <http://example.org/o> <http://example.org/g> .\n`,
          },
        ],
      })

      ruleTester.run('dot-placement (N-Quads)', dotPlacement, {
        valid: [
          {
            code: `<http://example.org/s> <http://example.org/p> <http://example.org/o> <http://example.org/g> .\n`,
            options: [{ style: 'end-of-line' }],
          },
        ],
        invalid: [
          {
            code: `<http://example.org/s> <http://example.org/p> <http://example.org/o> <http://example.org/g>\n.`,
            options: [{ style: 'end-of-line' }],
            errors: [{ messageId: 'expectedEndOfLine' }],
            output: `<http://example.org/s> <http://example.org/p> <http://example.org/o> <http://example.org/g> .`,
          },
        ],
      })

      ruleTester.run('no-relative-iris (N-Quads)', noRelativeIris, {
        valid: [
          {
            code: `<http://example.org/s> <http://example.org/p> <http://example.org/o> <http://example.org/g> .`,
          },
        ],
        invalid: [
          {
            code: `<http://example.org/s> <http://example.org/p> <http://example.org/o> <relative/graph> .`,
            errors: [
              {
                messageId: 'relativeIri',
                data: { iri: 'relative/graph' },
              },
            ],
          },
        ],
      })
    })
  })

  describe('rdf/known-terms', () => {
    ruleTester.run('known-terms', knownTerms, {
      valid: [
        {
          code: `PREFIX schema: <http://schema.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX custom: <http://example.org/custom#>

schema:Person a rdfs:Class ;
  schema:name "John" ;
  rdf:type schema:Thing ;
  rdf:_1 "First item" ;
  sh:targetClass schema:Person ;
  custom:unknownProp "value" .`,
        },
        {
          code: `PREFIX schema: <http://schema.org/>
schema:CustomUnknown "value" .`,
          options: [{ customTerms: { schema: ['CustomUnknown'] } }],
        },
        {
          code: `PREFIX schema: <http://schema.org/>
schema:IgnoredProp "value" .`,
          options: [{ ignoredTerms: ['schema:IgnoredProp'] }],
        },
      ],
      invalid: [
        {
          code: `PREFIX schema: <http://schema.org/>
schema:InvalidNonExistentTerm a schema:Person .`,
          errors: [
            {
              messageId: 'unknownTerm',
              data: { term: 'InvalidNonExistentTerm', vocab: 'schema' },
            },
          ],
        },
        {
          code: `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
rdf:invalidRdfTerm rdf:type rdf:Property .`,
          errors: [
            {
              messageId: 'unknownTerm',
              data: { term: 'invalidRdfTerm', vocab: 'rdf' },
            },
          ],
        },
      ],
    })
  })

  describe('rdf/prefer-prefixed-names', () => {
    ruleTester.run('prefer-prefixed-names', preferPrefixedNames, {
      valid: [
        {
          code: `PREFIX prefixServer: <https://prefix.zazuko.com/schema/>
prefixServer:s a prefixServer:Prefix .`,
        },
        {
          code: `PREFIX ex: <http://example.org/>
ex:s ex:p <http://other.org/resource> .`,
        },
      ],
      invalid: [
        {
          code: `PREFIX prefixServer: <https://prefix.zazuko.com/schema/>
<https://prefix.zazuko.com/schema/Prefix> a <https://prefix.zazuko.com/schema/Prefix> .`,
          errors: [
            { messageId: 'preferPrefixedName', data: { uri: 'https://prefix.zazuko.com/schema/Prefix', prefix: 'prefixServer', localName: 'Prefix' } },
            { messageId: 'preferPrefixedName', data: { uri: 'https://prefix.zazuko.com/schema/Prefix', prefix: 'prefixServer', localName: 'Prefix' } },
          ],
          output: `PREFIX prefixServer: <https://prefix.zazuko.com/schema/>
prefixServer:Prefix a prefixServer:Prefix .`,
        },
        {
          code: `<http://schema.org/Person> a <http://schema.org/Thing> .`,
          errors: [
            { messageId: 'preferPrefixedName', data: { uri: 'http://schema.org/Person', prefix: 'schema', localName: 'Person' } },
            { messageId: 'preferPrefixedName', data: { uri: 'http://schema.org/Thing', prefix: 'schema', localName: 'Thing' } },
          ],
          output: `PREFIX schema: <http://schema.org/>

schema:Person a schema:Thing .`,
        },
      ],
    })
  })

  describe('rdf/no-undeclared-prefixes', () => {
    ruleTester.run('no-undeclared-prefixes', noUndeclaredPrefixes, {
      valid: [
        {
          code: `PREFIX schema: <http://schema.org/>
schema:Person a schema:Thing .`,
        },
      ],
      invalid: [
        {
          code: `schema:Person a schema:Thing .`,
          errors: [
            { messageId: 'undeclaredPrefix', data: { prefix: 'schema', term: 'Person' } },
            { messageId: 'undeclaredPrefix', data: { prefix: 'schema', term: 'Thing' } },
          ],
          output: `PREFIX schema: <http://schema.org/>
schema:Person a schema:Thing .`,
        },
      ],
    })
  })
})
