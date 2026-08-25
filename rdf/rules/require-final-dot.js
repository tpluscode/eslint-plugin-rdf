function getLastSignificantToken(tokens) {
  for (let index = tokens.length - 1; index >= 0; index -= 1) {
    const token = tokens[index]

    if (token.type !== 'Unknown') {
      return token
    }
  }

  return undefined
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'require Turtle/TriG/N3 documents to end with a statement dot',
    },
    fixable: 'code',
    schema: [],
    messages: {
      missingFinalDot: 'RDF document should end with a final "." statement terminator.',
    },
  },

  create(context) {
    return {
      Program() {
        const tokens = context.sourceCode.parserServices?.rdf?.tokens ?? []
        const lastToken = getLastSignificantToken(tokens)

        if (!lastToken || lastToken.value === '.') {
          return
        }

        context.report({
          loc: lastToken.loc,
          messageId: 'missingFinalDot',
          fix(fixer) {
            return fixer.insertTextAfterRange(lastToken.range, ' .')
          },
        })
      },
    }
  },
}
