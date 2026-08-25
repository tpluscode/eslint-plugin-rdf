export default {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce consistent spacing before semicolons in RDF documents',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          before: {
            enum: ['space', 'no-space', 'ignore'],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      expectedSpace: 'Expected space before ";".',
      unexpectedSpace: 'Unexpected whitespace before ";".',
    },
  },

  create(context) {
    const options = context.options[0] ?? {}
    const before = options.before ?? 'space'

    if (before === 'ignore') {
      return {}
    }

    return {
      Program() {
        const sourceCode = context.sourceCode
        const tokens = sourceCode.parserServices?.rdf?.tokens ?? []

        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i]

          if (token.value === ';') {
            const prevToken = tokens[i - 1]
            if (!prevToken) continue

            // Only check if on the same line
            if (prevToken.loc.end.line === token.loc.start.line) {
              const textBetween = sourceCode.getText().slice(prevToken.range[1], token.range[0])
              const hasSpace = textBetween === ' '

              if (before === 'space' && !hasSpace) {
                context.report({
                  loc: token.loc,
                  messageId: 'expectedSpace',
                  fix(fixer) {
                    return fixer.replaceTextRange([prevToken.range[1], token.range[0]], ' ')
                  },
                })
              }
              else if (before === 'no-space' && textBetween.length > 0) {
                context.report({
                  loc: token.loc,
                  messageId: 'unexpectedSpace',
                  fix(fixer) {
                    return fixer.removeRange([prevToken.range[1], token.range[0]])
                  },
                })
              }
            }
          }
        }
      },
    }
  },
}
