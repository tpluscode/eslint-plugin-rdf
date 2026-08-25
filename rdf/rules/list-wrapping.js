function getListItems(tokens, openIndex, closeIndex) {
  const items = []
  let i = openIndex + 1

  while (i < closeIndex) {
    const token = tokens[i]

    if (token.value === '(') {
      const startIndex = i
      let depth = 1
      i += 1
      while (i < closeIndex && depth > 0) {
        if (tokens[i].value === '(') depth += 1
        else if (tokens[i].value === ')') depth -= 1
        i += 1
      }
      const endIndex = i - 1
      items.push({
        startToken: tokens[startIndex],
        endToken: tokens[endIndex],
        startIndex,
        endIndex,
      })
    }
    else if (token.value === '[') {
      const startIndex = i
      let depth = 1
      i += 1
      while (i < closeIndex && depth > 0) {
        if (tokens[i].value === '[') depth += 1
        else if (tokens[i].value === ']') depth -= 1
        i += 1
      }
      const endIndex = i - 1
      items.push({
        startToken: tokens[startIndex],
        endToken: tokens[endIndex],
        startIndex,
        endIndex,
      })
    }
    else if (token.type === 'String') {
      const startIndex = i
      let endIndex = i
      if (tokens[i + 1]?.value === '^' && tokens[i + 2]?.value === '^') {
        if (tokens[i + 3]?.type === 'Identifier' || tokens[i + 3]?.type === 'IRI') {
          endIndex = i + 3
          i += 4
        }
        else {
          endIndex = i + 2
          i += 3
        }
      }
      else if (tokens[i + 1]?.type === 'Identifier' && tokens[i + 1]?.value.startsWith('@')) {
        endIndex = i + 1
        i += 2
      }
      else {
        i += 1
      }
      items.push({
        startToken: tokens[startIndex],
        endToken: tokens[endIndex],
        startIndex,
        endIndex,
      })
    }
    else if (token.value === ':' && tokens[i + 1]?.type === 'Identifier' && token.range[1] === tokens[i + 1].range[0]) {
      const startIndex = i
      const endIndex = i + 1
      items.push({
        startToken: tokens[startIndex],
        endToken: tokens[endIndex],
        startIndex,
        endIndex,
      })
      i += 2
    }
    else {
      items.push({
        startToken: token,
        endToken: token,
        startIndex: i,
        endIndex: i,
      })
      i += 1
    }
  }

  return items
}

function replaceWhitespaceWithNewline(fixer, sourceCode, start, end) {
  const text = sourceCode.text.slice(start, end)
  if (text.includes('#')) {
    return fixer.insertTextBeforeRange([end, end], '\n')
  }
  return fixer.replaceTextRange([start, end], '\n')
}

function isRdfCollection(tokens, openIndex, closeIndex) {
  const prevToken = tokens[openIndex - 1]
  if (prevToken) {
    if (prevToken.range[1] === tokens[openIndex].range[0]) {
      return false
    }
    const valUpper = prevToken.value.toUpperCase()
    if (['FILTER', 'BIND', 'HAVING', 'WHERE', 'IF', 'BOUND', 'EXISTS', 'NOT', 'AS', 'GROUP', 'ORDER', 'BY', 'VALUES', 'OPTIONAL', 'GRAPH', 'SERVICE'].includes(valUpper)) {
      return false
    }
  }

  for (let i = openIndex + 1; i < closeIndex; i++) {
    const t = tokens[i]
    if (
      ['||', '&&', '!=', '==', '<=', '>=', '=', '!', '|', 'AS', 'as', 'FILTER', 'filter', 'EXISTS', 'exists', 'NOT', 'not', 'BIND', 'bind', 'IF', 'if', 'BOUND', 'bound'].includes(t.value)
      || t.value === ','
    ) {
      return false
    }
  }

  return true
}

export default {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce formatting and wrapping for RDF collections/lists',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          multiline: {
            enum: ['as-needed', 'always', 'never'],
          },
          maxLineLength: {
            type: 'integer',
            minimum: 1,
          },
          maxItems: {
            type: 'integer',
            minimum: 1,
          },
          itemPerLine: {
            type: 'boolean',
          },
          firstItemOnNewline: {
            type: 'boolean',
          },
          closeParenOnNewline: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      mustBeMultiline: 'List should be multi-line.',
      mustBeSingleLine: 'List should be single-line.',
      closeParenNewline: 'Closing parenthesis ")" in multi-line list must be on a new line.',
      itemNewline: 'Items in multi-line list must be on separate lines.',
      firstItemNewline: 'First item in multi-line list must be on a new line.',
    },
  },

  create(context) {
    const options = context.options[0] ?? {}
    const multiline = options.multiline ?? 'as-needed'
    const maxLineLength = options.maxLineLength
    const maxItems = options.maxItems
    const itemPerLine = options.itemPerLine ?? true
    const firstItemOnNewline = options.firstItemOnNewline ?? true
    const closeParenOnNewline = options.closeParenOnNewline ?? true

    return {
      Program() {
        const sourceCode = context.sourceCode
        const lines = sourceCode.getLines ? sourceCode.getLines() : sourceCode.lines
        const tokens = sourceCode.parserServices?.rdf?.tokens ?? []

        // Find matching pairs of ( and )
        const stack = []
        const pairs = []

        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i]
          if (token.value === '(') {
            stack.push({ index: i, token })
          }
          else if (token.value === ')') {
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

          if (!isRdfCollection(tokens, openIndex, closeIndex)) {
            continue
          }

          const insideTokens = tokens.slice(openIndex + 1, closeIndex)

          if (insideTokens.length === 0) {
            continue
          }

          const items = getListItems(tokens, openIndex, closeIndex)
          if (items.length === 0) {
            continue
          }

          const isSameLine = openToken.loc.start.line === closeToken.loc.end.line
          const lineIndex = openToken.loc.start.line - 1
          const lineLength = lines[lineIndex] ? lines[lineIndex].length : 0

          const shouldBeMultiline = items.length > 0 && (
            multiline === 'always'
            || (typeof maxLineLength === 'number' && lineLength > maxLineLength)
            || (typeof maxItems === 'number' && items.length > maxItems)
          )

          if (isSameLine) {
            if (shouldBeMultiline) {
              context.report({
                loc: openToken.loc,
                messageId: 'mustBeMultiline',
                fix(fixer) {
                  const fixes = []
                  if (firstItemOnNewline && items.length > 0) {
                    fixes.push(replaceWhitespaceWithNewline(fixer, sourceCode, openToken.range[1], items[0].startToken.range[0]))
                  }
                  if (itemPerLine) {
                    for (let k = 1; k < items.length; k++) {
                      fixes.push(replaceWhitespaceWithNewline(fixer, sourceCode, items[k - 1].endToken.range[1], items[k].startToken.range[0]))
                    }
                  }
                  if (closeParenOnNewline && items.length > 0) {
                    fixes.push(replaceWhitespaceWithNewline(fixer, sourceCode, items[items.length - 1].endToken.range[1], closeToken.range[0]))
                  }
                  return fixes
                },
              })
            }
            continue
          }

          // Multi-line list
          if (multiline === 'never') {
            context.report({
              loc: openToken.loc,
              messageId: 'mustBeSingleLine',
            })
            continue
          }

          // Check if first item is on the same line as (
          if (firstItemOnNewline && items.length > 0) {
            const firstItem = items[0]
            if (firstItem.startToken.loc.start.line === openToken.loc.end.line) {
              context.report({
                loc: firstItem.startToken.loc,
                messageId: 'firstItemNewline',
                fix(fixer) {
                  return replaceWhitespaceWithNewline(fixer, sourceCode, openToken.range[1], firstItem.startToken.range[0])
                },
              })
            }
          }

          // Check if items are on separate lines
          if (itemPerLine) {
            for (let k = 1; k < items.length; k++) {
              const prevItem = items[k - 1]
              const currentItem = items[k]
              if (currentItem.startToken.loc.start.line === prevItem.endToken.loc.end.line) {
                context.report({
                  loc: currentItem.startToken.loc,
                  messageId: 'itemNewline',
                  fix(fixer) {
                    return replaceWhitespaceWithNewline(fixer, sourceCode, prevItem.endToken.range[1], currentItem.startToken.range[0])
                  },
                })
              }
            }
          }

          // Check if closing parenthesis is on its own line
          if (closeParenOnNewline && items.length > 0) {
            const lastItem = items[items.length - 1]
            if (lastItem.endToken.loc.end.line === closeToken.loc.start.line) {
              context.report({
                loc: closeToken.loc,
                messageId: 'closeParenNewline',
                fix(fixer) {
                  return replaceWhitespaceWithNewline(fixer, sourceCode, lastItem.endToken.range[1], closeToken.range[0])
                },
              })
            }
          }
        }
      },
    }
  },
}
