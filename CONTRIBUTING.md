# Guide de contribution

Merci de votre intérêt pour contribuer à Teloquent React Native ! Ce document fournit des lignes directrices pour contribuer au projet.

## Code de conduite

En participant à ce projet, vous acceptez de respecter notre code de conduite qui consiste à être respectueux envers tous les contributeurs, quelle que soit leur expérience, leur genre, leur identité et expression de genre, leur orientation sexuelle, leur handicap, leur apparence personnelle, leur taille, leur race, leur ethnicité, leur âge, leur religion ou leur nationalité.

## Comment contribuer

### Signaler des bugs

Si vous trouvez un bug, veuillez créer une issue en utilisant le modèle de rapport de bug. Incluez autant de détails que possible :

- Version de Teloquent React Native utilisée
- Environnement (React Native, Expo, versions)
- Étapes pour reproduire le bug
- Comportement attendu et comportement observé
- Captures d'écran ou extraits de code si applicable

### Suggérer des améliorations

Les suggestions d'amélioration sont toujours les bienvenues. Pour en proposer une :

1. Vérifiez d'abord que votre idée n'a pas déjà été suggérée
2. Créez une issue en utilisant le modèle de suggestion de fonctionnalité
3. Décrivez clairement la fonctionnalité et pourquoi elle serait utile
4. Proposez une implémentation si possible

### Pull Requests

Nous accueillons favorablement les pull requests. Pour soumettre une PR :

1. Forkez le dépôt et créez votre branche à partir de `main`
2. Si vous ajoutez du code, ajoutez des tests qui le couvrent
3. Assurez-vous que tous les tests passent
4. Assurez-vous que votre code respecte les normes de style
5. Mettez à jour la documentation si nécessaire
6. Soumettez votre PR avec une description claire de ce qu'elle fait

## Processus de développement

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-username/teloquent-react-native.git
cd teloquent-react-native

# Installer les dépendances
npm install
```

### Structure du projet

```
teloquent-react-native/
├── dist/               # Code compilé (généré)
├── docs/               # Documentation
├── src/                # Code source
│   ├── core/           # Classes principales
│   ├── relations/      # Classes de relations
│   ├── schema/         # Classes de schéma et migration
│   ├── types/          # Types TypeScript
│   ├── utils/          # Utilitaires
│   └── __tests__/      # Tests
├── examples/           # Exemples d'utilisation
└── ...
```

### Scripts disponibles

- `npm run build` - Compile le code TypeScript
- `npm run dev` - Compile en mode watch
- `npm test` - Lance les tests
- `npm run lint` - Vérifie le style du code
- `npm run docs` - Génère la documentation API

### Normes de codage

- Utilisez TypeScript pour tout le code
- Suivez les règles ESLint configurées
- Écrivez des tests pour toutes les nouvelles fonctionnalités
- Documentez toutes les fonctions et classes publiques
- Utilisez des noms descriptifs pour les variables et fonctions
- Préférez les fonctions pures quand c'est possible

### Tests

Tous les nouveaux code doit être couvert par des tests. Nous utilisons Jest comme framework de test.

```bash
# Lancer tous les tests
npm test

# Lancer les tests avec couverture
npm run test:coverage
```

## Versionnement

Nous suivons [Semantic Versioning](https://semver.org/). En résumé :

- MAJOR version pour les changements incompatibles avec les versions précédentes
- MINOR version pour les ajouts de fonctionnalités compatibles
- PATCH version pour les corrections de bugs compatibles

## Licence

En contribuant à ce projet, vous acceptez que vos contributions soient sous la même licence que le projet (MIT).
