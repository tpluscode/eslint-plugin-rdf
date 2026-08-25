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
  meta: {
    name: 'eslint-plugin-rdf/sparql',
  },
  parser,
  rules: {
    indentation,
    'keyword-case': keywordCase,
    'known-terms': knownTerms,
    'max-empty-lines': maxEmptyLines,
    'no-duplicate-prefixes': noDuplicatePrefixes,
    'no-undeclared-prefixes': noUndeclaredPrefixes,
    'no-unused-prefixes': noUnusedPrefixes,
    'predicate-per-line': predicatePerLine,
    'prefer-prefixed-names': preferPrefixedNames,
    'prefix-name-case': prefixNameCase,
    'semicolon-spacing': semicolonSpacing,
    'sort-prefixes': sortPrefixes,
  },
}

plugin.configs = {
  recommended: {
    files: ['**/*.rq', '**/*.ru', '**/*.sparql'],
    languageOptions: {
      parser,
    },
    plugins: {
      sparql: plugin,
    },
    rules: {
      'sparql/no-duplicate-prefixes': 'error',
      'sparql/prefix-name-case': ['warn', { case: 'camelCase' }],
      'sparql/indentation': ['error', { spaces: 4 }],
      'sparql/keyword-case': ['warn', { case: 'upper' }],
      'sparql/predicate-per-line': 'error',
      'sparql/no-unused-prefixes': 'warn',
      'sparql/sort-prefixes': 'warn',
      'sparql/max-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      'sparql/semicolon-spacing': ['error', { before: 'space' }],
      'sparql/known-terms': 'error',
      'sparql/prefer-prefixed-names': 'warn',
      'sparql/no-undeclared-prefixes': 'error',
    },
  },
}

export default plugin
