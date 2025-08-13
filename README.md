# Teloquent React Native

Un ORM TypeScript élégant pour React Native, inspiré par Eloquent de Laravel, pour gérer efficacement les bases de données SQLite dans vos applications React Native.

## Caractéristiques

- API fluide et intuitive similaire à Eloquent de Laravel
- Support complet pour expo-sqlite et react-native-sqlite-storage
- Migrations de base de données avec suivi des versions
- Relations entre modèles (hasOne, hasMany, belongsTo, belongsToMany)
- Requêtes avancées avec une API fluide (where, orderBy, groupBy, having, etc.)
- Hooks et événements sur les modèles
- Transactions et opérations atomiques
- Attributs accesseurs et mutateurs
- Collections avec méthodes utilitaires
- Utilitaires d'inflection (pluralisation, singularisation, conversion de casse)
- Entièrement typé avec TypeScript pour une sécurité maximale

## Installation

```bash
npm install teloquent-react-native

# Selon votre environnement, installez également l'une des dépendances suivantes:
# Pour Expo:
npm install expo-sqlite

# Pour React Native pur:
npm install react-native-sqlite-storage
```

## Configuration

```typescript
import { Teloquent } from 'teloquent-react-native';

// Pour Expo
import * as SQLite from 'expo-sqlite';
Teloquent.initialize({
  driver: 'expo',
  database: SQLite.openDatabase('ma_base.db')
});

// Pour React Native pur
import SQLite from 'react-native-sqlite-storage';
SQLite.enablePromise(true);
Teloquent.initialize({
  driver: 'react-native',
  database: await SQLite.openDatabase({
    name: 'ma_base.db',
    location: 'default'
  })
});
```

## Définition des modèles

```typescript
import { Model } from 'teloquent-react-native';

class User extends Model {
  // Définir les attributs pour le typage
  declare id: number;
  declare name: string;
  declare email: string;
  declare created_at: string;
  
  // Définir la table (optionnel, par défaut le nom pluriel de la classe)
  static table = 'users';
  
  // Définir les relations
  posts() {
    return this.hasMany(Post);
  }
}

class Post extends Model {
  declare id: number;
  declare title: string;
  declare content: string;
  declare user_id: number;
  
  user() {
    return this.belongsTo(User);
  }
}
```

## Utilisation

```typescript
// Créer un nouvel utilisateur
const user = new User();
user.name = 'Jean Dupont';
user.email = 'jean@exemple.fr';
await user.save();

// Ou avec la méthode create
const user = await User.create({
  name: 'Marie Martin',
  email: 'marie@exemple.fr'
});

// Récupérer tous les utilisateurs
const users = await User.all();

// Requêtes avec conditions
const admins = await User
  .where('role', '=', 'admin')
  .orderBy('name')
  .limit(10)
  .get();

// Trouver par ID
const user = await User.find(1);

// Relations
const userWithPosts = await User.with('posts').find(1);
const posts = await user.posts().get();
```

## Migrations

```typescript
import { Schema, Migration } from 'teloquent-react-native';

// Définir une migration
const usersMigration = {
  name: '2025_08_01_create_users_table',
  up: async (schema: Schema) => {
    await schema.createTable('users', (table) => {
      table.increments('id');
      table.string('name');
      table.string('email').unique();
      table.string('password');
      table.timestamps();
    });
  },
  down: async (schema: Schema) => {
    await schema.dropTable('users');
  }
};

// Enregistrer les migrations
Migration.register([usersMigration]);

// Exécuter les migrations
await Migration.migrate();

// Annuler la dernière migration
await Migration.rollback();

// Réinitialiser toutes les migrations
await Migration.reset();

// Rafraîchir (reset + migrate)
await Migration.refresh();

// Modifier une table existante
const addPhoneToUsers = {
  name: '2025_08_02_add_phone_to_users',
  up: async (schema: Schema) => {
    await schema.table('users', (table) => {
      table.string('phone').nullable();
    });
  },
  down: async (schema: Schema) => {
    await schema.table('users', (table) => {
      table.dropColumn('phone');
    });
  }
};
```

## Utilitaires d'inflection

```typescript
import { pluralize, singularize, camelize, snakeCase, kebabCase, pascalCase } from 'teloquent-react-native';

// Pluralisation et singularisation
pluralizer('user'); // 'users'
pluralizer('category'); // 'categories'
pluralizer('child'); // 'children' (gère les mots irréguliers)

singularize('users'); // 'user'
singularize('categories'); // 'category'
singularize('children'); // 'child'

// Conversion de casse
camelize('user_name'); // 'userName'
snakeCase('userName'); // 'user_name'
kebabCase('userName'); // 'user-name'
pascalCase('user_name'); // 'UserName'
```

## Documentation complète

Pour une documentation complète, consultez le fichier [GUIDE.md](./docs/GUIDE.md) inclus dans ce package.

## Contribution

Les contributions sont les bienvenues ! Consultez [CONTRIBUTING.md](./CONTRIBUTING.md) pour plus d'informations.

## Licence

MIT
