import { describe, it } from 'node:test'
import { RuleTester } from 'eslint'
import tsParser from '@typescript-eslint/parser'
import rule from '../../rules/ban-rdf-js.js'

RuleTester.describe = describe
RuleTester.it = it

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
  },
})

ruleTester.run('ban-rdf-js', rule, {
  valid: [
    {
      code: "import { BlankNode } from '@rdfjs/types'",
    },
    {
      code: "import type { BlankNode } from '@rdfjs/types'",
    },
    {
      code: "import * as RDF from '@rdfjs/types'",
    },
    {
      code: "import type * as RDF from '@rdfjs/types'",
    },
    {
      code: "export { BlankNode } from '@rdfjs/types'",
    },
    {
      code: "export type { BlankNode } from '@rdfjs/types'",
    },
    {
      code: "export * from '@rdfjs/types'",
    },
    {
      code: "export * as RDF from '@rdfjs/types'",
    },
    {
      code: "import { Literal } from 'some-other-pkg'",
    },
    {
      code: "export { Literal } from 'some-other-pkg'",
    },
  ],
  invalid: [
    {
      code: "import type * as RDF1 from 'rdf-js'",
      output: "import type * as RDF1 from '@rdfjs/types'",
      errors: [{ message: 'Module rdf-js is deprecated, use @rdfjs/types instead' }],
    },
    {
      code: "import * as RDF2 from 'rdf-js'",
      output: "import * as RDF2 from '@rdfjs/types'",
      errors: [{ message: 'Module rdf-js is deprecated, use @rdfjs/types instead' }],
    },
    {
      code: "import type { NamedNode } from 'rdf-js'",
      output: "import type { NamedNode } from '@rdfjs/types'",
      errors: [{ message: 'Module rdf-js is deprecated, use @rdfjs/types instead' }],
    },
    {
      code: "import { Literal } from 'rdf-js'",
      output: "import { Literal } from '@rdfjs/types'",
      errors: [{ message: 'Module rdf-js is deprecated, use @rdfjs/types instead' }],
    },
    {
      code: "export * from 'rdf-js'",
      output: "export * from '@rdfjs/types'",
      errors: [{ message: 'Module rdf-js is deprecated, use @rdfjs/types instead' }],
    },
    {
      code: "export * as RDF from 'rdf-js'",
      output: "export * as RDF from '@rdfjs/types'",
      errors: [{ message: 'Module rdf-js is deprecated, use @rdfjs/types instead' }],
    },
    {
      code: "export { NamedNode } from 'rdf-js'",
      output: "export { NamedNode } from '@rdfjs/types'",
      errors: [{ message: 'Module rdf-js is deprecated, use @rdfjs/types instead' }],
    },
    {
      code: "export type { NamedNode } from 'rdf-js'",
      output: "export type { NamedNode } from '@rdfjs/types'",
      errors: [{ message: 'Module rdf-js is deprecated, use @rdfjs/types instead' }],
    },
    {
      code: 'import { Literal } from "rdf-js"',
      output: 'import { Literal } from "@rdfjs/types"',
      errors: [{ message: 'Module rdf-js is deprecated, use @rdfjs/types instead' }],
    },
    {
      code: 'export { Literal } from "rdf-js"',
      output: 'export { Literal } from "@rdfjs/types"',
      errors: [{ message: 'Module rdf-js is deprecated, use @rdfjs/types instead' }],
    },
  ],
})
