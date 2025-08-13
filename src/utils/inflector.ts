/**
 * Utilitaires pour la gestion des formes singulières et plurielles
 */

// Règles de pluralisation
const pluralRules: [RegExp, string][] = [
  [/(s|x|z|ch|sh)$/i, '$1es'],
  [/([^aeiouy]|qu)y$/i, '$1ies'],
  [/([^aeiouy])o$/i, '$1oes'],
  [/(matr|vert|ind)ix|ex$/i, '$1ices'],
  [/(x|ch|ss|sh)$/i, '$1es'],
  [/(alias|status)$/i, '$1es'],
  [/(octop|vir)us$/i, '$1i'],
  [/(cris|ax|test)is$/i, '$1es'],
  [/is$/i, 'es'],
  [/us$/i, 'uses'],
  [/([m|l])ouse$/i, '$1ice'],
  [/(quiz)$/i, '$1zes'],
  [/^(ox)$/i, '$1en'],
  [/(matrix|vertex|index)$/i, '$1ices'],
  [/(x|ch|ss|sh)$/i, '$1es'],
  [/([^aeiouy]|qu)y$/i, '$1ies'],
  [/(hive)$/i, '$1s'],
  [/(?:([^f])fe|([lr])f)$/i, '$1$2ves'],
  [/sis$/i, 'ses'],
  [/([ti])um$/i, '$1a'],
  [/(buffal|tomat)o$/i, '$1oes'],
  [/(bu)s$/i, '$1ses'],
  [/(alias|status)$/i, '$1es'],
  [/(octop|vir)us$/i, '$1i'],
  [/(ax|test)is$/i, '$1es'],
  [/s$/i, 's'],
  [/$/, 's']
];

// Règles de singularisation
const singularRules: [RegExp, string][] = [
  [/(s|si|u)s$/i, '$1s'],
  [/ies$/i, 'y'],
  [/([octop|vir])i$/i, '$1us'],
  [/(ax|test)es$/i, '$1is'],
  [/(alias|status)es$/i, '$1'],
  [/(shoe)s$/i, '$1'],
  [/(o)es$/i, '$1'],
  [/(bus)es$/i, '$1'],
  [/([m|l])ice$/i, '$1ouse'],
  [/(x|ch|ss|sh)es$/i, '$1'],
  [/(matrix|vertex|index)ices$/i, '$1ix'],
  [/(cris|ax|test)es$/i, '$1is'],
  [/(octop|vir)i$/i, '$1us'],
  [/(alias|status)es$/i, '$1'],
  [/^(ox)en/i, '$1'],
  [/(vert|ind)ices$/i, '$1ex'],
  [/(matr)ices$/i, '$1ix'],
  [/(quiz)zes$/i, '$1'],
  [/s$/i, '']
];

// Mots irréguliers (qui ne suivent pas les règles)
const irregularPlurals: Record<string, string> = {
  'person': 'people',
  'man': 'men',
  'child': 'children',
  'sex': 'sexes',
  'move': 'moves',
  'foot': 'feet',
  'tooth': 'teeth',
  'goose': 'geese',
  'datum': 'data',
  'medium': 'media',
  'analysis': 'analyses',
  'life': 'lives',
  'wife': 'wives',
  'elf': 'elves',
  'loaf': 'loaves',
  'potato': 'potatoes',
  'tomato': 'tomatoes',
  'cactus': 'cacti',
  'focus': 'foci',
  'fungus': 'fungi',
  'nucleus': 'nuclei',
  'syllabus': 'syllabi',
  'crisis': 'crises',
  'thesis': 'theses',
  'phenomenon': 'phenomena',
  'criterion': 'criteria',
  'sheep': 'sheep',
  'fish': 'fish',
  'deer': 'deer',
  'species': 'species',
  'aircraft': 'aircraft',
  'mouse': 'mice',
  'louse': 'lice'
};

// Inverser les irréguliers pour la singularisation
const irregularSingulars: Record<string, string> = {};
Object.entries(irregularPlurals).forEach(([singular, plural]) => {
  irregularSingulars[plural] = singular;
});

// Mots non comptables (qui n'ont pas de forme plurielle)
const uncountables = new Set([
  'equipment',
  'information',
  'rice',
  'money',
  'species',
  'series',
  'fish',
  'sheep',
  'furniture',
  'advice',
  'knowledge',
  'news',
  'music',
  'traffic',
  'weather',
  'luggage',
  'baggage',
  'software',
  'hardware',
  'feedback',
  'sugar',
  'butter',
  'water',
  'electricity',
  'gas',
  'power',
  'love',
  'happiness',
  'courage',
  'honesty',
  'evidence',
  'research',
  'progress',
  'access'
]);

/**
 * Convertir un mot au pluriel
 */
export function pluralize(word: string): string {
  // Vérifier si le mot est non comptable
  if (uncountables.has(word.toLowerCase())) {
    return word;
  }
  
  // Vérifier si le mot a une forme plurielle irrégulière
  const lowerWord = word.toLowerCase();
  if (irregularPlurals[lowerWord]) {
    return irregularPlurals[lowerWord];
  }
  
  // Appliquer les règles de pluralisation
  for (const [rule, replacement] of pluralRules) {
    if (rule.test(word)) {
      return word.replace(rule, replacement);
    }
  }
  
  return word;
}

/**
 * Convertir un mot au singulier
 */
export function singularize(word: string): string {
  // Vérifier si le mot est non comptable
  if (uncountables.has(word.toLowerCase())) {
    return word;
  }
  
  // Vérifier si le mot a une forme singulière irrégulière
  const lowerWord = word.toLowerCase();
  if (irregularSingulars[lowerWord]) {
    return irregularSingulars[lowerWord];
  }
  
  // Appliquer les règles de singularisation
  for (const [rule, replacement] of singularRules) {
    if (rule.test(word)) {
      return word.replace(rule, replacement);
    }
  }
  
  return word;
}

/**
 * Convertir une chaîne en camelCase
 */
export function camelize(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '');
}

/**
 * Convertir une chaîne en snake_case
 */
export function snakeCase(str: string): string {
  return str
    .replace(/\s+/g, '_')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase();
}

/**
 * Convertir une chaîne en kebab-case
 */
export function kebabCase(str: string): string {
  return str
    .replace(/\s+/g, '-')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Convertir une chaîne en PascalCase
 */
export function pascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '');
}
