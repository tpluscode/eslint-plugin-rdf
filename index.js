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
  configs,
  js,
  rdf,
  sparql,
}

export {
  configs,
  js,
  rdf,
  sparql,
}

export default plugin
