import { COMMON_PREFIXES } from '../../utils/vocabularies.js'

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
    type: 'problem',
    docs: {
      description: 'disallow prefixed names with undeclared prefixes and optionally auto-import from @zazuko/prefixes',
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
          ignoredPrefixes: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      undeclaredPrefix: 'Prefix "{{ prefix }}" is used but not declared.',
    },
  },

  create(context) {
    const options = context.options[0] ?? {}
    const autoImport = options.autoImport ?? true
    const customPrefixes = options.prefixes ?? {}
    const ignoredPrefixes = options.ignoredPrefixes ?? []

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
        const declaredNames = new Set(declarations.map(d => d.name))
        const declStyle = getDeclarationStyle(declarations, sourceCode, isSparql)

        const introducedPrefixes = new Set()

        for (const token of tokens) {
          const isDeclToken = declarationRanges.some(
            range => token.range[0] >= range[0] && token.range[1] <= range[1],
          )
          if (isDeclToken) {
            continue
          }

          if (token.type === 'Identifier') {
            const colonIndex = token.value.indexOf(':')
            if (colonIndex > 0) {
              const prefix = token.value.slice(0, colonIndex)
              const term = token.value.slice(colonIndex + 1)

              if (ignoredPrefixes.includes(prefix)) {
                continue
              }

              if (!declaredNames.has(prefix)) {
                const knownNamespace = customPrefixes[prefix] ?? (autoImport ? COMMON_PREFIXES[prefix] : null)
                const shouldIntroduce = knownNamespace && !introducedPrefixes.has(prefix)

                if (shouldIntroduce) {
                  introducedPrefixes.add(prefix)
                }

                context.report({
                  loc: token.loc,
                  messageId: 'undeclaredPrefix',
                  data: {
                    prefix,
                    term,
                  },
                  fix(fixer) {
                    if (!shouldIntroduce) {
                      return null
                    }

                    const declText = formatDeclaration(prefix, knownNamespace, declStyle)
                    if (declarations.length > 0) {
                      const lastDecl = declarations[declarations.length - 1]
                      return fixer.insertTextAfterRange(lastDecl.range, `\n${declText.trimEnd()}`)
                    }

                    return fixer.insertTextBeforeRange([0, 0], `${declText}`)
                  },
                })
              }
            }
          }
        }
      },
    }
  },
}
