import { describe, it, after, before } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import process from 'node:process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { RuleTester } from 'eslint'
import rdfParser from '../rdf/parser.js'
import sparqlParser from '../sparql/parser.js'
import rdfKnownTerms from '../rdf/rules/known-terms.js'
import sparqlKnownTerms from '../sparql/rules/known-terms.js'
import { generateVocabularies, areVocabulariesAvailable, resetVocabularies } from '../utils/vocabularies.js'

const dataPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../utils/vocabularies.json')
const scriptPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../scripts/postinstall.js')

describe('postinstall and vocabulary initialization', () => {
  let originalVocabularies = null

  before(() => {
    if (fs.existsSync(dataPath)) {
      originalVocabularies = fs.readFileSync(dataPath, 'utf8')
    }
  })

  after(() => {
    if (originalVocabularies !== null) {
      fs.writeFileSync(dataPath, originalVocabularies, 'utf8')
      resetVocabularies()
    }
  })

  it('generateVocabularies creates vocabularies.json when @tpluscode/rdf-ns-builders is present', async () => {
    const result = await generateVocabularies()
    assert.strictEqual(result, true)
    assert.ok(fs.existsSync(dataPath))
    assert.strictEqual(areVocabulariesAvailable(), true)

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    assert.ok(data.termsByVocab)
    assert.ok(data.termsByVocab.schema.includes('Person'))
    assert.ok(data.termsByVocab.rdf.includes('type'))
  })

  it('rules requiring vocabularies are inactive when vocabularies are missing', () => {
    const fakeContext = {
      options: [],
      sourceCode: {
        parserServices: {
          rdf: {
            prefixDeclarations: [],
            tokens: [],
          },
        },
      },
      report() {
        assert.fail('Should not report errors when inactive')
      },
    }

    const originalExistsSync = fs.existsSync
    try {
      fs.existsSync = (p) => {
        if (typeof p === 'string' && p.endsWith('vocabularies.json')) {
          return false
        }
        return originalExistsSync(p)
      }
      resetVocabularies()

      assert.strictEqual(areVocabulariesAvailable(), false)

      const rdfRule = rdfKnownTerms.create(fakeContext)
      assert.deepStrictEqual(rdfRule, {})

      const sparqlRule = sparqlKnownTerms.create(fakeContext)
      assert.deepStrictEqual(sparqlRule, {})

      const rdfRuleTester = new RuleTester({ languageOptions: { parser: rdfParser } })
      rdfRuleTester.run('known-terms-inactive', rdfKnownTerms, {
        valid: [
          {
            code: `PREFIX schema: <http://schema.org/>
schema:InvalidNonExistentTerm a schema:Person .`,
          },
        ],
        invalid: [],
      })

      const sparqlRuleTester = new RuleTester({ languageOptions: { parser: sparqlParser } })
      sparqlRuleTester.run('sparql-known-terms-inactive', sparqlKnownTerms, {
        valid: [
          {
            code: `PREFIX schema: <http://schema.org/>
SELECT * WHERE { ?s a schema:NotARealTerm }`,
          },
        ],
        invalid: [],
      })
    }
    finally {
      fs.existsSync = originalExistsSync
      resetVocabularies()
    }
  })

  it('postinstall script runs silently when @tpluscode/rdf-ns-builders is present', () => {
    const output = execFileSync(process.execPath, [scriptPath], { encoding: 'utf8' })
    assert.strictEqual(output, '')
  })
})
