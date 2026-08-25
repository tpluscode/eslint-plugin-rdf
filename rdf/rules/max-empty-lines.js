export default {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce a maximum number of consecutive empty lines in RDF documents',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          max: {
            type: 'integer',
            minimum: 0,
          },
          maxEOF: {
            type: 'integer',
            minimum: 0,
          },
          maxBOF: {
            type: 'integer',
            minimum: 0,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      tooManyBlankLines: 'Too many blank lines ({{ actual }}). Maximum allowed is {{ max }}.',
    },
  },

  create(context) {
    const options = context.options[0] ?? {}
    const max = options.max ?? 1
    const maxEOF = options.maxEOF ?? 0
    const maxBOF = options.maxBOF ?? 0

    return {
      Program() {
        const sourceCode = context.sourceCode
        const lines = sourceCode.getLines ? sourceCode.getLines() : sourceCode.lines

        // If source ends with newline, the last element in lines is "" representing after \n
        const hasTrailingNewline = sourceCode.getText().endsWith('\n')
        const effectiveLines = hasTrailingNewline ? lines.slice(0, -1) : lines

        let consecutiveBlank = 0
        let blankStartLine = 0

        for (let i = 0; i < effectiveLines.length; i++) {
          const lineNumber = i + 1
          const lineText = effectiveLines[i]
          const isBlank = lineText.trim() === ''

          if (isBlank) {
            if (consecutiveBlank === 0) {
              blankStartLine = lineNumber
            }
            consecutiveBlank++
          }
          else {
            if (consecutiveBlank > 0) {
              const isBOF = blankStartLine === 1
              const allowed = isBOF ? maxBOF : max

              if (consecutiveBlank > allowed) {
                const startLine = isBOF ? 1 : blankStartLine + allowed
                const startRange = sourceCode.getIndexFromLoc({ line: startLine, column: 0 })
                const endRange = sourceCode.getIndexFromLoc({ line: lineNumber, column: 0 })

                context.report({
                  loc: {
                    start: { line: startLine, column: 0 },
                    end: { line: lineNumber - 1, column: 0 },
                  },
                  messageId: 'tooManyBlankLines',
                  data: {
                    actual: consecutiveBlank,
                    max: allowed,
                  },
                  fix(fixer) {
                    return fixer.removeRange([startRange, endRange])
                  },
                })
              }
              consecutiveBlank = 0
            }
          }
        }

        // EOF blank lines check
        if (consecutiveBlank > maxEOF) {
          const startLine = Math.max(1, effectiveLines.length - consecutiveBlank + 1 + maxEOF)
          const startRange = sourceCode.getIndexFromLoc({ line: startLine, column: 0 })
          const endRange = sourceCode.getText().length

          context.report({
            loc: {
              start: { line: startLine, column: 0 },
              end: { line: lines.length, column: lines[lines.length - 1].length },
            },
            messageId: 'tooManyBlankLines',
            data: {
              actual: consecutiveBlank,
              max: maxEOF,
            },
            fix(fixer) {
              return fixer.removeRange([startRange, endRange])
            },
          })
        }
      },
    }
  },
}
