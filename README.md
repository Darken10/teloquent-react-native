# Teloquent React Native

Un ORM TypeScript élégant pour React Native, inspiré par Eloquent de Laravel, pour gérer efficacement les bases de données SQLite dans vos applications React Native.

## Caractéristiques

- API fluide et intuitive similaire à Eloquent de Laravel
- Support pour expo-sqlite et react-native-sqlite-storage
- Migrations de base de données
- Relations entre modèles (hasOne, hasMany, belongsTo, etc.)
- Requêtes avancées avec une API fluide
- Hooks et événements
- Transactions
- Entièrement typé avec TypeScript

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
import { Schema } from 'teloquent-react-native';

// Créer une table
await Schema.createTable('users', (table) => {
  table.increments('id');
  table.string('name');
  table.string('email').unique();
  table.string('password');
  table.timestamps();
});

// Modifier une table
await Schema.table('users', (table) => {
  table.string('phone').nullable();
});
```

## Documentation complète

Pour une documentation complète, visitez [le site de documentation](https://teloquent-docs.example.com).

## Licence

MIT
