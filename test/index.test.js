import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import plugin, { configs, js, rdf, sparql } from '../index.js'
import jsPlugin from '../js/index.js'
import rdfPlugin from '../rdf/index.js'
import sparqlPlugin from '../sparql/index.js'

describe('index entrypoint', () => {
  it('exports sub-plugins', () => {
    assert.strictEqual(js, jsPlugin)
    assert.strictEqual(rdf, rdfPlugin)
    assert.strictEqual(sparql, sparqlPlugin)
    assert.strictEqual(plugin.js, jsPlugin)
    assert.strictEqual(plugin.rdf, rdfPlugin)
    assert.strictEqual(plugin.sparql, sparqlPlugin)
  })

  it('exports recommended configs for js, rdf, and sparql', () => {
    assert.strictEqual(configs.js, jsPlugin.configs.recommended)
    assert.strictEqual(configs.rdf, rdfPlugin.configs.recommended)
    assert.strictEqual(configs.sparql, sparqlPlugin.configs.recommended)
    assert.strictEqual(plugin.configs.js, jsPlugin.configs.recommended)
    assert.strictEqual(plugin.configs.rdf, rdfPlugin.configs.recommended)
    assert.strictEqual(plugin.configs.sparql, sparqlPlugin.configs.recommended)
  })

  it('exports array of all recommended configs as configs.recommended', () => {
    assert.deepStrictEqual(configs.recommended, [
      jsPlugin.configs.recommended,
      rdfPlugin.configs.recommended,
      sparqlPlugin.configs.recommended,
    ])
    assert.deepStrictEqual(plugin.configs.recommended, [
      jsPlugin.configs.recommended,
      rdfPlugin.configs.recommended,
      sparqlPlugin.configs.recommended,
    ])
  })

  it('exports dialect configs from rdf plugin', () => {
    assert.strictEqual(configs.turtle, rdfPlugin.configs.turtle)
    assert.strictEqual(configs.ntriples, rdfPlugin.configs.ntriples)
    assert.strictEqual(configs.nquads, rdfPlugin.configs.nquads)
  })

  it('has valid plugin meta', () => {
    assert.strictEqual(plugin.meta.name, 'eslint-plugin-rdf')
  })

  it('configures rdfjs plugin in js recommended config', () => {
    assert.strictEqual(jsPlugin.configs.recommended.plugins.rdfjs, jsPlugin)
    assert.strictEqual(jsPlugin.configs.recommended.rules['rdfjs/ban-rdf-js'], 'error')
  })
})
