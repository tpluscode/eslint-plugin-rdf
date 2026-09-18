import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import zazukoPrefixes from '@zazuko/prefixes'

const dataPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'vocabularies.json')

let termsByVocab = null
let termsByNamespace = null
let namespaceToPrefix = null
let vocabulariesLoaded = false

export function areVocabulariesAvailable() {
  initVocabularies()
  return termsByVocab !== null && termsByVocab.size > 0
}

export function resetVocabularies() {
  termsByVocab = null
  termsByNamespace = null
  namespaceToPrefix = null
  vocabulariesLoaded = false
}

function initVocabularies() {
  if (vocabulariesLoaded) {
    return
  }
  vocabulariesLoaded = true

  termsByVocab = new Map()
  termsByNamespace = new Map()
  namespaceToPrefix = new Map()

  // Initialize namespaceToPrefix from @zazuko/prefixes
  for (const [prefix, ns] of Object.entries(zazukoPrefixes)) {
    namespaceToPrefix.set(ns, prefix)
  }

  if (fs.existsSync(dataPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
      if (data.termsByVocab) {
        for (const [vocab, terms] of Object.entries(data.termsByVocab)) {
          termsByVocab.set(vocab, new Set(terms))
        }
      }
      if (data.termsByNamespace) {
        for (const [ns, terms] of Object.entries(data.termsByNamespace)) {
          termsByNamespace.set(ns, new Set(terms))
        }
      }
      if (data.namespaceToPrefix) {
        for (const [ns, prefix] of Object.entries(data.namespaceToPrefix)) {
          if (!namespaceToPrefix.has(ns)) {
            namespaceToPrefix.set(ns, prefix)
          }
        }
      }
    }
    catch {
      // If loading JSON fails, fallback to empty terms
    }
  }
}

export async function generateVocabularies() {
  let builders
  let indexPath
  try {
    builders = await import('@tpluscode/rdf-ns-builders')
    indexPath = fileURLToPath(import.meta.resolve('@tpluscode/rdf-ns-builders'))
  }
  catch {
    if (fs.existsSync(dataPath)) {
      try {
        fs.unlinkSync(dataPath)
      }
      catch {
        // ignore unlink error
      }
    }
    return false
  }

  const pkgDir = path.dirname(indexPath)
  const dtsDir = path.join(pkgDir, 'vocabularies')

  const termsByVocabData = {}
  const termsByNamespaceData = {}
  const namespaceToPrefixData = {}

  if (fs.existsSync(dtsDir)) {
    for (const file of fs.readdirSync(dtsDir)) {
      if (!file.endsWith('.d.ts')) {
        continue
      }

      const vocab = path.basename(file, '.d.ts')
      const content = fs.readFileSync(path.join(dtsDir, file), 'utf8')
      const terms = []
      const regex = /^\s*"?([a-zA-Z0-9_-]+)"?\s*:\s*NamedNode/gm
      let match
      while ((match = regex.exec(content)) !== null) {
        terms.push(match[1])
      }

      termsByVocabData[vocab] = terms
      const camel = vocab.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
      termsByVocabData[camel] = terms

      if (vocab === 'void') {
        termsByVocabData['_void'] = terms
      }

      const builderFn = builders[vocab] || builders[`_${vocab}`] || builders[camel]
      if (typeof builderFn === 'function' && builderFn !== builders.default) {
        try {
          const ns = builderFn('').value
          termsByNamespaceData[ns] = terms
          if (!namespaceToPrefixData[ns]) {
            namespaceToPrefixData[ns] = vocab
          }
        }
        catch {
          // ignore builder invocation errors
        }
      }

      if (zazukoPrefixes[vocab]) {
        termsByNamespaceData[zazukoPrefixes[vocab]] = terms
      }
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify({
    termsByVocab: termsByVocabData,
    termsByNamespace: termsByNamespaceData,
    namespaceToPrefix: namespaceToPrefixData,
  }, null, 2), 'utf8')

  // Reset caches so next initVocabularies reads newly generated data
  termsByVocab = null
  termsByNamespace = null
  namespaceToPrefix = null
  vocabulariesLoaded = false

  return true
}

export function getKnownTerms(vocabOrNamespace) {
  initVocabularies()
  return termsByVocab.get(vocabOrNamespace) ?? termsByNamespace.get(vocabOrNamespace)
}

export function isKnownVocabulary(vocabOrNamespace) {
  initVocabularies()
  return termsByVocab.has(vocabOrNamespace) || termsByNamespace.has(vocabOrNamespace)
}

export function isTermValid(vocabOrNamespace, term, options = {}) {
  initVocabularies()
  const {
    customTerms = {},
    ignoredVocabularies = [],
    ignoredTerms = [],
  } = options

  const prefix = getPrefixForNamespace(vocabOrNamespace) ?? vocabOrNamespace

  if (ignoredVocabularies.includes(vocabOrNamespace) || ignoredVocabularies.includes(prefix)) {
    return true
  }

  const qualifiedName = `${prefix}:${term}`
  if (
    ignoredTerms.includes(qualifiedName)
    || ignoredTerms.includes(term)
    || ignoredTerms.includes(`${vocabOrNamespace}:${term}`)
  ) {
    return true
  }

  if (customTerms[vocabOrNamespace]?.includes(term) || customTerms[prefix]?.includes(term)) {
    return true
  }

  const terms = termsByVocab.get(vocabOrNamespace)
    ?? termsByNamespace.get(vocabOrNamespace)
    ?? termsByVocab.get(prefix)
    ?? termsByNamespace.get(prefix)

  if (!terms) {
    // Not a known vocabulary, so cannot invalidate
    return true
  }

  // Handle rdf:_1, rdf:_2, etc. (RDF container membership properties)
  if (
    (vocabOrNamespace === 'rdf' || vocabOrNamespace === zazukoPrefixes.rdf || prefix === 'rdf')
    && /^_[0-9]+$/.test(term)
  ) {
    return true
  }

  return terms.has(term)
}

export const COMMON_PREFIXES = zazukoPrefixes

export function getPrefixForNamespace(namespace) {
  initVocabularies()
  return namespaceToPrefix.get(namespace)
}

const VALID_LOCAL_NAME_REGEX = /^[A-Za-z_][A-Za-z0-9_.-]*$/

export function isValidLocalName(name) {
  return VALID_LOCAL_NAME_REGEX.test(name)
}

export function findMatchingPrefix(uri, declaredDeclarations = [], options = {}) {
  initVocabularies()
  const {
    prefixes: customPrefixes = {},
    autoImport = true,
    ignoredPrefixes = [],
    ignoredUris = [],
  } = options

  if (ignoredUris.includes(uri)) {
    return null
  }

  // 1. Check declared prefixes in the file first
  let bestDeclaredMatch = null
  for (const decl of declaredDeclarations) {
    if (ignoredPrefixes.includes(decl.name)) {
      continue
    }

    const declIri = decl.iri ?? decl.uri
    if (!declIri) {
      continue
    }

    if (uri.startsWith(declIri) && uri !== declIri) {
      const localName = uri.slice(declIri.length)
      if (isValidLocalName(localName)) {
        if (!bestDeclaredMatch || declIri.length > bestDeclaredMatch.namespace.length) {
          bestDeclaredMatch = {
            prefix: decl.name,
            namespace: declIri,
            localName,
            isDeclared: true,
          }
        }
      }
    }
  }

  if (bestDeclaredMatch) {
    return bestDeclaredMatch
  }

  // 2. Check custom configured prefixes
  let bestCustomMatch = null
  for (const [prefix, ns] of Object.entries(customPrefixes)) {
    if (ignoredPrefixes.includes(prefix)) {
      continue
    }

    if (uri.startsWith(ns) && uri !== ns) {
      const localName = uri.slice(ns.length)
      if (isValidLocalName(localName)) {
        if (!bestCustomMatch || ns.length > bestCustomMatch.namespace.length) {
          bestCustomMatch = {
            prefix,
            namespace: ns,
            localName,
            isDeclared: false,
          }
        }
      }
    }
  }

  if (bestCustomMatch) {
    return bestCustomMatch
  }

  // 3. Check @zazuko/prefixes if autoImport is allowed
  if (autoImport) {
    let bestCommonMatch = null
    for (const [prefix, ns] of Object.entries(zazukoPrefixes)) {
      if (ignoredPrefixes.includes(prefix)) {
        continue
      }

      if (uri.startsWith(ns) && uri !== ns) {
        const localName = uri.slice(ns.length)
        if (isValidLocalName(localName)) {
          if (!bestCommonMatch || ns.length > bestCommonMatch.namespace.length) {
            bestCommonMatch = {
              prefix,
              namespace: ns,
              localName,
              isDeclared: false,
            }
          }
        }
      }
    }

    if (bestCommonMatch) {
      return bestCommonMatch
    }
  }

  return null
}
