export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce alphabetical sorting of RDF prefix declarations',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          order: {
            enum: ['asc', 'desc'],
          },
          ignoreCase: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unsortedPrefixes: 'Prefix "{{ name }}" should be declared before prefix "{{ prevName }}".',
    },
  },

  create(context) {
    const options = context.options[0] ?? {}
    const order = options.order ?? 'asc'
    const ignoreCase = options.ignoreCase ?? true

    function comparePrefixes(a, b) {
      const nameA = ignoreCase ? a.name.toLowerCase() : a.name
      const nameB = ignoreCase ? b.name.toLowerCase() : b.name

      const cmp = nameA.localeCompare(nameB)
      return order === 'desc' ? -cmp : cmp
    }

    return {
      Program() {
        const sourceCode = context.sourceCode
        const declarations = sourceCode.parserServices?.rdf?.prefixDeclarations ?? []

        if (declarations.length < 2) {
          return
        }

        // Group contiguous prefix declarations
        const groups = []
        let currentGroup = [declarations[0]]

        for (let i = 1; i < declarations.length; i++) {
          const prev = declarations[i - 1]
          const curr = declarations[i]

          // If separated by at most 1 empty line or contiguous
          if (curr.loc.start.line - prev.loc.end.line <= 2) {
            currentGroup.push(curr)
          }
          else {
            groups.push(currentGroup)
            currentGroup = [curr]
          }
        }
        groups.push(currentGroup)

        for (const group of groups) {
          if (group.length < 2) continue

          for (let i = 1; i < group.length; i++) {
            if (comparePrefixes(group[i - 1], group[i]) > 0) {
              context.report({
                loc: group[i].loc,
                messageId: 'unsortedPrefixes',
                data: {
                  name: group[i].name,
                  prevName: group[i - 1].name,
                },
                fix(fixer) {
                  const sortedGroup = [...group].sort(comparePrefixes)
                  const sortedTexts = sortedGroup.map(d => sourceCode.getText(d))

                  const groupStart = group[0].range[0]
                  const groupEnd = group[group.length - 1].range[1]

                  return fixer.replaceTextRange([groupStart, groupEnd], sortedTexts.join('\n'))
                },
              })
              break
            }
          }
        }
      },
    }
  },
}
