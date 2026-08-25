function buildLineStarts(source) {
  const starts = [0]

  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === '\n') {
      starts.push(index + 1)
    }
  }

  return starts
}

function getLocFromIndex(lineStarts, index) {
  let low = 0
  let high = lineStarts.length - 1

  while (low <= high) {
    const middle = Math.floor((low + high) / 2)

    if (lineStarts[middle] <= index) {
      low = middle + 1
    }
    else {
      high = middle - 1
    }
  }

  const lineIndex = Math.max(0, high)

  return {
    line: lineIndex + 1,
    column: index - lineStarts[lineIndex],
  }
}

function createRangeLocation(lineStarts, start, end) {
  return {
    range: [start, end],
    loc: {
      start: getLocFromIndex(lineStarts, start),
      end: getLocFromIndex(lineStarts, end),
    },
  }
}

function createToken(lineStarts, type, value, start, end) {
  return {
    type,
    value,
    ...createRangeLocation(lineStarts, start, end),
  }
}

// ESLint only honours these directives when they come from a block comment.
// Turtle has no block comments, so report them as `Block` to make the whole
// set of directive comments usable with a plain `#` comment.
const blockOnlyDirective = /^\s*(?:eslint|eslint-enable|eslint-disable|exported|globals?)(?:\s|$)/u

function getCommentType(value) {
  const [directivePart] = value.split(/\s--\s/u)

  return blockOnlyDirective.test(directivePart) ? 'Block' : 'Line'
}

function isWhitespace(character) {
  return /\s/u.test(character)
}

function isNameStart(character) {
  return /[A-Za-z_]/u.test(character)
}

function isNamePart(character) {
  return /[A-Za-z0-9_.-]/u.test(character)
}

function readUntil(source, start, predicate) {
  let end = start

  while (end < source.length && !predicate(source[end], end)) {
    end += 1
  }

  return end
}

function readString(source, start) {
  const quote = source[start]
  const isTriple = source.slice(start, start + 3) === quote.repeat(3)
  let end = start + (isTriple ? 3 : 1)

  while (end < source.length) {
    if (source[end] === '\\') {
      end += 2
      continue
    }

    if (isTriple && source.slice(end, end + 3) === quote.repeat(3)) {
      return end + 3
    }

    if (!isTriple && source[end] === quote) {
      return end + 1
    }

    end += 1
  }

  return end
}

function readIri(source, start) {
  let end = start + 1

  while (end < source.length && source[end] !== '>' && !isWhitespace(source[end])) {
    end += 1
  }

  if (end < source.length && source[end] === '>') {
    return end + 1
  }

  return start
}

function readIdentifierOrPrefixedName(source, start) {
  let end = start

  if (source[end] === '@' || source[end] === '?' || source[end] === '$') {
    end += 1
  }

  while (end < source.length && isNamePart(source[end])) {
    end += 1
  }

  if (source[end] === ':') {
    end += 1

    while (end < source.length && /[^\s;,.()[\]{}<>|/*+?!^=~&]/u.test(source[end])) {
      end += 1
    }
  }

  return end
}

function tokenize(source, lineStarts) {
  const tokens = []
  const comments = []
  let index = 0

  while (index < source.length) {
    const character = source[index]

    if (isWhitespace(character)) {
      index += 1
      continue
    }

    if (character === '#') {
      const end = readUntil(source, index, char => char === '\n')
      const value = source.slice(index + 1, end)
      comments.push(createToken(lineStarts, getCommentType(value), value, index, end))
      index = end
      continue
    }

    const twoChars = source.slice(index, index + 2)
    if (
      twoChars === '&&'
      || twoChars === '||'
      || twoChars === '!='
      || twoChars === '<='
      || twoChars === '>='
      || twoChars === '=='
      || twoChars === '^^'
    ) {
      tokens.push(createToken(lineStarts, 'Punctuator', twoChars, index, index + 2))
      index += 2
      continue
    }

    if (character === '<') {
      const end = readIri(source, index)
      if (end > index) {
        tokens.push(createToken(lineStarts, 'IRI', source.slice(index, end), index, end))
        index = end
        continue
      }
      tokens.push(createToken(lineStarts, 'Punctuator', '<', index, index + 1))
      index += 1
      continue
    }

    if (character === '"' || character === '\'') {
      const end = readString(source, index)
      tokens.push(createToken(lineStarts, 'String', source.slice(index, end), index, end))
      index = end
      continue
    }

    if ('{}[]();,.^|*+!/=&~>'.includes(character)) {
      tokens.push(createToken(lineStarts, 'Punctuator', character, index, index + 1))
      index += 1
      continue
    }

    if (/[0-9]/u.test(character) || ((character === '+' || character === '-') && /[0-9]/u.test(source[index + 1]))) {
      let end = index + 1
      while (end < source.length && /[0-9.eE+-]/u.test(source[end])) {
        end += 1
      }
      tokens.push(createToken(lineStarts, 'Identifier', source.slice(index, end), index, end))
      index = end
      continue
    }

    if (
      isNameStart(character)
      || character === '@'
      || character === ':'
      || character === '?'
      || character === '$'
    ) {
      const end = readIdentifierOrPrefixedName(source, index)

      if (end === index) {
        tokens.push(createToken(lineStarts, 'Unknown', character, index, index + 1))
        index += 1
        continue
      }

      tokens.push(createToken(lineStarts, 'Identifier', source.slice(index, end), index, end))
      index = end
      continue
    }

    tokens.push(createToken(lineStarts, 'Unknown', character, index, index + 1))
    index += 1
  }

  return {
    tokens,
    comments,
  }
}

function getPrefixDeclarations(tokens) {
  const declarations = []

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]
    const value = token.value.toUpperCase()

    if (value !== 'PREFIX' && value !== '@PREFIX') {
      continue
    }

    const nameToken = tokens[index + 1]
    const iriToken = tokens[index + 2]

    if (!nameToken || !iriToken) {
      continue
    }

    if (!nameToken.value.endsWith(':') || iriToken.type !== 'IRI') {
      continue
    }

    const dotToken = tokens[index + 3]?.value === '.' ? tokens[index + 3] : undefined
    const endToken = dotToken || iriToken

    declarations.push({
      type: 'RdfPrefixDeclaration',
      name: nameToken.value.slice(0, -1),
      iri: iriToken.value.slice(1, -1),
      prefixToken: token,
      nameToken,
      iriToken,
      dotToken,
      range: [token.range[0], endToken.range[1]],
      loc: {
        start: token.loc.start,
        end: endToken.loc.end,
      },
    })
  }

  return declarations
}

function parseForESLint(source, options = {}) {
  const lineStarts = buildLineStarts(source)
  const { tokens, comments } = tokenize(source, lineStarts)
  const body = getPrefixDeclarations(tokens)

  const ast = {
    type: 'Program',
    sourceType: 'script',
    body,
    comments,
    tokens,
    range: [0, source.length],
    loc: {
      start: {
        line: 1,
        column: 0,
      },
      end: getLocFromIndex(lineStarts, source.length),
    },
  }

  return {
    ast,
    services: {
      rdf: {
        source,
        tokens,
        comments,
        prefixDeclarations: body,
        fileType: options.fileType,
      },
    },
    visitorKeys: {
      Program: ['body'],
      RdfPrefixDeclaration: [],
    },
  }
}

export default {
  meta: {
    name: '@local/rdf-parser',
    version: '0.0.0',
  },
  parseForESLint,
}
