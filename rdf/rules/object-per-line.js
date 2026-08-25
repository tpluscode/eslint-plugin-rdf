export default {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce placing each object in a multi-object list on a new line',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          mode: {
            enum: ['as-needed', 'multiline'],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      objectNewline: 'Object after comma "," must be placed on a new line.',
    },
  },

  create(context) {
    const options = context.options[0] ?? {}
    const mode = options.mode ?? 'as-needed'

    return {
      Program() {
        const sourceCode = context.sourceCode
        const tokens = sourceCode.parserServices?.rdf?.tokens ?? []

        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i]

          if (token.value === ',') {
            const nextToken = tokens[i + 1]
            if (!nextToken) continue

            const isSameLine = token.loc.end.line === nextToken.loc.start.line

            if (mode === 'multiline' && isSameLine) {
              context.report({
                loc: nextToken.loc,
                messageId: 'objectNewline',
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
