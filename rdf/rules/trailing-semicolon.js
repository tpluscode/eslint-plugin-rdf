export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce or disallow trailing semicolons before statement terminator dot',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          mode: {
            enum: ['allow', 'require', 'disallow'],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingTrailingSemicolon: 'Statement must have a trailing semicolon before ".".',
      unexpectedTrailingSemicolon: 'Trailing semicolon before "." is not allowed.',
    },
  },

  create(context) {
    const options = context.options[0] ?? {}
    const mode = options.mode ?? 'allow'

    if (mode === 'allow') {
      return {}
    }

    return {
      Program() {
        const sourceCode = context.sourceCode
        const tokens = sourceCode.parserServices?.rdf?.tokens ?? []

        let bracketDepth = 0
        let parenDepth = 0
        let inPrefix = false

        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i]
          const valUpper = token.value.toUpperCase()

          if (valUpper === 'PREFIX' || valUpper === '@PREFIX' || valUpper === 'BASE' || valUpper === '@BASE') {
            inPrefix = true
            continue
          }

          if (inPrefix) {
            if (token.value === '.' || token.type === 'IRI') {
              if (token.value === '.' || tokens[i + 1]?.value !== '.') {
                inPrefix = false
              }
            }
            continue
          }

          if (token.value === '[') {
            bracketDepth++
            continue
          }
          if (token.value === ']') {
            bracketDepth = Math.max(0, bracketDepth - 1)
            continue
          }
          if (token.value === '(') {
            parenDepth++
            continue
          }
          if (token.value === ')') {
            parenDepth = Math.max(0, parenDepth - 1)
            continue
          }

          if (token.value === '.' && bracketDepth === 0 && parenDepth === 0) {
            const prevToken = tokens[i - 1]
            if (!prevToken) continue

            const hasTrailingSemicolon = prevToken.value === ';'

            if (mode === 'require' && !hasTrailingSemicolon) {
              context.report({
                loc: prevToken.loc,
                messageId: 'missingTrailingSemicolon',
                fix(fixer) {
                  return fixer.insertTextAfterRange(prevToken.range, ' ;')
                },
              })
            }
            else if (mode === 'disallow' && hasTrailingSemicolon) {
              const beforeSemicolonToken = tokens[i - 2]
              context.report({
                loc: prevToken.loc,
                messageId: 'unexpectedTrailingSemicolon',
                fix(fixer) {
                  const removeStart = beforeSemicolonToken
                    ? beforeSemicolonToken.range[1]
                    : prevToken.range[0]
                  return fixer.removeRange([removeStart, prevToken.range[1]])
                },
              })
            }
          }
        }
      },
    }
  },
}
