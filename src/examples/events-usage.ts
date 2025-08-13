/**
 * Exemple d'utilisation des hooks d'événements dans Teloquent
 */
import { Teloquent, Model } from '../index';
import * as SQLite from 'expo-sqlite';

// Initialisation de la connexion
Teloquent.initialize({
  driver: 'expo',
  database: SQLite.openDatabase('events_example.db')
});

// Définition du modèle User avec des hooks d'événements
class User extends Model {
  declare id: number;
  declare name: string;
  declare email: string;
  declare password: string;
  declare last_login: string | null;
  
  // Hook exécuté avant la création d'un nouvel utilisateur
  static booted() {
    // Enregistrer les hooks d'événements
    User.creating((user: User) => {
      // Hasher le mot de passe avant la création
      user.password = hashPassword(user.password);
      console.log(`Création de l'utilisateur ${user.name}`);
    });
    
    User.created((user: User) => {
      // Actions après la création de l'utilisateur
      console.log(`Utilisateur ${user.name} créé avec l'ID ${user.id}`);
      // Envoyer un email de bienvenue, par exemple
    });
    
    User.updating((user: User) => {
      // Vérifier si le mot de passe a été modifié
      if (user.isDirty('password')) {
        user.password = hashPassword(user.password);
      }
      console.log(`Mise à jour de l'utilisateur ${user.name}`);
    });
    
    User.deleting((user: User) => {
      // Actions avant la suppression
      console.log(`Suppression de l'utilisateur ${user.name}`);
      // Sauvegarder les données importantes ailleurs, par exemple
    });
    
    User.saved((user: User) => {
      // Actions après sauvegarde (création ou mise à jour)
      console.log(`Utilisateur ${user.name} sauvegardé`);
    });
  }
}

// Définition du modèle Post avec des observateurs personnalisés
class Post extends Model {
  declare id: number;
  declare title: string;
  declare content: string;
  declare published: boolean;
  declare user_id: number;
  
  user() {
    return this.belongsTo(User);
  }
  
  // Méthode pour enregistrer des observateurs personnalisés
  static registerObservers() {
    // Observer pour la publication d'un post
    Post.observe('publishing', (post: Post) => {
      if (!post.published) {
        post.published = true;
        console.log(`Publication du post "${post.title}"`);
      }
    });
    
    // Observer pour la dépublication d'un post
    Post.observe('unpublishing', (post: Post) => {
      if (post.published) {
        post.published = false;
        console.log(`Dépublication du post "${post.title}"`);
      }
    });
  }
  
  // Méthodes pour déclencher les événements personnalisés
  async publish() {
    await this.fireEvent('publishing');
    return await this.save();
  }
  
  async unpublish() {
    await this.fireEvent('unpublishing');
    return await this.save();
  }
}

// Enregistrer les observateurs personnalisés
Post.registerObservers();

// Fonction utilitaire pour simuler le hashage de mot de passe
function hashPassword(password: string): string {
  // Dans un cas réel, utilisez bcrypt ou une autre bibliothèque de hashage
  return `hashed_${password}`;
}

// Exemple d'utilisation
async function runExample() {
  try {
    // Créer les tables
    await Teloquent.schema.createTable('users', (table) => {
      table.increments('id');
      table.string('name');
      table.string('email').unique();
      table.string('password');
      table.datetime('last_login').nullable();
      table.timestamps();
    });
    
    await Teloquent.schema.createTable('posts', (table) => {
      table.increments('id');
      table.string('title');
      table.text('content');
      table.boolean('published').defaultTo(false);
      table.integer('user_id').unsigned();
      table.foreign('user_id').references('id').on('users');
      table.timestamps();
    });
    
    // Créer un utilisateur (déclenchera les événements creating et created)
    const user = new User();
    user.name = 'Marie Dupont';
    user.email = 'marie@example.com';
    user.password = 'password123';
    await user.save();
    
    // Mettre à jour un utilisateur (déclenchera les événements updating et saved)
    user.name = 'Marie Martin';
    await user.save();
    
    // Créer un post
    const post = new Post();
    post.title = 'Mon premier article';
    post.content = 'Contenu de l\'article...';
    post.user_id = user.id;
    await post.save();
    
    // Publier le post (déclenchera l'événement personnalisé 'publishing')
    await post.publish();
    
    // Dépublier le post (déclenchera l'événement personnalisé 'unpublishing')
    await post.unpublish();
    
    // Supprimer l'utilisateur (déclenchera l'événement deleting)
    await user.delete();
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Exécuter l'exemple
runExample();
