export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow the deprecated rdf-js package and suggest @rdfjs/types instead',
    },
    fixable: 'code',
    messages: {
      deprecated: 'Module rdf-js is deprecated, use @rdfjs/types instead',
    },
  },
  create (context) {
    function rule (node) {
      const source = node.source
      if (source?.value === 'rdf-js') {
        context.report({
          node,
          message: 'Module rdf-js is deprecated, use @rdfjs/types instead',
          fix (fixer) {
            return fixer.replaceText(node.source, node.source.raw.replace('rdf-js', '@rdfjs/types'))
          },
        })
      }
    }

    return {
      DeclareExportDeclaration: rule,
      DeclareExportAllDeclaration: rule,
      ExportAllDeclaration: rule,
      ExportNamedDeclaration: rule,
      ImportDeclaration: rule,
    }
  },
}
