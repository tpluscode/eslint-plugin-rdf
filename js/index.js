import banRdfJs from './rules/ban-rdf-js.js'

const plugin = {
  meta: {
    name: 'eslint-plugin-rdf/js',
  },
  rules: {
    'ban-rdf-js': banRdfJs,
  },
}

plugin.configs = {
  recommended: {
    plugins: {
      rdfjs: plugin,
    },
    rules: {
      'rdfjs/ban-rdf-js': 'error',
    },
  },
}

export default plugin
