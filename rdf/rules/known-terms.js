import { isKnownVocabulary, isTermValid } from '../../utils/vocabularies.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'verify that terms from known vocabularies (@tpluscode/rdf-ns-builders) actually exist',
    },
    schema: [
      {
        type: 'object',
        properties: {
          customTerms: {
            type: 'object',
            additionalProperties: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          ignoredVocabularies: {
            type: 'array',
            items: { type: 'string' },
          },
          ignoredTerms: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unknownTerm: 'Unknown term "{{ term }}" in vocabulary "{{ vocab }}".',
    },
  },

  create(context) {
    const options = context.options[0] ?? {}

    return {
      Program() {
        const sourceCode = context.sourceCode
        const declarations = sourceCode.parserServices?.rdf?.prefixDeclarations
          ?? sourceCode.parserServices?.sparql?.prefixDeclarations
          ?? []
        const tokens = sourceCode.parserServices?.rdf?.tokens
          ?? sourceCode.parserServices?.sparql?.tokens
          ?? []

        const declarationRanges = declarations.map(d => d.range)
        const declMap = new Map()
        for (const decl of declarations) {
          declMap.set(decl.name, decl)
        }

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

              if (!term) {
                continue
              }

              const decl = declMap.get(prefix)
              const vocabToCheck = decl?.iri ?? decl?.uri ?? prefix

              if (isKnownVocabulary(vocabToCheck) || isKnownVocabulary(prefix)) {
                const targetVocab = isKnownVocabulary(vocabToCheck) ? vocabToCheck : prefix
                if (!isTermValid(targetVocab, term, options)) {
                  context.report({
                    loc: token.loc,
                    messageId: 'unknownTerm',
                    data: {
                      term,
                      vocab: prefix,
                    },
                  })
                }
              }
            }
          }
        }
      },
    }
  },
}
