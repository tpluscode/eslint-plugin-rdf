import js from './js/index.js'
import rdf from './rdf/index.js'
import sparql from './sparql/index.js'

const configs = {
  js: js.configs.recommended,
  rdf: rdf.configs.recommended,
  sparql: sparql.configs.recommended,
  turtle: rdf.configs.turtle,
  ntriples: rdf.configs.ntriples,
  nquads: rdf.configs.nquads,
  recommended: [
    js.configs.recommended,
    rdf.configs.recommended,
    sparql.configs.recommended,
  ],
}

const plugin = {
  meta: {
    name: 'eslint-plugin-rdf',
  },
  rules: {
    ...js.rules,
    ...rdf.rules,
    ...sparql.rules,
  },
  configs,
  js,
  rdf,
  sparql,
}

configs.js.plugins.rdf = plugin
configs.rdf.plugins.rdf = plugin
configs.sparql.plugins.rdf = plugin
configs.turtle.plugins.rdf = plugin
configs.ntriples.plugins.rdf = plugin
configs.nquads.plugins.rdf = plugin

export default plugin
