function isAbsoluteIri(value) {
  return /^[a-z][a-z0-9+.-]*:/iu.test(value)
}

function isBlankDocumentIri(value) {
  return value === ''
}

function isFragmentOnlyIri(value) {
  return value.startsWith('#')
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow relative IRIs in Turtle/TriG/N3 documents',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowEmpty: {
            type: 'boolean',
          },
          allowFragments: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      relativeIri: 'Relative IRI "<{{ iri }}>" is not allowed.',
    },
  },

  create(context) {
    const options = context.options[0] ?? {}
    const allowEmpty = options.allowEmpty ?? true
    const allowFragments = options.allowFragments ?? true

    return {
      Program() {
        const tokens = context.sourceCode.parserServices?.rdf?.tokens ?? []

        for (const token of tokens) {
          if (token.type !== 'IRI') {
            continue
          }

          const iri = token.value.slice(1, -1)

          if (allowEmpty && isBlankDocumentIri(iri)) {
            continue
          }

          if (allowFragments && isFragmentOnlyIri(iri)) {
            continue
          }

          if (isAbsoluteIri(iri)) {
            continue
          }

          context.report({
            loc: token.loc,
            messageId: 'relativeIri',
            data: {
              iri,
            },
          })
        }
      },
    }
  },
}
