# eslint-plugin-rdf

Linting rules for RDF/JS projects.

## Installation

1. Install
```shell
npm install --save-dev eslint-plugin-rdf
```

2. Edit `.eslintrc`
```json
{
    "extends": [
        "plugin:rdf/recommended"
    ],
    "plugins": [
        "rdf"
    ]
}
```

## Rules

### `rdf/ban-rdf-js`

🔧 This rule is automatically fixable by the [`--fix` CLI option][fix].

The `rdf-js` package is deprecated. Its usages should be replaced with `@rdfjs/types`.

#### Fail

```ts
import { DataFactory } from 'rdf-js'
import type { NamedNode } from 'rdf-js'
import * as RDF from 'rdf-js'
```

#### Pass

```ts
import { DataFactory } from '@rdfjs/types'
import type { NamedNode } from '@rdfjs/types'
import * as RDF from '@rdfjs/types'
```

#### Options

This rule has no options.

[fix]: https://eslint.org/docs/latest/user-guide/command-line-interface#--fix
