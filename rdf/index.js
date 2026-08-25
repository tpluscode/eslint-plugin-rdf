import parser from './parser.js'
import blankNodeWrapping from './rules/blank-node-wrapping.js'
import dotPlacement from './rules/dot-placement.js'
import indentation from './rules/indentation.js'
import knownTerms from './rules/known-terms.js'
import listWrapping from './rules/list-wrapping.js'
import maxEmptyLines from './rules/max-empty-lines.js'
import noDuplicatePrefixes from './rules/no-duplicate-prefixes.js'
import noRelativeIris from './rules/no-relative-iris.js'
import noUndeclaredPrefixes from './rules/no-undeclared-prefixes.js'
import noUnusedPrefixes from './rules/no-unused-prefixes.js'
import objectPerLine from './rules/object-per-line.js'
import predicatePerLine from './rules/predicate-per-line.js'
import preferPrefixedNames from './rules/prefer-prefixed-names.js'
import prefixDeclarationStyle from './rules/prefix-declaration-style.js'
import prefixNameCase from './rules/prefix-name-case.js'
import requireFinalDot from './rules/require-final-dot.js'
import semicolonSpacing from './rules/semicolon-spacing.js'
import sortPrefixes from './rules/sort-prefixes.js'
import trailingSemicolon from './rules/trailing-semicolon.js'

const plugin = {
  parser,
  rules: {
    'blank-node-wrapping': blankNodeWrapping,
    'dot-placement': dotPlacement,
    indentation,
    'known-terms': knownTerms,
    'list-wrapping': listWrapping,
    'max-empty-lines': maxEmptyLines,
    'no-duplicate-prefixes': noDuplicatePrefixes,
    'no-relative-iris': noRelativeIris,
    'no-undeclared-prefixes': noUndeclaredPrefixes,
    'no-unused-prefixes': noUnusedPrefixes,
    'object-per-line': objectPerLine,
    'predicate-per-line': predicatePerLine,
    'prefer-prefixed-names': preferPrefixedNames,
    'prefix-declaration-style': prefixDeclarationStyle,
    'prefix-name-case': prefixNameCase,
    'require-final-dot': requireFinalDot,
    'semicolon-spacing': semicolonSpacing,
    'sort-prefixes': sortPrefixes,
    'trailing-semicolon': trailingSemicolon,
  },
}

plugin.configs = {
  recommended: {
    files: ['**/*.ttl', '**/*.trig', '**/*.n3', '**/*.nt', '**/*.nq'],
    languageOptions: {
      parser,
    },
    plugins: {
      rdf: plugin,
    },
    rules: {
      'rdf/no-duplicate-prefixes': 'error',
      'rdf/prefix-name-case': ['warn', { case: 'camelCase' }],
      'rdf/require-final-dot': 'error',
      'rdf/no-relative-iris': 'off',
      'rdf/indentation': ['error', { spaces: 2, dotIndent: 'subject' }],
      'rdf/blank-node-wrapping': 'error',
      'rdf/list-wrapping': 'error',
      'rdf/dot-placement': ['error', { style: 'standalone', allowSingleLine: true }],
      'rdf/predicate-per-line': 'error',
      'rdf/no-unused-prefixes': 'warn',
      'rdf/sort-prefixes': 'warn',
      'rdf/prefix-declaration-style': ['warn', { style: 'sparql', case: 'upper' }],
      'rdf/trailing-semicolon': 'off',
      'rdf/max-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      'rdf/object-per-line': 'off',
      'rdf/semicolon-spacing': ['error', { before: 'space' }],
      'rdf/known-terms': 'error',
      'rdf/prefer-prefixed-names': 'warn',
      'rdf/no-undeclared-prefixes': 'error',
    },
  },
  turtle: {
    files: ['**/*.ttl', '**/*.trig', '**/*.n3'],
    languageOptions: {
      parser,
    },
    plugins: {
      rdf: plugin,
    },
    rules: {
      'rdf/no-duplicate-prefixes': 'error',
      'rdf/prefix-name-case': ['warn', { case: 'camelCase' }],
      'rdf/require-final-dot': 'error',
      'rdf/no-relative-iris': 'off',
      'rdf/indentation': ['error', { spaces: 2, dotIndent: 'subject' }],
      'rdf/blank-node-wrapping': 'error',
      'rdf/list-wrapping': 'error',
      'rdf/dot-placement': ['error', { style: 'standalone' }],
      'rdf/predicate-per-line': 'error',
      'rdf/no-unused-prefixes': 'warn',
      'rdf/sort-prefixes': 'warn',
      'rdf/prefix-declaration-style': ['warn', { style: 'sparql', case: 'upper' }],
      'rdf/trailing-semicolon': 'off',
      'rdf/max-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      'rdf/object-per-line': 'off',
      'rdf/semicolon-spacing': ['error', { before: 'space' }],
      'rdf/known-terms': 'error',
      'rdf/prefer-prefixed-names': 'warn',
      'rdf/no-undeclared-prefixes': 'error',
    },
  },
  ntriples: {
    files: ['**/*.nt'],
    languageOptions: {
      parser,
    },
    plugins: {
      rdf: plugin,
    },
    rules: {
      'rdf/require-final-dot': 'error',
      'rdf/dot-placement': ['error', { style: 'end-of-line' }],
      'rdf/indentation': ['error', { spaces: 2 }],
      'rdf/max-empty-lines': ['error', { max: 1, maxEOF: 0 }],
    },
  },
  nquads: {
    files: ['**/*.nq'],
    languageOptions: {
      parser,
    },
    plugins: {
      rdf: plugin,
    },
    rules: {
      'rdf/require-final-dot': 'error',
      'rdf/dot-placement': ['error', { style: 'end-of-line' }],
      'rdf/indentation': ['error', { spaces: 2 }],
      'rdf/max-empty-lines': ['error', { max: 1, maxEOF: 0 }],
    },
  },
}

export default plugin
