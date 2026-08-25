export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow duplicate RDF prefix declarations',
    },
    schema: [],
    messages: {
      duplicatePrefix: 'Duplicate prefix "{{ name }}". First declared on line {{ line }}.',
    },
  },

  create(context) {
    return {
      Program() {
        const declarations = context.sourceCode.parserServices?.rdf?.prefixDeclarations ?? []
        const seen = new Map()

        for (const declaration of declarations) {
          const previous = seen.get(declaration.name)

          if (previous) {
            context.report({
              loc: declaration.nameToken.loc,
              messageId: 'duplicatePrefix',
              data: {
                name: declaration.name,
                line: previous.nameToken.loc.start.line,
              },
            })
            continue
          }

          seen.set(declaration.name, declaration)
        }
      },
    }
  },
}
