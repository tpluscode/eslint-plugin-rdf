export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce consistent style for RDF prefix declarations (SPARQL vs Turtle style)',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          style: {
            enum: ['sparql', 'turtle'],
          },
          case: {
            enum: ['upper', 'lower'],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      expectedSparql: 'Prefix declaration should use SPARQL style ("{{ keyword }} {{ name }}: <{{ iri }}>").',
      expectedTurtle: 'Prefix declaration should use Turtle style ("{{ keyword }} {{ name }}: <{{ iri }}> .").',
    },
  },

  create(context) {
    const options = context.options[0] ?? {}
    const style = options.style ?? 'sparql'
    const keywordCase = options.case ?? 'upper'

    return {
      Program() {
        const sourceCode = context.sourceCode
        const declarations = sourceCode.parserServices?.rdf?.prefixDeclarations ?? []

        for (const declaration of declarations) {
          const rawPrefixToken = declaration.prefixToken.value
          const isTurtleRaw = rawPrefixToken.startsWith('@')
          const hasDot = !!declaration.dotToken

          const isSparql = !isTurtleRaw && !hasDot
          const isTurtle = isTurtleRaw && hasDot

          const expectedKeyword = style === 'sparql'
            ? (keywordCase === 'lower' ? 'prefix' : 'PREFIX')
            : (keywordCase === 'lower' ? '@prefix' : '@PREFIX')

          const keywordMatches = rawPrefixToken === expectedKeyword

          if (style === 'sparql' && (!isSparql || !keywordMatches)) {
            context.report({
              loc: declaration.loc,
              messageId: 'expectedSparql',
              data: {
                keyword: expectedKeyword,
                name: declaration.name,
                iri: declaration.iri,
              },
              fix(fixer) {
                const replacement = `${expectedKeyword} ${declaration.name}: <${declaration.iri}>`
                return fixer.replaceTextRange(declaration.range, replacement)
              },
            })
          }
          else if (style === 'turtle' && (!isTurtle || !keywordMatches)) {
            context.report({
              loc: declaration.loc,
              messageId: 'expectedTurtle',
              data: {
                keyword: expectedKeyword,
                name: declaration.name,
                iri: declaration.iri,
              },
              fix(fixer) {
                const replacement = `${expectedKeyword} ${declaration.name}: <${declaration.iri}> .`
                return fixer.replaceTextRange(declaration.range, replacement)
              },
            })
          }
        }
      },
    }
  },
}
