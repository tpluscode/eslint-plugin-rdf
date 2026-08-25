import parser from '../rdf/parser.js'

export default {
  meta: {
    name: '@local/sparql-parser',
    version: '0.0.0',
  },
  parseForESLint(source, options = {}) {
    const result = parser.parseForESLint(source, options)
    return {
      ...result,
      services: {
        ...result.services,
        sparql: {
          ...result.services?.rdf,
        },
      },
    }
  },
}
