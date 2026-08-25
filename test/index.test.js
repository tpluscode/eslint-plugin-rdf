import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import plugin from '../index.js'
import * as indexExports from '../index.js'
import jsPlugin from '../js/index.js'
import rdfPlugin from '../rdf/index.js'
import sparqlPlugin from '../sparql/index.js'

describe('index entrypoint', () => {
  it('has no named exports', () => {
    assert.deepStrictEqual(Object.keys(indexExports), ['default'])
  })

  it('exports sub-plugins', () => {
    assert.strictEqual(plugin.js, jsPlugin)
    assert.strictEqual(plugin.rdf, rdfPlugin)
    assert.strictEqual(plugin.sparql, sparqlPlugin)
  })

  it('exports recommended configs for js, rdf, and sparql', () => {
    assert.strictEqual(plugin.configs.js, jsPlugin.configs.recommended)
    assert.strictEqual(plugin.configs.rdf, rdfPlugin.configs.recommended)
    assert.strictEqual(plugin.configs.sparql, sparqlPlugin.configs.recommended)
  })

  it('exports array of all recommended configs as configs.recommended', () => {
    assert.deepStrictEqual(plugin.configs.recommended, [
      jsPlugin.configs.recommended,
      rdfPlugin.configs.recommended,
      sparqlPlugin.configs.recommended,
    ])
  })

  it('exports dialect configs from rdf plugin', () => {
    assert.strictEqual(plugin.configs.turtle, rdfPlugin.configs.turtle)
    assert.strictEqual(plugin.configs.ntriples, rdfPlugin.configs.ntriples)
    assert.strictEqual(plugin.configs.nquads, rdfPlugin.configs.nquads)
  })

  it('has valid plugin meta', () => {
    assert.strictEqual(plugin.meta.name, 'eslint-plugin-rdf')
  })

  it('exports rules from all sub-plugins', () => {
    assert.ok(plugin.rules['ban-rdf-js'])
    assert.ok(plugin.rules['known-terms'])
    assert.ok(plugin.rules['sparql-known-terms'])
    assert.strictEqual(plugin.rules['ban-rdf-js'], jsPlugin.rules['ban-rdf-js'])
    assert.strictEqual(plugin.rules['sparql-known-terms'], sparqlPlugin.rules['sparql-known-terms'])
  })

  it('configures rdf plugin in js recommended config', () => {
    assert.strictEqual(jsPlugin.configs.recommended.plugins.rdf, plugin)
    assert.strictEqual(jsPlugin.configs.recommended.rules['rdf/ban-rdf-js'], 'error')
  })

  it('configures rdf plugin in sparql recommended config', () => {
    assert.strictEqual(sparqlPlugin.configs.recommended.plugins.rdf, plugin)
    assert.strictEqual(sparqlPlugin.configs.recommended.rules['rdf/sparql-known-terms'], 'error')
  })
})
