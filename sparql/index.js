import parser from './parser.js'
import indentation from './rules/indentation.js'
import keywordCase from './rules/keyword-case.js'
import knownTerms from './rules/known-terms.js'
import maxEmptyLines from './rules/max-empty-lines.js'
import noDuplicatePrefixes from './rules/no-duplicate-prefixes.js'
import noUndeclaredPrefixes from './rules/no-undeclared-prefixes.js'
import noUnusedPrefixes from './rules/no-unused-prefixes.js'
import predicatePerLine from './rules/predicate-per-line.js'
import preferPrefixedNames from './rules/prefer-prefixed-names.js'
import prefixNameCase from './rules/prefix-name-case.js'
import semicolonSpacing from './rules/semicolon-spacing.js'
import sortPrefixes from './rules/sort-prefixes.js'

const plugin = {
  parser,
  rules: {
    'sparql-indentation': indentation,
    'sparql-keyword-case': keywordCase,
    'sparql-known-terms': knownTerms,
    'sparql-max-empty-lines': maxEmptyLines,
    'sparql-no-duplicate-prefixes': noDuplicatePrefixes,
    'sparql-no-undeclared-prefixes': noUndeclaredPrefixes,
    'sparql-no-unused-prefixes': noUnusedPrefixes,
    'sparql-predicate-per-line': predicatePerLine,
    'sparql-prefer-prefixed-names': preferPrefixedNames,
    'sparql-prefix-name-case': prefixNameCase,
    'sparql-semicolon-spacing': semicolonSpacing,
    'sparql-sort-prefixes': sortPrefixes,
  },
}

plugin.configs = {
  recommended: {
    files: ['**/*.rq', '**/*.ru', '**/*.sparql'],
    languageOptions: {
      parser,
    },
    plugins: {
      rdf: plugin,
    },
    rules: {
      'rdf/sparql-no-duplicate-prefixes': 'error',
      'rdf/sparql-prefix-name-case': ['warn', { case: 'camelCase' }],
      'rdf/sparql-indentation': ['error', { spaces: 4 }],
      'rdf/sparql-keyword-case': ['warn', { case: 'upper' }],
      'rdf/sparql-predicate-per-line': 'error',
      'rdf/sparql-no-unused-prefixes': 'warn',
      'rdf/sparql-sort-prefixes': 'warn',
      'rdf/sparql-max-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      'rdf/sparql-semicolon-spacing': ['error', { before: 'space' }],
      'rdf/sparql-known-terms': 'error',
      'rdf/sparql-prefer-prefixed-names': 'warn',
      'rdf/sparql-no-undeclared-prefixes': 'error',
    },
  },
}

export default plugin
