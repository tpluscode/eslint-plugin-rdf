export default {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce formatting and wrapping for RDF blank nodes',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          multiline: {
            enum: ['as-needed', 'always', 'never'],
          },
          propertiesOnNewline: {
            type: 'boolean',
          },
          closeBracketOnNewline: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      mustBeMultiline: 'Blank node should be multi-line.',
      mustBeSingleLine: 'Blank node should be single-line.',
      closeBracketNewline: 'Closing bracket "]" in multi-line blank node must be on a new line.',
      propertyNewline: 'Properties in multi-line blank node must be on separate lines.',
      firstPropertyNewline: 'First property in multi-line blank node must be on a new line.',
    },
  },

  create(context) {
    const options = context.options[0] ?? {}
    const multiline = options.multiline ?? 'as-needed'
    const propertiesOnNewline = options.propertiesOnNewline ?? true
    const closeBracketOnNewline = options.closeBracketOnNewline ?? true

    return {
      Program() {
        const sourceCode = context.sourceCode
        const tokens = sourceCode.parserServices?.rdf?.tokens ?? []

        // Find matching pairs of [ and ]
        const stack = []
        const pairs = []

        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i]
          if (token.value === '[') {
            stack.push({ index: i, token })
          }
          else if (token.value === ']') {
            const open = stack.pop()
            if (open) {
              pairs.push({
                openIndex: open.index,
                closeIndex: i,
                openToken: open.token,
                closeToken: token,
              })
            }
          }
        }

        for (const pair of pairs) {
          const { openIndex, closeIndex, openToken, closeToken } = pair
          const insideTokens = tokens.slice(openIndex + 1, closeIndex)

          if (insideTokens.length === 0) {
            continue
          }

          const isSameLine = openToken.loc.start.line === closeToken.loc.end.line

          if (isSameLine) {
            if (multiline === 'always') {
              context.report({
                loc: openToken.loc,
                messageId: 'mustBeMultiline',
                fix(fixer) {
                  return [
                    fixer.insertTextAfterRange(openToken.range, '\n'),
                    fixer.insertTextBeforeRange(closeToken.range, '\n'),
                  ]
                },
              })
            }
            continue
          }

          // Multi-line blank node
          if (multiline === 'never') {
            context.report({
              loc: openToken.loc,
              messageId: 'mustBeSingleLine',
            })
            continue
          }

          // Check if first property is on the same line as [
          if (propertiesOnNewline && insideTokens.length > 0) {
            const firstToken = insideTokens[0]
            if (firstToken.loc.start.line === openToken.loc.end.line) {
              context.report({
                loc: firstToken.loc,
                messageId: 'firstPropertyNewline',
                fix(fixer) {
                  return fixer.insertTextBeforeRange(firstToken.range, '\n')
                },
              })
            }
          }

          // Check if closing bracket is on its own line
          if (closeBracketOnNewline && insideTokens.length > 0) {
            const lastToken = insideTokens[insideTokens.length - 1]
            if (lastToken.loc.end.line === closeToken.loc.start.line) {
              context.report({
                loc: closeToken.loc,
                messageId: 'closeBracketNewline',
                fix(fixer) {
                  return fixer.insertTextBeforeRange(closeToken.range, '\n')
                },
              })
            }
          }

          // Check semicolons inside this blank node
          if (propertiesOnNewline) {
            let depth = 0
            for (let i = openIndex + 1; i < closeIndex; i++) {
              const t = tokens[i]
              if (t.value === '[') depth++
              else if (t.value === ']') depth--
              else if (t.value === ';' && depth === 0) {
                const nextToken = tokens[i + 1]
                if (nextToken && nextToken.range[0] < closeToken.range[0]) {
                  if (nextToken.loc.start.line === t.loc.end.line) {
                    context.report({
                      loc: nextToken.loc,
                      messageId: 'propertyNewline',
                      fix(fixer) {
                        return fixer.insertTextBeforeRange(nextToken.range, '\n')
                      },
                    })
                  }
                }
              }
            }
          }
        }
      },
    }
  },
}
