export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow declared RDF prefixes that are never used',
    },
    fixable: 'code',
    schema: [],
    messages: {
      unusedPrefix: 'Prefix "{{ name }}" is declared but never used.',
    },
  },

  create(context) {
    return {
      Program() {
        const sourceCode = context.sourceCode
        const declarations = sourceCode.parserServices?.rdf?.prefixDeclarations ?? []
        const tokens = sourceCode.parserServices?.rdf?.tokens ?? []

        if (declarations.length === 0) {
          return
        }

        // Collect all ranges occupied by prefix declarations to ignore their own tokens
        const declarationRanges = declarations.map(d => d.range)

        const usedPrefixes = new Set()

        for (const token of tokens) {
          // Check if token is inside any prefix declaration
          const isDeclToken = declarationRanges.some(
            range => token.range[0] >= range[0] && token.range[1] <= range[1],
          )
          if (isDeclToken) {
            continue
          }

          if (token.type === 'Identifier') {
            const colonIndex = token.value.indexOf(':')
            if (colonIndex !== -1) {
              const prefixPart = token.value.slice(0, colonIndex)
              usedPrefixes.add(prefixPart)
            }
          }
        }

        for (const declaration of declarations) {
          if (!usedPrefixes.has(declaration.name)) {
            context.report({
              loc: declaration.loc,
              messageId: 'unusedPrefix',
              data: {
                name: declaration.name,
              },
              fix(fixer) {
                // Remove the prefix declaration and the trailing newline if on its own line
                const lines = sourceCode.getLines ? sourceCode.getLines() : sourceCode.lines
                const lineIndex = declaration.loc.start.line - 1
                const lineText = lines[lineIndex]
                if (lineText && lineText.trim() === sourceCode.getText(declaration).trim()) {
                  const lineStart = sourceCode.getIndexFromLoc({ line: declaration.loc.start.line, column: 0 })
                  const isLastLine = declaration.loc.start.line === lines.length
                  const lineEnd = isLastLine
                    ? lineStart + lineText.length
                    : sourceCode.getIndexFromLoc({ line: declaration.loc.start.line + 1, column: 0 })

                  return fixer.removeRange([lineStart, lineEnd])
                }

                return fixer.removeRange(declaration.range)
              },
            })
          }
        }
      },
    }
  },
}
