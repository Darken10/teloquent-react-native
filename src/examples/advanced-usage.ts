/**
 * Exemple d'utilisation avancée de Teloquent
 */
import { Teloquent, Model, Schema, Migration } from '../index';

// Définition des modèles
class User extends Model {
  declare id: number;
  declare name: string;
  declare email: string;
  declare role: string;
  declare created_at: string;
  declare updated_at: string;
  
  // Définir les attributs cachés
  protected hidden = ['password'];
  
  // Définir les conversions de type
  protected casts = {
    is_admin: 'boolean',
    preferences: 'object'
  };
  
  // Relations
  posts() {
    return this.hasMany(Post);
  }
  
  profile() {
    return this.hasOne(Profile);
  }
  
  roles() {
    return this.belongsToMany(Role, 'user_roles', 'user_id', 'role_id');
  }
  
  // Accesseur personnalisé
  getFullNameAttribute(): string {
    return `${this.name} (${this.email})`;
  }
}

class Profile extends Model {
  declare id: number;
  declare user_id: number;
  declare bio: string;
  declare avatar: string;
  declare created_at: string;
  declare updated_at: string;
  
  // Relations
  user() {
    return this.belongsTo(User);
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
  
  categories() {
    return this.belongsToMany(Category, 'post_categories', 'post_id', 'category_id');
  }
  
  comments() {
    return this.hasMany(Comment);
  }
}

class Category extends Model {
  declare id: number;
  declare name: string;
  declare slug: string;
  declare created_at: string;
  declare updated_at: string;
  
  // Relations
  posts() {
    return this.belongsToMany(Post, 'post_categories', 'category_id', 'post_id');
  }
}

class Comment extends Model {
  declare id: number;
  declare post_id: number;
  declare user_id: number;
  declare content: string;
  declare created_at: string;
  declare updated_at: string;
  
  // Relations
  post() {
    return this.belongsTo(Post);
  }
  
  user() {
    return this.belongsTo(User);
  }
}

class Role extends Model {
  declare id: number;
  declare name: string;
  declare created_at: string;
  declare updated_at: string;
  
  // Relations
  users() {
    return this.belongsToMany(User, 'user_roles', 'role_id', 'user_id');
  }
}

// Définition des migrations
const createUsersMigration = {
  name: '2023_01_01_create_users_table',
  up: async (schema: typeof Schema) => {
    await schema.createTable('users', (table) => {
      table.increments('id');
      table.string('name');
      table.string('email').unique();
      table.string('password');
      table.string('role').defaultValue('user');
      table.boolean('is_admin').defaultValue(false);
      table.json('preferences').nullable();
      table.timestamps();
    });
  },
  down: async (schema: typeof Schema) => {
    await schema.dropTable('users');
  }
};

const createProfilesMigration = {
  name: '2023_01_02_create_profiles_table',
  up: async (schema: typeof Schema) => {
    await schema.createTable('profiles', (table) => {
      table.increments('id');
      table.integer('user_id');
      table.text('bio').nullable();
      table.string('avatar').nullable();
      table.timestamps();
      
      table.foreign('user_id').references('id').on('users').onDelete('CASCADE');
    });
  },
  down: async (schema: typeof Schema) => {
    await schema.dropTable('profiles');
  }
};

const createPostsMigration = {
  name: '2023_01_03_create_posts_table',
  up: async (schema: typeof Schema) => {
    await schema.createTable('posts', (table) => {
      table.increments('id');
      table.string('title');
      table.text('content');
      table.integer('user_id');
      table.timestamps();
      
      table.foreign('user_id').references('id').on('users').onDelete('CASCADE');
    });
  },
  down: async (schema: typeof Schema) => {
    await schema.dropTable('posts');
  }
};

// Exemple d'utilisation avancée
async function advancedExample() {
  try {
    // Enregistrer les migrations
    Migration.register(createUsersMigration);
    Migration.register(createProfilesMigration);
    Migration.register(createPostsMigration);
    
    // Exécuter les migrations
    await Migration.migrate();
    
    // Créer un utilisateur avec son profil
    const user = await User.create({
      name: 'Marie Martin',
      email: 'marie@exemple.fr',
      role: 'editor',
      is_admin: false,
      preferences: { theme: 'dark', notifications: true }
    });
    
    // Créer un profil pour l'utilisateur
    const profile = new Profile();
    profile.bio = 'Rédactrice passionnée';
    profile.avatar = 'avatar.jpg';
    
    // Associer le profil à l'utilisateur
    await user.profile().save(profile);
    
    // Créer des posts pour l'utilisateur
    const post1 = await Post.create({
      title: 'Premier article',
      content: 'Contenu du premier article...',
      user_id: user.id
    });
    
    const post2 = await Post.create({
      title: 'Deuxième article',
      content: 'Contenu du deuxième article...',
      user_id: user.id
    });
    
    // Créer des catégories
    const category1 = await Category.create({
      name: 'Technologie',
      slug: 'technologie'
    });
    
    const category2 = await Category.create({
      name: 'Lifestyle',
      slug: 'lifestyle'
    });
    
    // Associer des catégories aux posts
    await post1.categories().attach([category1.id, category2.id]);
    await post2.categories().attach(category1.id);
    
    // Ajouter des commentaires
    await Comment.create({
      post_id: post1.id,
      user_id: user.id,
      content: 'Super article !'
    });
    
    // Requêtes avancées
    
    // 1. Récupérer un utilisateur avec son profil et ses posts
    const userWithRelations = await User
      .with(['profile', 'posts'])
      .find(user.id);
    
    console.log('Utilisateur avec relations:', userWithRelations?.toJson());
    
    // 2. Récupérer les posts avec leurs catégories et commentaires
    const postsWithRelations = await Post
      .with(['categories', 'comments', 'user'])
      .get();
    
    console.log('Posts avec relations:', postsWithRelations.toJson());
    
    // 3. Requête avec conditions multiples
    const filteredPosts = await Post
      .where('title', 'LIKE', '%article%')
      .where('created_at', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .orderBy('created_at', 'desc')
      .get();
    
    console.log('Posts filtrés:', filteredPosts.toJson());
    
    // 4. Compter le nombre de posts par utilisateur
    const userPostCount = await Post
      .select('user_id')
      .groupBy('user_id')
      .count();
    
    console.log('Nombre de posts par utilisateur:', userPostCount);
    
    // 5. Mettre à jour les catégories d'un post
    await post1.categories().sync([category2.id]);
    
    // 6. Rafraîchir le modèle depuis la base de données
    await post1.refresh();
    
    console.log('Post après mise à jour des catégories:', post1.toJson());
    
    // 7. Transactions
    await DB.beginTransaction(async (tx) => {
      // Opérations dans une transaction
      const newPost = await Post.create({
        title: 'Article dans une transaction',
        content: 'Contenu...',
        user_id: user.id
      });
      
      await Comment.create({
        post_id: newPost.id,
        user_id: user.id,
        content: 'Commentaire dans une transaction'
      });
    });
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Exécuter l'exemple
// advancedExample();
