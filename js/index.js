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
      rdf: plugin,
    },
    rules: {
      'rdf/ban-rdf-js': 'error',
    },
  },
}

export default plugin
