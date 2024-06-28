module.exports = {
  configs: {
    recommended: {
      plugins: ['rdf'],
      rules: {
        'rdf/ban-rdf-js': 'error',
      },
    },
  },
  rules: {
    'ban-rdf-js': {
      meta: {
        fixable: true,
      },
      create(context) {
        function rule(node) {
          const source = node.source
          if (source?.value === 'rdf-js') {
            context.report({
              node,
              message: 'Module rdf-js is deprecated, use @rdfjs/types instead',
              fix(fixer) {
                return fixer.replaceText(node.source, '@rdfjs/types')
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
    },
  },
}
