/**
 * Exemple d'utilisation basique de Teloquent
 */
import { Teloquent, Model, Schema } from '../index';

// Exemple avec Expo SQLite
// import * as SQLite from 'expo-sqlite';
// const db = SQLite.openDatabase('example.db');
// Teloquent.initialize({ driver: 'expo', database: db });

// Exemple avec React Native SQLite Storage
// import SQLite from 'react-native-sqlite-storage';
// SQLite.enablePromise(true);
// const db = await SQLite.openDatabase({ name: 'example.db', location: 'default' });
// Teloquent.initialize({ driver: 'react-native', database: db });

// Définition des modèles
class User extends Model {
  // Définir les attributs pour le typage
  declare id: number;
  declare name: string;
  declare email: string;
  declare created_at: string;
  declare updated_at: string;
  
  // Relations
  posts() {
    return this.hasMany(Post);
  }
}

class Post extends Model {
  declare id: number;
  declare title: string;
  declare content: string;
  declare user_id: number;
  declare created_at: string;
  declare updated_at: string;
  
  // Relations
  user() {
    return this.belongsTo(User);
  }
}

// Exemple d'utilisation
async function example() {
  try {
    // Créer les tables
    await Schema.createTable('users', (table) => {
      table.increments('id');
      table.string('name');
      table.string('email').unique();
      table.timestamps();
    });
    
    await Schema.createTable('posts', (table) => {
      table.increments('id');
      table.string('title');
      table.text('content');
      table.integer('user_id');
      table.timestamps();
      
      // Clé étrangère
      table.foreign('user_id').references('id').on('users').onDelete('CASCADE');
    });
    
    // Créer un utilisateur
    const user = new User();
    user.name = 'Jean Dupont';
    user.email = 'jean@exemple.fr';
    await user.save();
    
    console.log('Utilisateur créé:', user.toJson());
    
    // Créer un post pour cet utilisateur
    const post = new Post();
    post.title = 'Mon premier article';
    post.content = 'Contenu de l\'article...';
    post.user_id = user.id;
    await post.save();
    
    console.log('Post créé:', post.toJson());
    
    // Récupérer tous les utilisateurs
    const users = await User.all();
    console.log('Tous les utilisateurs:', users.toJson());
    
    // Récupérer un utilisateur avec ses posts
    const userWithPosts = await User.with('posts').find(user.id);
    console.log('Utilisateur avec posts:', userWithPosts?.toJson());
    
    // Requêtes avec conditions
    const filteredPosts = await Post
      .where('title', 'LIKE', '%premier%')
      .orderBy('created_at', 'desc')
      .get();
    
    console.log('Posts filtrés:', filteredPosts.toJson());
    
    // Mettre à jour un post
    post.title = 'Titre mis à jour';
    await post.save();
    
    console.log('Post mis à jour:', post.toJson());
    
    // Supprimer un post
    await post.delete();
    console.log('Post supprimé');
    
    // Supprimer un utilisateur
    await user.delete();
    console.log('Utilisateur supprimé');
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Exécuter l'exemple
// example();
