function toCamelCase(str) {
  if (!str) return str
  if (/[-_]/.test(str)) {
    return str
      .toLowerCase()
      .replace(/[-_]+(.)/g, (_, c) => c.toUpperCase())
      .replace(/^([A-Z])/, (_, c) => c.toLowerCase())
  }
  if (str === str.toUpperCase()) {
    return str.toLowerCase()
  }
  return str.charAt(0).toLowerCase() + str.slice(1)
}

function toPascalCase(str) {
  const camel = toCamelCase(str)
  return camel ? camel.charAt(0).toUpperCase() + camel.slice(1) : str
}

function toKebabCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase()
}

function toSnakeCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/-/g, '_')
    .toLowerCase()
}

const CASE_VALIDATORS = {
  'camelCase': name => /^[a-z][a-zA-Z0-9]*$/.test(name),
  'camel': name => /^[a-z][a-zA-Z0-9]*$/.test(name),
  'lower': name => /^[a-z0-9_-]*$/.test(name),
  'lowercase': name => /^[a-z0-9_-]*$/.test(name),
  'upper': name => /^[A-Z0-9_]*$/.test(name),
  'uppercase': name => /^[A-Z0-9_]*$/.test(name),
  'pascalCase': name => /^[A-Z][a-zA-Z0-9]*$/.test(name),
  'PascalCase': name => /^[A-Z][a-zA-Z0-9]*$/.test(name),
  'pascal': name => /^[A-Z][a-zA-Z0-9]*$/.test(name),
  'kebab-case': name => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(name),
  'kebab': name => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(name),
  'snake_case': name => /^[a-z0-9]+(_[a-z0-9]+)*$/.test(name),
  'snake': name => /^[a-z0-9]+(_[a-z0-9]+)*$/.test(name),
}

const CASE_CONVERTERS = {
  'camelCase': toCamelCase,
  'camel': toCamelCase,
  'lower': name => name.toLowerCase(),
  'lowercase': name => name.toLowerCase(),
  'upper': name => name.toUpperCase(),
  'uppercase': name => name.toUpperCase(),
  'pascalCase': toPascalCase,
  'PascalCase': toPascalCase,
  'pascal': toPascalCase,
  'kebab-case': toKebabCase,
  'kebab': toKebabCase,
  'snake_case': toSnakeCase,
  'snake': toSnakeCase,
}

function isCaseValid(name, expectedCase) {
  if (!name) return true
  const validator = CASE_VALIDATORS[expectedCase]
  return validator ? validator(name) : true
}

function getExpectedName(name, expectedCase) {
  const converter = CASE_CONVERTERS[expectedCase]
  return converter ? converter(name) : name
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce a naming style for SPARQL prefixes',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          case: {
            enum: [
              'camelCase',
              'camel',
              'lower',
              'lowercase',
              'upper',
              'uppercase',
              'pascalCase',
              'PascalCase',
              'pascal',
              'kebab-case',
              'kebab',
              'snake_case',
              'snake',
            ],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      expectedCase: 'Prefix "{{ name }}" should be {{ expected }}.',
    },
  },

  create(context) {
    const options = context.options[0] ?? {}
    const expected = options.case ?? 'camelCase'

    return {
      Program() {
        const sourceCode = context.sourceCode
        const declarations = sourceCode.parserServices?.sparql?.prefixDeclarations
          ?? sourceCode.parserServices?.rdf?.prefixDeclarations
          ?? []
        const tokens = sourceCode.parserServices?.sparql?.tokens
          ?? sourceCode.parserServices?.rdf?.tokens
          ?? []

        const declarationRanges = declarations.map(d => d.range)

        for (const declaration of declarations) {
          if (isCaseValid(declaration.name, expected)) {
            continue
          }

          const expectedName = getExpectedName(declaration.name, expected)

          if (declaration.name === expectedName) {
            continue
          }

          context.report({
            loc: declaration.nameToken.loc,
            messageId: 'expectedCase',
            data: {
              name: declaration.name,
              expected,
            },
            fix(fixer) {
              const fixes = []

              // Fix declaration name token
              fixes.push(
                fixer.replaceTextRange(
                  [
                    declaration.nameToken.range[0],
                    declaration.nameToken.range[0] + declaration.name.length,
                  ],
                  expectedName,
                ),
              )

              // Fix all usages throughout the document
              for (const token of tokens) {
                const isDeclToken = declarationRanges.some(
                  range => token.range[0] >= range[0] && token.range[1] <= range[1],
                )
                if (isDeclToken) {
                  continue
                }

                if (token.type === 'Identifier' && token.value.startsWith(`${declaration.name}:`)) {
                  fixes.push(
                    fixer.replaceTextRange(
                      [
                        token.range[0],
                        token.range[0] + declaration.name.length,
                      ],
                      expectedName,
                    ),
                  )
                }
              }

              return fixes
            },
          })
        }
      },
    }
  },
}
