# `rdf/prefix-declaration-style`

Enforce consistent style for prefix declarations (`@prefix` vs `PREFIX`).

🔧 This rule is automatically fixable by the `--fix` CLI option.

## Rule Details

Turtle supports both `@prefix name: <uri> .` and SPARQL-style `PREFIX name: <uri>`. This rule enforces a consistent style and casing.

### Fail

With `{ style: "sparql", case: "upper" }`:

```turtle
@prefix ex: <http://example.org/> .
prefix ex: <http://example.org/>
```

With `{ style: "turtle" }`:

```turtle
PREFIX ex: <http://example.org/>
```

### Pass

With `{ style: "sparql", case: "upper" }`:

```turtle
PREFIX ex: <http://example.org/>
```

With `{ style: "turtle" }`:

```turtle
@prefix ex: <http://example.org/> .
```

## Options

This rule accepts an optional object:

```json
{
  "rules": {
    "rdf/prefix-declaration-style": ["warn", {
      "style": "sparql",
      "case": "upper"
    }]
  }
}
```

- `style`: (`"sparql"` | `"turtle"`, default: `"sparql"`) Preferred declaration syntax.
- `case`: (`"upper"` | `"lower"`, default: `"upper"`) Casing for the `PREFIX` keyword when `style` is `"sparql"`.
