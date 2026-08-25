export default {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce consistent indentation for SPARQL queries and update files',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          spaces: {
            type: 'integer',
            minimum: 1,
            maximum: 8,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      wrongIndentation: 'Expected indentation of {{ expected }} spaces but found {{ actual }}.',
      noWhitespaceOnEmptyLine: 'Empty line should not contain whitespace.',
    },
  },

  create(context) {
    const options = context.options[0] ?? {}
    const spaces = options.spaces ?? 4

    return {
      Program() {
        const sourceCode = context.sourceCode
        const lines = sourceCode.getLines ? sourceCode.getLines() : sourceCode.lines
        const tokens = sourceCode.parserServices?.sparql?.tokens
          ?? sourceCode.parserServices?.rdf?.tokens
          ?? []
        const comments = sourceCode.parserServices?.sparql?.comments
          ?? sourceCode.parserServices?.rdf?.comments
          ?? []

        const expectedIndents = new Map()

        let blockDepth = 0
        let inTriple = false
        let tripleBaseIndent = 0
        const bracketStack = []
        let inPrefix = false

        const items = [
          ...tokens.map(t => ({ ...t, isComment: false })),
          ...comments.map(c => ({ ...c, isComment: true })),
        ].sort((a, b) => a.range[0] - b.range[0])

        for (let i = 0; i < items.length; i++) {
          const item = items[i]

          if (item.isComment) {
            const line = item.loc.start.line
            if (!expectedIndents.has(line)) {
              if (bracketStack.length > 0) {
                expectedIndents.set(line, bracketStack[bracketStack.length - 1].indent)
              }
              else if (inTriple) {
                expectedIndents.set(line, tripleBaseIndent + spaces)
              }
              else {
                expectedIndents.set(line, blockDepth * spaces)
              }
            }
            continue
          }

          const token = item
          const valUpper = token.value.toUpperCase()

          if (valUpper === 'PREFIX' || valUpper === 'BASE') {
            inPrefix = true
            const line = token.loc.start.line
            if (!expectedIndents.has(line)) {
              expectedIndents.set(line, blockDepth * spaces)
            }
            continue
          }

          if (inPrefix) {
            if (token.value === '.' || token.type === 'IRI') {
              if (token.value === '.' || tokens[i + 1]?.value !== '.') {
                inPrefix = false
              }
            }
            const line = token.loc.start.line
            if (!expectedIndents.has(line)) {
              expectedIndents.set(line, blockDepth * spaces)
            }
            continue
          }

          if (token.value === '{') {
            const line = token.loc.start.line
            if (!expectedIndents.has(line)) {
              if (bracketStack.length > 0) {
                expectedIndents.set(line, bracketStack[bracketStack.length - 1].indent)
              }
              else {
                expectedIndents.set(line, blockDepth * spaces)
              }
            }
            blockDepth += 1
            inTriple = false
            continue
          }

          if (token.value === '}') {
            blockDepth = Math.max(0, blockDepth - 1)
            const line = token.loc.start.line
            if (!expectedIndents.has(line)) {
              if (bracketStack.length > 0) {
                expectedIndents.set(line, bracketStack[bracketStack.length - 1].indent)
              }
              else {
                expectedIndents.set(line, blockDepth * spaces)
              }
            }
            inTriple = false
            continue
          }

          if (token.value === '(' || token.value === '[') {
            const line = token.loc.start.line
            const parentIndent = bracketStack.length > 0
              ? bracketStack[bracketStack.length - 1].indent + spaces
              : (inTriple ? tripleBaseIndent + spaces : blockDepth * spaces + spaces)

            bracketStack.push({ type: token.value, line, indent: parentIndent })

            if (!expectedIndents.has(line)) {
              if (inTriple) {
                expectedIndents.set(line, tripleBaseIndent + spaces)
              }
              else {
                expectedIndents.set(line, blockDepth * spaces)
              }
            }
            continue
          }

          if (token.value === ')' || token.value === ']') {
            const top = bracketStack.pop()
            const line = token.loc.start.line
            const closingIndent = top ? (top.indent - spaces) : blockDepth * spaces
            if (!expectedIndents.has(line)) {
              expectedIndents.set(line, closingIndent)
            }
            inTriple = false
            continue
          }

          if (token.value === '.') {
            const line = token.loc.start.line
            if (!expectedIndents.has(line)) {
              expectedIndents.set(line, blockDepth * spaces)
            }
            inTriple = false
            continue
          }

          if (token.value === ';') {
            const line = token.loc.start.line
            if (!expectedIndents.has(line)) {
              expectedIndents.set(line, tripleBaseIndent + spaces)
            }
            inTriple = true
            continue
          }

          const line = token.loc.start.line

          if (bracketStack.length > 0) {
            if (!expectedIndents.has(line)) {
              expectedIndents.set(line, bracketStack[bracketStack.length - 1].indent)
            }
            continue
          }

          if (!inTriple) {
            tripleBaseIndent = blockDepth * spaces
            if (!expectedIndents.has(line)) {
              expectedIndents.set(line, tripleBaseIndent)
            }
          }
          else if (!expectedIndents.has(line)) {
            expectedIndents.set(line, tripleBaseIndent + spaces)
          }
        }

        // Validate each line
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
          const lineNumber = lineIndex + 1
          const lineText = lines[lineIndex]

          if (/^\s*$/.test(lineText)) {
            if (lineText.length > 0) {
              const rangeStart = sourceCode.getIndexFromLoc({ line: lineNumber, column: 0 })
              const rangeEnd = rangeStart + lineText.length
              context.report({
                loc: {
                  start: { line: lineNumber, column: 0 },
                  end: { line: lineNumber, column: lineText.length },
                },
                messageId: 'noWhitespaceOnEmptyLine',
                fix(fixer) {
                  return fixer.removeRange([rangeStart, rangeEnd])
                },
              })
            }
            continue
          }

          if (!expectedIndents.has(lineNumber)) {
            continue
          }

          const expectedIndent = expectedIndents.get(lineNumber)
          const actualIndent = lineText.match(/^ */u)[0].length

          if (actualIndent !== expectedIndent) {
            const rangeStart = sourceCode.getIndexFromLoc({ line: lineNumber, column: 0 })
            const rangeEnd = rangeStart + actualIndent
            const replacement = ' '.repeat(expectedIndent)

            context.report({
              loc: {
                start: { line: lineNumber, column: 0 },
                end: { line: lineNumber, column: actualIndent },
              },
              messageId: 'wrongIndentation',
              data: {
                expected: expectedIndent,
                actual: actualIndent,
              },
              fix(fixer) {
                return fixer.replaceTextRange([rangeStart, rangeEnd], replacement)
              },
            })
          }
        }
      },
    }
  },
}
