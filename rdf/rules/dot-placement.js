export default {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce placement of statement closing dot',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          style: {
            enum: ['standalone', 'end-of-line'],
          },
          allowSingleLine: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      expectedStandalone: 'Statement closing dot "." should be placed on a new line.',
      expectedEndOfLine: 'Statement closing dot "." should be placed on the same line as the statement.',
    },
  },

  create(context) {
    const options = context.options[0] ?? {}
    const style = options.style ?? 'standalone'
    const allowSingleLine = options.allowSingleLine ?? false

    return {
      Program() {
        const sourceCode = context.sourceCode
        const tokens = sourceCode.parserServices?.rdf?.tokens ?? []

        let bracketDepth = 0
        let parenDepth = 0
        let inPrefix = false
        let statementStartLine = null

        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i]
          const valUpper = token.value.toUpperCase()

          if (valUpper === 'PREFIX' || valUpper === '@PREFIX' || valUpper === 'BASE' || valUpper === '@BASE') {
            inPrefix = true
            statementStartLine = null
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
            if (statementStartLine === null && bracketDepth === 0 && parenDepth === 0) {
              statementStartLine = token.loc.start.line
            }
            bracketDepth++
            continue
          }
          if (token.value === ']') {
            bracketDepth = Math.max(0, bracketDepth - 1)
            continue
          }
          if (token.value === '(') {
            if (statementStartLine === null && bracketDepth === 0 && parenDepth === 0) {
              statementStartLine = token.loc.start.line
            }
            parenDepth++
            continue
          }
          if (token.value === ')') {
            parenDepth = Math.max(0, parenDepth - 1)
            continue
          }

          if (token.value === '{' || token.value === '}') {
            statementStartLine = null
            continue
          }

          if (token.value === '.' && bracketDepth === 0 && parenDepth === 0) {
            // This is a statement-closing dot
            const prevToken = tokens[i - 1]
            const isSingleLine = statementStartLine !== null && statementStartLine === token.loc.start.line
            statementStartLine = null

            if (!prevToken) continue

            const isSameLine = prevToken.loc.end.line === token.loc.start.line

            if (style === 'standalone' && isSameLine) {
              if (allowSingleLine && isSingleLine) {
                continue
              }

              context.report({
                loc: token.loc,
                messageId: 'expectedStandalone',
                fix(fixer) {
                  return fixer.insertTextBeforeRange(token.range, '\n')
                },
              })
            }
            else if (style === 'end-of-line' && !isSameLine) {
              context.report({
                loc: token.loc,
                messageId: 'expectedEndOfLine',
                fix(fixer) {
                  return [
                    fixer.removeRange([prevToken.range[1], token.range[0]]),
                    fixer.insertTextAfterRange(prevToken.range, ' '),
                  ]
                },
              })
            }
            continue
          }

          if (statementStartLine === null && bracketDepth === 0 && parenDepth === 0) {
            statementStartLine = token.loc.start.line
          }
        }
      },
    }
  },
}
