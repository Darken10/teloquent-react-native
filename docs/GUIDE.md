# Guide d'utilisation de Teloquent React Native

Ce guide détaille l'utilisation de Teloquent, un ORM TypeScript pour React Native inspiré d'Eloquent de Laravel.

## Table des matières

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Modèles](#modèles)
4. [Requêtes](#requêtes)
5. [Relations](#relations)
6. [Migrations](#migrations)
7. [Événements](#événements)
8. [Utilitaires](#utilitaires)
9. [Exemples avancés](#exemples-avancés)

## Installation

```bash
npm install teloquent-react-native
```

Vous devez également installer l'un des drivers SQLite suivants :

```bash
# Pour Expo
npm install expo-sqlite

# Pour React Native
npm install react-native-sqlite-storage
```

## Configuration

### Avec Expo SQLite

```typescript
import { Teloquent } from 'teloquent-react-native';
import * as SQLite from 'expo-sqlite';

// Ouvrir la base de données
const db = SQLite.openDatabase('ma_base.db');

// Initialiser Teloquent
Teloquent.initialize({
  driver: 'expo',
  database: db,
  debug: true // Optionnel: affiche les requêtes SQL
});
```

### Avec React Native SQLite Storage

```typescript
import { Teloquent } from 'teloquent-react-native';
import SQLite from 'react-native-sqlite-storage';

// Activer les promesses
SQLite.enablePromise(true);

// Initialiser Teloquent
async function initDatabase() {
  try {
    // Ouvrir la base de données
    const db = await SQLite.openDatabase({
      name: 'ma_base.db',
      location: 'default'
    });
    
    // Initialiser Teloquent
    Teloquent.initialize({
      driver: 'react-native',
      database: db,
      debug: true // Optionnel: affiche les requêtes SQL
    });
    
    console.log('Base de données initialisée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
  }
}

// Appeler la fonction d'initialisation
initDatabase();
```

## Modèles

Les modèles sont la base de Teloquent. Ils représentent les tables de votre base de données.

### Définition d'un modèle

```typescript
import { Model } from 'teloquent-react-native';

class User extends Model {
  // Définir les attributs pour le typage
  declare id: number;
  declare name: string;
  declare email: string;
  declare created_at: string;
  declare updated_at: string;
  
  // Personnaliser le nom de la table (optionnel)
  protected static table = 'users';
  
  // Définir la clé primaire (optionnel, par défaut 'id')
  protected primaryKey = 'id';
  
  // Attributs remplissables en masse
  protected fillable = ['name', 'email'];
  
  // Attributs cachés lors de la sérialisation
  protected hidden = ['password'];
  
  // Conversions de types
  protected casts = {
    is_admin: 'boolean',
    preferences: 'object',
    birth_date: 'date'
  };
  
  // Relations
  posts() {
    return this.hasMany(Post);
  }
  
  // Accesseur personnalisé
  getFullNameAttribute(): string {
    return `${this.name} (${this.email})`;
  }
  
  // Mutateur personnalisé
  setEmailAttribute(value: string): void {
    this.attributes.email = value.toLowerCase();
  }
}
```

### Utilisation des modèles

```typescript
// Créer une nouvelle instance
const user = new User();
user.name = 'Jean Dupont';
user.email = 'jean@exemple.fr';
await user.save();

// Création en masse
const user = await User.create({
  name: 'Marie Martin',
  email: 'marie@exemple.fr'
});

// Trouver par ID
const user = await User.find(1);

// Récupérer tous les enregistrements
const users = await User.all();

// Mettre à jour
if (user) {
  user.name = 'Nouveau nom';
  await user.save();
}

// Supprimer
if (user) {
  await user.delete();
}

// Rafraîchir depuis la base de données
await user.refresh();

// Convertir en objet/JSON
const userData = user.toObject();
const userJson = user.toJson();
```

## Requêtes

Teloquent offre un Query Builder fluide pour construire des requêtes SQL complexes.

```typescript
// Requête simple
const users = await User
  .where('age', '>', 18)
  .get();

// Requête avec plusieurs conditions
const users = await User
  .where('age', '>', 18)
  .where('is_active', true)
  .orderBy('name')
  .limit(10)
  .get();

// Sélection de colonnes spécifiques
const users = await User
  .select('id', 'name', 'email')
  .get();

// Jointures
const posts = await Post
  .join('users', 'users.id', '=', 'posts.user_id')
  .select('posts.*', 'users.name as author')
  .get();

// Agrégations
const count = await User.count();
const max = await User.max('age');
const avg = await User.avg('age');

// Groupement
const stats = await User
  .select('country')
  .count('* as user_count')
  .groupBy('country')
  .get();

// Premier ou dernier élément
const firstUser = await User.first();
const lastUser = await User.orderBy('id', 'desc').first();

// Pagination
const page = 1;
const perPage = 15;
const users = await User.paginate(page, perPage);
```

## Relations

Teloquent supporte plusieurs types de relations entre modèles.

### One-to-One (Un à un)

```typescript
// Dans le modèle User
profile() {
  return this.hasOne(Profile);
}

// Dans le modèle Profile
user() {
  return this.belongsTo(User);
}

// Utilisation
const user = await User.find(1);
const profile = await user.profile().first();

// Ou avec eager loading
const user = await User.with('profile').find(1);
const profile = user.profile;
```

### One-to-Many (Un à plusieurs)

```typescript
// Dans le modèle User
posts() {
  return this.hasMany(Post);
}

// Dans le modèle Post
user() {
  return this.belongsTo(User);
}

// Utilisation
const user = await User.find(1);
const posts = await user.posts().get();

// Ou avec eager loading
const user = await User.with('posts').find(1);
const posts = user.posts;
```

### Many-to-Many (Plusieurs à plusieurs)

```typescript
// Dans le modèle User
roles() {
  return this.belongsToMany(Role, 'user_roles', 'user_id', 'role_id');
}

// Dans le modèle Role
users() {
  return this.belongsToMany(User, 'user_roles', 'role_id', 'user_id');
}

// Utilisation
const user = await User.find(1);

// Récupérer les rôles
const roles = await user.roles().get();

// Attacher des rôles
await user.roles().attach([1, 2, 3]);

// Détacher des rôles
await user.roles().detach([2]);

// Synchroniser les rôles (remplacer tous les rôles existants)
await user.roles().sync([1, 3]);

// Récupérer avec données pivot
const rolesWithPivot = await user.roles().withPivot(['created_at']).get();
```

## Migrations

Les migrations permettent de gérer la structure de votre base de données de manière contrôlée.

### Définir une migration

```typescript
import { Schema, Migration } from 'teloquent-react-native';

const createUsersTable = {
  name: '2023_01_01_create_users_table',
  up: async (schema: typeof Schema) => {
    await schema.createTable('users', (table) => {
      table.increments('id');
      table.string('name');
      table.string('email').unique();
      table.string('password');
      table.boolean('is_admin').defaultValue(false);
      table.timestamps();
    });
  },
  down: async (schema: typeof Schema) => {
    await schema.dropTable('users');
  }
};

// Enregistrer la migration
Migration.register(createUsersTable);
```

### Exécuter les migrations

```typescript
// Exécuter toutes les migrations en attente
await Migration.migrate();

// Annuler la dernière migration
await Migration.rollback();

// Annuler plusieurs migrations
await Migration.rollback(3);

// Réinitialiser toutes les migrations
await Migration.reset();

// Rafraîchir (reset + migrate)
await Migration.refresh();
```

### Schéma et Blueprint

```typescript
// Créer une table
await Schema.createTable('posts', (table) => {
  table.increments('id');
  table.string('title');
  table.text('content');
  table.integer('user_id');
  table.timestamps();
  
  // Clé étrangère
  table.foreign('user_id').references('id').on('users').onDelete('CASCADE');
});

// Modifier une table
await Schema.table('users', (table) => {
  table.string('phone').nullable();
  table.dropColumn('unused_column');
});

// Vérifier l'existence
const tableExists = await Schema.hasTable('users');
const columnExists = await Schema.hasColumn('users', 'email');

// Renommer une table
await Schema.renameTable('old_name', 'new_name');

// Supprimer une table
await Schema.dropTable('temporary_table');
```

## Événements

Les modèles Teloquent supportent des événements pour les opérations CRUD.

```typescript
class User extends Model {
  // ...
  
  // Événements
  protected static booted = false;
  
  protected static boot() {
    if (this.booted) return;
    
    this.creating((user) => {
      // Avant la création
      user.created_at = new Date().toISOString();
    });
    
    this.created((user) => {
      // Après la création
      console.log(`Utilisateur ${user.id} créé`);
    });
    
    this.updating((user) => {
      // Avant la mise à jour
      user.updated_at = new Date().toISOString();
    });
    
    this.deleting((user) => {
      // Avant la suppression
      console.log(`Suppression de l'utilisateur ${user.id}`);
    });
    
    this.booted = true;
  }
}

// Appeler boot() pour enregistrer les événements
User.boot();
```

## Utilitaires

Teloquent fournit plusieurs utilitaires pour faciliter le développement.

### Inflector

```typescript
import { pluralize, singularize, camelize, snakeCase } from 'teloquent-react-native';

// Pluralisation
pluralize('user'); // 'users'
pluralize('category'); // 'categories'

// Singularisation
singularize('users'); // 'user'
singularize('categories'); // 'category'

// Conversion de casse
camelize('user_name'); // 'userName'
snakeCase('userName'); // 'user_name'
```

### Transactions

```typescript
import { DB } from 'teloquent-react-native';

// Utilisation d'une transaction
await DB.beginTransaction(async (tx) => {
  // Toutes les opérations dans ce bloc sont dans une transaction
  const user = await User.create({ name: 'Test', email: 'test@example.com' });
  await Profile.create({ user_id: user.id, bio: 'Test bio' });
  
  // Si une erreur se produit, toutes les opérations sont annulées
});
```

## Exemples avancés

### Requêtes avancées avec sous-requêtes

```typescript
const users = await User
  .whereExists(query => {
    query.from('posts')
      .whereRaw('posts.user_id = users.id')
      .where('posts.published', true);
  })
  .get();
```

### Relations imbriquées

```typescript
// Charger des relations imbriquées
const users = await User
  .with(['posts.comments', 'profile'])
  .get();
```

### Utilisation de Raw SQL

```typescript
// Requête SQL brute
const results = await DB.raw('SELECT * FROM users WHERE id = ?', [1]);

// Dans le Query Builder
const users = await User
  .whereRaw('LOWER(email) LIKE ?', ['%test%'])
  .get();
```

### Soft Deletes

```typescript
class Post extends Model {
  // Activer les soft deletes
  protected static softDeletes = true;
  
  // ...
}

// Supprimer (soft delete)
await post.delete();

// Récupérer sans les éléments supprimés (par défaut)
const posts = await Post.get();

// Récupérer avec les éléments supprimés
const allPosts = await Post.withTrashed().get();

// Récupérer uniquement les éléments supprimés
const trashedPosts = await Post.onlyTrashed().get();

// Restaurer un élément supprimé
await post.restore();

// Supprimer définitivement
await post.forceDelete();
```

### Utilisation avec TypeScript

```typescript
// Définir une interface pour les attributs du modèle
interface UserAttributes {
  id?: number;
  name: string;
  email: string;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Utiliser l'interface dans le modèle
class User extends Model {
  declare id: number;
  declare name: string;
  declare email: string;
  declare is_admin: boolean;
  declare created_at: string;
  declare updated_at: string;
  
  // Méthodes typées
  static async findByEmail(email: string): Promise<User | null> {
    return this.where('email', email).first();
  }
  
  isAdmin(): boolean {
    return this.is_admin === true;
  }
}

// Utilisation
const user = await User.findByEmail('test@example.com');
if (user && user.isAdmin()) {
  // ...
}
```

---

Pour plus d'informations, consultez la documentation complète ou les exemples dans le dossier `examples`.
