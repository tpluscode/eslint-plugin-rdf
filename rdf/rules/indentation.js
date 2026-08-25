export default {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce consistent indentation for RDF documents',
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
          dotIndent: {
            enum: ['subject', 'predicate'],
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
    const dotIndent = options.dotIndent ?? 'subject'

    return {
      Program() {
        const sourceCode = context.sourceCode
        const lines = sourceCode.getLines ? sourceCode.getLines() : sourceCode.lines
        const tokens = sourceCode.parserServices?.rdf?.tokens ?? []
        const comments = sourceCode.parserServices?.rdf?.comments ?? []

        // Map line number -> { expectedIndent, line }
        const expectedIndents = new Map()

        let graphDepth = 0
        let inStatement = false
        let statementBaseIndent = 0
        const bracketStack = [] // [{ type, line, indent }]

        let inPrefix = false

        // Combine tokens and comments in source order
        const items = [
          ...tokens.map(t => ({ ...t, isComment: false })),
          ...comments.map(c => ({ ...c, isComment: true })),
        ].sort((a, b) => a.range[0] - b.range[0])

        for (let i = 0; i < items.length; i++) {
          const item = items[i]

          if (item.isComment) {
            const line = item.loc.start.line
            if (!expectedIndents.has(line)) {
              if (inStatement) {
                const currentIndent = bracketStack.length > 0
                  ? bracketStack[bracketStack.length - 1].indent
                  : statementBaseIndent + spaces
                expectedIndents.set(line, currentIndent)
              }
              else {
                expectedIndents.set(line, graphDepth * spaces)
              }
            }
            continue
          }

          const token = item
          const valUpper = token.value.toUpperCase()

          if (valUpper === 'PREFIX' || valUpper === '@PREFIX' || valUpper === 'BASE' || valUpper === '@BASE') {
            inPrefix = true
            const line = token.loc.start.line
            if (!expectedIndents.has(line)) {
              expectedIndents.set(line, graphDepth * spaces)
            }
            continue
          }

          if (inPrefix) {
            if (token.value === '.' || token.type === 'IRI') {
              // End of prefix / base
              if (token.value === '.' || tokens[i + 1]?.value !== '.') {
                inPrefix = false
              }
            }
            const line = token.loc.start.line
            if (!expectedIndents.has(line)) {
              expectedIndents.set(line, graphDepth * spaces)
            }
            continue
          }

          if (token.value === '{') {
            const line = token.loc.start.line
            if (!expectedIndents.has(line)) {
              expectedIndents.set(line, graphDepth * spaces)
            }
            graphDepth += 1
            inStatement = false
            continue
          }

          if (token.value === '}') {
            graphDepth = Math.max(0, graphDepth - 1)
            const line = token.loc.start.line
            if (!expectedIndents.has(line)) {
              expectedIndents.set(line, graphDepth * spaces)
            }
            inStatement = false
            continue
          }

          if (token.value === '[') {
            const line = token.loc.start.line
            const parentIndent = bracketStack.length > 0
              ? bracketStack[bracketStack.length - 1].indent + spaces
              : (inStatement ? statementBaseIndent + spaces : graphDepth * spaces)

            bracketStack.push({ type: '[', line, indent: parentIndent })

            if (!inStatement && bracketStack.length === 1) {
              inStatement = true
              statementBaseIndent = graphDepth * spaces
              if (!expectedIndents.has(line)) {
                expectedIndents.set(line, statementBaseIndent)
              }
            }
            else if (!expectedIndents.has(line)) {
              expectedIndents.set(line, parentIndent)
            }
            continue
          }

          if (token.value === ']') {
            const top = bracketStack.pop()
            const line = token.loc.start.line
            const closingIndent = top ? top.indent : graphDepth * spaces
            if (!expectedIndents.has(line)) {
              expectedIndents.set(line, closingIndent)
            }
            continue
          }

          if (token.value === '(') {
            const line = token.loc.start.line
            const parentIndent = bracketStack.length > 0
              ? bracketStack[bracketStack.length - 1].indent + spaces
              : (inStatement ? statementBaseIndent + spaces : graphDepth * spaces)

            bracketStack.push({ type: '(', line, indent: parentIndent })
            if (!expectedIndents.has(line)) {
              expectedIndents.set(line, parentIndent)
            }
            continue
          }

          if (token.value === ')') {
            const top = bracketStack.pop()
            const line = token.loc.start.line
            const closingIndent = top ? top.indent : graphDepth * spaces
            if (!expectedIndents.has(line)) {
              expectedIndents.set(line, closingIndent)
            }
            continue
          }

          if (token.value === '.' && bracketStack.length === 0) {
            const line = token.loc.start.line
            if (!expectedIndents.has(line)) {
              const dotExpected = dotIndent === 'predicate'
                ? statementBaseIndent + spaces
                : statementBaseIndent
              expectedIndents.set(line, dotExpected)
            }
            inStatement = false
            continue
          }

          // Other tokens
          const line = token.loc.start.line
          if (!inStatement) {
            inStatement = true
            statementBaseIndent = graphDepth * spaces
            if (!expectedIndents.has(line)) {
              expectedIndents.set(line, statementBaseIndent)
            }
          }
          else if (!expectedIndents.has(line)) {
            const currentIndent = bracketStack.length > 0
              ? bracketStack[bracketStack.length - 1].indent + spaces
              : statementBaseIndent + spaces
            expectedIndents.set(line, currentIndent)
          }
        }

        // Now validate each line
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
                  return fixer.replaceTextRange([rangeStart, rangeEnd], '')
                },
              })
            }
            continue
          }

          const match = lineText.match(/^(\s*)/)
          const actualIndent = match ? match[1].length : 0
          const expected = expectedIndents.get(lineNumber)

          if (expected !== undefined && actualIndent !== expected) {
            const rangeStart = sourceCode.getIndexFromLoc({ line: lineNumber, column: 0 })
            const rangeEnd = rangeStart + actualIndent
            context.report({
              loc: {
                start: { line: lineNumber, column: 0 },
                end: { line: lineNumber, column: actualIndent },
              },
              messageId: 'wrongIndentation',
              data: {
                expected,
                actual: actualIndent,
              },
              fix(fixer) {
                return fixer.replaceTextRange([rangeStart, rangeEnd], ' '.repeat(expected))
              },
            })
          }
        }
      },
    }
  },
}
