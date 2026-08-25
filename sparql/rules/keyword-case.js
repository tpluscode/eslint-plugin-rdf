const SPARQL_KEYWORDS = new Set([
  'SELECT',
  'CONSTRUCT',
  'DESCRIBE',
  'ASK',
  'INSERT',
  'DELETE',
  'DATA',
  'WITH',
  'WHERE',
  'GRAPH',
  'USING',
  'NAMED',
  'DEFAULT',
  'ALL',
  'SILENT',
  'LOAD',
  'CLEAR',
  'CREATE',
  'DROP',
  'COPY',
  'MOVE',
  'ADD',
  'TO',
  'INTO',
  'PREFIX',
  'BASE',
  'OPTIONAL',
  'UNION',
  'FILTER',
  'BIND',
  'AS',
  'VALUES',
  'NOT',
  'EXISTS',
  'MINUS',
  'SERVICE',
  'UNDEF',
  'DISTINCT',
  'REDUCED',
  'ORDER',
  'BY',
  'ASC',
  'DESC',
  'LIMIT',
  'OFFSET',
  'GROUP',
  'HAVING',
  'FROM',
  // Built-in functions & expressions
  'BOUND',
  'IF',
  'COALESCE',
  'STR',
  'LANG',
  'LANGMATCHES',
  'DATATYPE',
  'IRI',
  'URI',
  'BNODE',
  'RAND',
  'ABS',
  'CEIL',
  'FLOOR',
  'ROUND',
  'CONCAT',
  'STRLEN',
  'UCASE',
  'LCASE',
  'ENCODE_FOR_URI',
  'CONTAINS',
  'STRSTARTS',
  'STRENDS',
  'STRBEFORE',
  'STRAFTER',
  'YEAR',
  'MONTH',
  'DAY',
  'HOURS',
  'MINUTES',
  'SECONDS',
  'TIMEZONE',
  'TZ',
  'NOW',
  'UUID',
  'STRUUID',
  'MD5',
  'SHA1',
  'SHA256',
  'SHA384',
  'SHA512',
  'REGEX',
  'SUBSTR',
  'REPLACE',
  'SAMETERM',
  'ISIRI',
  'ISURI',
  'ISBLANK',
  'ISLITERAL',
  'ISNUMERIC',
  'COUNT',
  'SUM',
  'MIN',
  'MAX',
  'AVG',
  'SAMPLE',
  'GROUP_CONCAT',
  'SEPARATOR',
])

export default {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce consistent casing for SPARQL keywords',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          case: {
            enum: ['upper', 'lower'],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      keywordCase: 'Expected keyword "{{ actual }}" to be {{ expected }}.',
    },
  },

  create(context) {
    const options = context.options[0] ?? {}
    const expectedCase = options.case ?? 'upper'

    return {
      Program() {
        const sourceCode = context.sourceCode
        const tokens = sourceCode.parserServices?.sparql?.tokens
          ?? sourceCode.parserServices?.rdf?.tokens
          ?? []

        for (const token of tokens) {
          if (token.type !== 'Identifier') {
            continue
          }

          if (
            token.value.startsWith('?')
            || token.value.startsWith('$')
            || token.value.startsWith('@')
            || token.value.includes(':')
          ) {
            continue
          }

          const upper = token.value.toUpperCase()
          if (!SPARQL_KEYWORDS.has(upper)) {
            continue
          }

          const expected = expectedCase === 'upper' ? upper : token.value.toLowerCase()

          if (token.value !== expected) {
            context.report({
              loc: token.loc,
              messageId: 'keywordCase',
              data: {
                actual: token.value,
                expected,
              },
              fix(fixer) {
                return fixer.replaceTextRange(token.range, expected)
              },
            })
          }
        }
      },
    }
  },
}
