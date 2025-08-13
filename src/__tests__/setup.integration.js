// Configuration pour les tests d'intégration Jest

// Augmenter le timeout pour les tests asynchrones qui interagissent avec une vraie base de données
jest.setTimeout(30000);

// Supprimer les avertissements de console pendant les tests
global.console = {
  ...console,
  // Garder les erreurs mais supprimer les avertissements
  warn: jest.fn(),
  // Vous pouvez également supprimer les logs si nécessaire
  log: jest.fn(),
  error: console.error,
  info: console.info,
  debug: console.debug,
};
