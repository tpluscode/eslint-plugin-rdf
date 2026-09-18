import console from 'node:console'
import { generateVocabularies } from '../utils/vocabularies.js'

try {
  const initialized = await generateVocabularies()
  if (!initialized) {
    console.warn('[@tpluscode/rdf-ns-builders] is not installed. Vocabulary-dependent rules will remain inactive.')
  }
}
catch {
  console.warn('[@tpluscode/rdf-ns-builders] is not installed. Vocabulary-dependent rules will remain inactive.')
}
