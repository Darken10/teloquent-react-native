# Journal des modifications

Toutes les modifications notables apportées à ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-08-13

### Ajouté
- Première version stable de Teloquent React Native
- Support complet pour expo-sqlite et react-native-sqlite-storage
- Modèles avec attributs, accesseurs et mutateurs
- Query Builder fluide avec support des jointures et agrégations
- Relations (hasOne, hasMany, belongsTo, belongsToMany)
- Migrations et schémas avec Blueprint
- Événements de modèle
- Collections avec méthodes utilitaires
- Support TypeScript complet
- Documentation et exemples

### Changé
- N/A (première version)

### Corrigé
- Résolution des erreurs de lint TypeScript
- Correction des déclarations de types manquantes pour expo-sqlite et react-native-sqlite-storage
- Correction des problèmes de compatibilité avec Jest

## [0.9.0] - 2025-08-13

### Ajouté
- Configuration complète de l'environnement de développement
- Configuration de tests unitaires et d'intégration avec Jest
- Mocks pour les drivers SQLite (expo-sqlite et react-native-sqlite-storage)
- Tests unitaires pour les modèles, relations, migrations et schémas
- Exemples avancés pour les hooks d'événements, transactions, accesseurs/mutateurs et relations many-to-many
- Documentation détaillée avec guide d'utilisation

### Changé
- Amélioration de la structure du projet
- Optimisation des performances des requêtes

### Corrigé
- N/A (première version)
