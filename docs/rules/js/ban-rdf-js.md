# `rdf/ban-rdf-js`

Disallow the deprecated `rdf-js` package and suggest `@rdfjs/types` instead.

🔧 This rule is automatically fixable by the `--fix` CLI option.

## Rule Details

The `rdf-js` package is deprecated. Its type and interface usages should be imported from `@rdfjs/types`.

### Fail

```ts
import { DataFactory } from 'rdf-js'
import type { NamedNode } from 'rdf-js'
import * as RDF from 'rdf-js'
export { BlankNode } from 'rdf-js'
export * from 'rdf-js'
```

### Pass

```ts
import { DataFactory } from '@rdfjs/types'
import type { NamedNode } from '@rdfjs/types'
import * as RDF from '@rdfjs/types'
export { BlankNode } from '@rdfjs/types'
export * from '@rdfjs/types'
```

## Options

This rule has no options.
