export default {
  meta: {
    type: 'layout',
    docs: {
      description: 'require each predicate in a multi-predicate statement to start on a new line',
    },
    fixable: 'code',
    schema: [],
    messages: {
      predicateNewline: 'Predicate must be placed on a new line.',
    },
  },

  create(context) {
    return {
      Program() {
        const sourceCode = context.sourceCode
        const tokens = sourceCode.parserServices?.rdf?.tokens ?? []

        let bracketDepth = 0
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

          if (token.value === ';') {
            // Find the next significant token
            const nextToken = tokens[i + 1]
            if (!nextToken) continue

            // If next token is statement terminator '.', closing bracket ']', or closing graph '}', skip
            if (nextToken.value === '.' || nextToken.value === ']' || nextToken.value === '}') {
              continue
            }

            // Next token is the start of another predicate
            if (nextToken.loc.start.line === token.loc.end.line) {
              context.report({
                loc: nextToken.loc,
                messageId: 'predicateNewline',
                fix(fixer) {
                  return fixer.insertTextBeforeRange(nextToken.range, '\n')
                },
              })
            }
          }
        }
      },
    }
  },
}
