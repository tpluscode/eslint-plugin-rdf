import { findMatchingPrefix } from '../../utils/vocabularies.js'

function getDeclarationStyle(declarations, sourceCode, isSparql) {
  if (isSparql) {
    return 'sparql'
  }

  if (declarations.length > 0) {
    const firstText = sourceCode.getText(declarations[0])
    if (firstText.startsWith('@prefix')) {
      return 'turtle'
    }
    if (/^PREFIX/i.test(firstText)) {
      return 'sparql'
    }
  }

  return 'sparql'
}

function formatDeclaration(prefix, namespace, style) {
  if (style === 'turtle') {
    return `@prefix ${prefix}: <${namespace}> .\n`
  }
  return `PREFIX ${prefix}: <${namespace}>\n`
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'ensure URIs are written as prefixed names when a prefix is declared or available in @zazuko/prefixes',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          prefixes: {
            type: 'object',
            additionalProperties: { type: 'string' },
          },
          autoImport: {
            type: 'boolean',
          },
          declaredOnly: {
            type: 'boolean',
          },
          ignoredPrefixes: {
            type: 'array',
            items: { type: 'string' },
          },
          ignoredUris: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      preferPrefixedName: 'URI "<{{ uri }}>" should be written as "{{ prefix }}:{{ localName }}".',
    },
  },

  create(context) {
    const options = context.options[0] ?? {}
    const autoImport = options.declaredOnly ? false : (options.autoImport ?? true)

    return {
      Program() {
        const sourceCode = context.sourceCode
        const isSparql = Boolean(sourceCode.parserServices?.sparql)
        const declarations = sourceCode.parserServices?.rdf?.prefixDeclarations
          ?? sourceCode.parserServices?.sparql?.prefixDeclarations
          ?? []
        const tokens = sourceCode.parserServices?.rdf?.tokens
          ?? sourceCode.parserServices?.sparql?.tokens
          ?? []

        const declarationRanges = declarations.map(d => d.range)
        const declStyle = getDeclarationStyle(declarations, sourceCode, isSparql)

        // Find base declarations to ignore them
        const baseRanges = []
        for (let i = 0; i < tokens.length; i += 1) {
          const t = tokens[i]
          if (t.type === 'Identifier' && (t.value.toLowerCase() === 'base' || t.value.toLowerCase() === '@base')) {
            const nextToken = tokens[i + 1]
            if (nextToken && nextToken.type === 'IRI') {
              baseRanges.push(nextToken.range)
            }
          }
        }

        const introducedPrefixes = new Set()
        const declaredPrefixNames = new Set(declarations.map(d => d.name))

        for (const token of tokens) {
          if (token.type !== 'IRI') {
            continue
          }

          const isDeclToken = declarationRanges.some(
            range => token.range[0] >= range[0] && token.range[1] <= range[1],
          )
          if (isDeclToken) {
            continue
          }

          const isBaseToken = baseRanges.some(
            range => token.range[0] >= range[0] && token.range[1] <= range[1],
          )
          if (isBaseToken) {
            continue
          }

          const uri = token.value.slice(1, -1)
          if (!uri) {
            continue
          }

          const match = findMatchingPrefix(uri, declarations, {
            ...options,
            autoImport,
          })

          if (match) {
            const { prefix, namespace, localName, isDeclared } = match
            const needsDeclaration = !isDeclared && !declaredPrefixNames.has(prefix)
            const shouldIntroduceDeclaration = needsDeclaration && !introducedPrefixes.has(prefix)

            if (shouldIntroduceDeclaration) {
              introducedPrefixes.add(prefix)
            }

            context.report({
              loc: token.loc,
              messageId: 'preferPrefixedName',
              data: {
                uri,
                prefix,
                localName,
              },
              fix(fixer) {
                const fixes = []
                fixes.push(fixer.replaceTextRange(token.range, `${prefix}:${localName}`))

                if (shouldIntroduceDeclaration) {
                  const declText = formatDeclaration(prefix, namespace, declStyle)
                  if (declarations.length > 0) {
                    const lastDecl = declarations[declarations.length - 1]
                    fixes.push(fixer.insertTextAfterRange(lastDecl.range, `\n${declText.trimEnd()}`))
                  }
                  else {
                    fixes.push(fixer.insertTextBeforeRange([0, 0], `${declText}\n`))
                  }
                }

                return fixes
              },
            })
          }
        }
      },
    }
  },
}
