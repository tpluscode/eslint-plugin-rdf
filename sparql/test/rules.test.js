import { describe } from 'node:test'
import { RuleTester } from 'eslint'
import parser from '../parser.js'
import indentation from '../rules/indentation.js'
import keywordCase from '../rules/keyword-case.js'
import maxEmptyLines from '../rules/max-empty-lines.js'
import noDuplicatePrefixes from '../rules/no-duplicate-prefixes.js'
import noUnusedPrefixes from '../rules/no-unused-prefixes.js'
import predicatePerLine from '../rules/predicate-per-line.js'
import prefixNameCase from '../rules/prefix-name-case.js'
import semicolonSpacing from '../rules/semicolon-spacing.js'
import sortPrefixes from '../rules/sort-prefixes.js'
import knownTerms from '../rules/known-terms.js'
import preferPrefixedNames from '../rules/prefer-prefixed-names.js'
import noUndeclaredPrefixes from '../rules/no-undeclared-prefixes.js'

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
  },
})

describe('SPARQL rules', () => {
  describe('sparql/keyword-case', () => {
    ruleTester.run('keyword-case', keywordCase, {
      valid: [
        {
          code: `SELECT ?s ?p ?o WHERE { ?s ?p ?o }`,
        },
        {
          code: `CONSTRUCT { ?s ?p ?o } WHERE { BIND (sparqlc:param("x") AS ?x) }`,
        },
        {
          code: `select ?s ?p ?o where { ?s ?p ?o }`,
          options: [{ case: 'lower' }],
        },
      ],
      invalid: [
        {
          code: `select ?s ?p ?o where { ?s ?p ?o }`,
          errors: [
            { messageId: 'keywordCase', data: { actual: 'select', expected: 'SELECT' } },
            { messageId: 'keywordCase', data: { actual: 'where', expected: 'WHERE' } },
          ],
          output: `SELECT ?s ?p ?o WHERE { ?s ?p ?o }`,
        },
        {
          code: `BIND (sparqlc:param("x") as ?x)`,
          errors: [
            { messageId: 'keywordCase', data: { actual: 'as', expected: 'AS' } },
          ],
          output: `BIND (sparqlc:param("x") AS ?x)`,
        },
        {
          code: `prefix ex: <http://example.org/>
SELECT * WHERE { ?s ?p ?o }`,
          errors: [
            { messageId: 'keywordCase', data: { actual: 'prefix', expected: 'PREFIX' } },
          ],
          output: `PREFIX ex: <http://example.org/>
SELECT * WHERE { ?s ?p ?o }`,
        },
      ],
    })
  })

  describe('sparql/indentation', () => {
    ruleTester.run('indentation', indentation, {
      valid: [
        {
          code: `PREFIX ex: <http://example.org/>

SELECT ?s ?p ?o
WHERE {
    ?s ?p ?o .
}`,
          options: [{ spaces: 4 }],
        },
        {
          code: `PREFIX prefixServer: <https://prefix.zazuko.com/schema/>
PREFIX sparqlc: <https://sparqlc.described.at/>
PREFIX schema: <http://schema.org/>

INSERT {
    GRAPH ?id {
        ?id a prefixServer:Vocabulary ;
            prefixServer:prefix ?prefix ;
            schema:primaryTopic ?vocab ;
    }
    .
}
WHERE {
    BIND (sparqlc:param("vocab") AS ?vocab)
    BIND (sparqlc:param("prefix") AS ?prefix)

    BIND (IRI(CONCAT("/prefix/", ?prefix)) AS ?id)
}`,
          options: [{ spaces: 4 }],
        },
      ],
      invalid: [
        {
          code: `SELECT ?s ?p ?o
WHERE {
  ?s ?p ?o .
}`,
          options: [{ spaces: 4 }],
          errors: [{ messageId: 'wrongIndentation' }],
          output: `SELECT ?s ?p ?o
WHERE {
    ?s ?p ?o .
}`,
        },
      ],
    })
  })

  describe('sparql/no-unused-prefixes', () => {
    ruleTester.run('no-unused-prefixes', noUnusedPrefixes, {
      valid: [
        {
          code: `PREFIX ex: <http://example.org/>

SELECT ?s WHERE { ?s a ex:Type }`,
        },
      ],
      invalid: [
        {
          code: `PREFIX unused: <http://example.org/unused#>
PREFIX ex: <http://example.org/>

SELECT ?s WHERE { ?s a ex:Type }`,
          errors: [{ messageId: 'unusedPrefix' }],
          output: `PREFIX ex: <http://example.org/>

SELECT ?s WHERE { ?s a ex:Type }`,
        },
      ],
    })
  })

  describe('sparql/sort-prefixes', () => {
    ruleTester.run('sort-prefixes', sortPrefixes, {
      valid: [
        {
          code: `PREFIX a: <http://example.org/a#>
PREFIX b: <http://example.org/b#>

SELECT * WHERE { ?s ?p ?o }`,
        },
      ],
      invalid: [
        {
          code: `PREFIX z: <http://example.org/z#>
PREFIX a: <http://example.org/a#>

SELECT * WHERE { ?s ?p ?o }`,
          errors: [{ messageId: 'unsortedPrefixes' }],
          output: `PREFIX a: <http://example.org/a#>
PREFIX z: <http://example.org/z#>

SELECT * WHERE { ?s ?p ?o }`,
        },
      ],
    })
  })

  describe('sparql/no-duplicate-prefixes', () => {
    ruleTester.run('no-duplicate-prefixes', noDuplicatePrefixes, {
      valid: [
        {
          code: `PREFIX ex: <http://example.org/1#>
PREFIX other: <http://example.org/2#>`,
        },
      ],
      invalid: [
        {
          code: `PREFIX ex: <http://example.org/1#>
PREFIX ex: <http://example.org/2#>`,
          errors: [{ messageId: 'duplicatePrefix' }],
        },
      ],
    })
  })

  describe('sparql/prefix-name-case', () => {
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
SELECT * WHERE { ?s a PrefixServer:Type ; PrefixServer:prop ?o }`,
          options: [{ case: 'camelCase' }],
          errors: [{ messageId: 'expectedCase' }],
          output: `PREFIX prefixServer: <http://example.org/>
SELECT * WHERE { ?s a prefixServer:Type ; prefixServer:prop ?o }`,
        },
        {
          code: `PREFIX EX: <http://example.org/>`,
          options: [{ case: 'lower' }],
          errors: [{ messageId: 'expectedCase' }],
          output: `PREFIX ex: <http://example.org/>`,
        },
        {
          code: `PREFIX ex: <http://example.org/>`,
          options: [{ case: 'upper' }],
          errors: [{ messageId: 'expectedCase' }],
          output: `PREFIX EX: <http://example.org/>`,
        },
      ],
    })
  })

  describe('sparql/predicate-per-line', () => {
    ruleTester.run('predicate-per-line', predicatePerLine, {
      valid: [
        {
          code: `SELECT * WHERE {
  ?s a ex:Type ;
    ex:prop "value" .
}`,
        },
      ],
      invalid: [
        {
          code: `SELECT * WHERE { ?s a ex:Type ; ex:prop "value" . }`,
          errors: [{ messageId: 'predicateNewline' }],
          output: `SELECT * WHERE { ?s a ex:Type ; 
ex:prop "value" . }`,
        },
      ],
    })
  })

  describe('sparql/semicolon-spacing', () => {
    ruleTester.run('semicolon-spacing', semicolonSpacing, {
      valid: [
        {
          code: `SELECT * WHERE {
  ?s a ex:Type ;
    ex:name "Test" .
}`,
          options: [{ before: 'space' }],
        },
      ],
      invalid: [
        {
          code: `SELECT * WHERE {
  ?s a ex:Type;
    ex:name "Test" .
}`,
          options: [{ before: 'space' }],
          errors: [{ messageId: 'expectedSpace' }],
          output: `SELECT * WHERE {
  ?s a ex:Type ;
    ex:name "Test" .
}`,
        },
      ],
    })
  })

  describe('sparql/max-empty-lines', () => {
    ruleTester.run('max-empty-lines', maxEmptyLines, {
      valid: [
        {
          code: `PREFIX ex: <http://example.org/>

SELECT * WHERE { ?s ?p ?o }`,
          options: [{ max: 1 }],
        },
      ],
      invalid: [
        {
          code: `PREFIX ex: <http://example.org/>



SELECT * WHERE { ?s ?p ?o }`,
          options: [{ max: 1 }],
          errors: [{ messageId: 'tooManyBlankLines' }],
          output: `PREFIX ex: <http://example.org/>

SELECT * WHERE { ?s ?p ?o }`,
        },
      ],
    })
  })

  describe('sparql/known-terms', () => {
    ruleTester.run('known-terms', knownTerms, {
      valid: [
        {
          code: `PREFIX schema: <http://schema.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
SELECT * WHERE {
    ?s a schema:Person ;
       schema:name ?name ;
       rdf:type ?type ;
       rdf:_1 ?item .
}`,
        },
      ],
      invalid: [
        {
          code: `PREFIX schema: <http://schema.org/>
SELECT * WHERE { ?s a schema:NotARealTerm }`,
          errors: [
            {
              messageId: 'unknownTerm',
              data: { term: 'NotARealTerm', vocab: 'schema' },
            },
          ],
        },
      ],
    })
  })

  describe('sparql/prefer-prefixed-names', () => {
    ruleTester.run('prefer-prefixed-names', preferPrefixedNames, {
      valid: [
        {
          code: `PREFIX schema: <http://schema.org/>
SELECT * WHERE { ?s a schema:Person }`,
        },
      ],
      invalid: [
        {
          code: `PREFIX prefixServer: <https://prefix.zazuko.com/schema/>
CONSTRUCT WHERE { ?prefix a <https://prefix.zazuko.com/schema/Prefix> }`,
          errors: [
            {
              messageId: 'preferPrefixedName',
              data: { uri: 'https://prefix.zazuko.com/schema/Prefix', prefix: 'prefixServer', localName: 'Prefix' },
            },
          ],
          output: `PREFIX prefixServer: <https://prefix.zazuko.com/schema/>
CONSTRUCT WHERE { ?prefix a prefixServer:Prefix }`,
        },
        {
          code: `CONSTRUCT WHERE { ?s a <http://schema.org/Person> }`,
          errors: [
            {
              messageId: 'preferPrefixedName',
              data: { uri: 'http://schema.org/Person', prefix: 'schema', localName: 'Person' },
            },
          ],
          output: `PREFIX schema: <http://schema.org/>

CONSTRUCT WHERE { ?s a schema:Person }`,
        },
      ],
    })
  })

  describe('sparql/no-undeclared-prefixes', () => {
    ruleTester.run('no-undeclared-prefixes', noUndeclaredPrefixes, {
      valid: [
        {
          code: `PREFIX schema: <http://schema.org/>
SELECT * WHERE { ?s a schema:Person }`,
        },
      ],
      invalid: [
        {
          code: `SELECT * WHERE { ?s a schema:Person }`,
          errors: [
            {
              messageId: 'undeclaredPrefix',
              data: { prefix: 'schema', term: 'Person' },
            },
          ],
          output: `PREFIX schema: <http://schema.org/>
SELECT * WHERE { ?s a schema:Person }`,
        },
      ],
    })
  })
})
