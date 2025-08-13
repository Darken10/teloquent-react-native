/**
 * Tests unitaires pour les relations entre modèles
 */
import { Model } from '../../model';
import { Teloquent } from '../../teloquent';

// Mock de la connexion à la base de données
const mockDb = {
  transaction: jest.fn((callback) => {
    callback({
      executeSql: jest.fn((query, params, success) => {
        if (query.includes('users')) {
          success({}, { 
            rows: { 
              _array: [{ id: 1, name: 'Test User', email: 'test@example.com' }],
              length: 1,
              item: () => ({ id: 1, name: 'Test User', email: 'test@example.com' })
            }, 
            rowsAffected: 0 
          });
        } else if (query.includes('posts')) {
          success({}, { 
            rows: { 
              _array: [
                { id: 1, title: 'Post 1', content: 'Content 1', user_id: 1 },
                { id: 2, title: 'Post 2', content: 'Content 2', user_id: 1 }
              ],
              length: 2,
              item: (idx: number) => ({ 
                id: idx + 1, 
                title: `Post ${idx + 1}`, 
                content: `Content ${idx + 1}`, 
                user_id: 1 
              })
            }, 
            rowsAffected: 0 
          });
        } else if (query.includes('profiles')) {
          success({}, { 
            rows: { 
              _array: [{ id: 1, bio: 'Test Bio', avatar: 'avatar.jpg', user_id: 1 }],
              length: 1,
              item: () => ({ id: 1, bio: 'Test Bio', avatar: 'avatar.jpg', user_id: 1 })
            }, 
            rowsAffected: 0 
          });
        } else if (query.includes('comments')) {
          success({}, { 
            rows: { 
              _array: [
                { id: 1, content: 'Comment 1', post_id: 1, user_id: 1 },
                { id: 2, content: 'Comment 2', post_id: 1, user_id: 1 }
              ],
              length: 2,
              item: (idx: number) => ({ 
                id: idx + 1, 
                content: `Comment ${idx + 1}`, 
                post_id: 1, 
                user_id: 1 
              })
            }, 
            rowsAffected: 0 
          });
        } else if (query.includes('role_user')) {
          success({}, { 
            rows: { 
              _array: [
                { role_id: 1, user_id: 1, created_at: '2025-08-13T10:00:00.000Z' },
                { role_id: 2, user_id: 1, created_at: '2025-08-13T10:00:00.000Z' }
              ],
              length: 2,
              item: (idx: number) => ({ 
                role_id: idx + 1, 
                user_id: 1, 
                created_at: '2025-08-13T10:00:00.000Z' 
              })
            }, 
            rowsAffected: 0 
          });
        } else if (query.includes('roles')) {
          success({}, { 
            rows: { 
              _array: [
                { id: 1, name: 'Admin' },
                { id: 2, name: 'Editor' }
              ],
              length: 2,
              item: (idx: number) => ({ 
                id: idx + 1, 
                name: idx === 0 ? 'Admin' : 'Editor' 
              })
            }, 
            rowsAffected: 0 
          });
        } else {
          success({}, { rows: { _array: [], length: 0, item: () => ({}) }, rowsAffected: 0 });
        }
      })
    });
    return Promise.resolve();
  })
};

// Initialiser Teloquent avec le mock
beforeAll(() => {
  Teloquent.initialize({
    driver: 'expo',
    database: mockDb as any,
    debug: false
  });
});

// Définition des modèles pour les tests
class User extends Model {
  declare id: number;
  declare name: string;
  declare email: string;
  
  // Relation one-to-one
  profile() {
    return this.hasOne(Profile);
  }
  
  // Relation one-to-many
  posts() {
    return this.hasMany(Post);
  }
  
  // Relation many-to-many
  roles() {
    return this.belongsToMany(Role, 'role_user', 'user_id', 'role_id');
  }
}

class Profile extends Model {
  declare id: number;
  declare bio: string;
  declare avatar: string;
  declare user_id: number;
  
  // Relation inverse one-to-one
  user() {
    return this.belongsTo(User);
  }
}

class Post extends Model {
  declare id: number;
  declare title: string;
  declare content: string;
  declare user_id: number;
  
  // Relation inverse one-to-many
  user() {
    return this.belongsTo(User);
  }
  
  // Relation one-to-many
  comments() {
    return this.hasMany(Comment);
  }
}

class Comment extends Model {
  declare id: number;
  declare content: string;
  declare post_id: number;
  declare user_id: number;
  
  // Relations inverses
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
  
  // Relation many-to-many
  users() {
    return this.belongsToMany(User, 'role_user', 'role_id', 'user_id');
  }
}

describe('Relations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('One-to-One (HasOne)', () => {
    test('devrait récupérer une relation hasOne', async () => {
      const user = await User.find(1);
      const profile = await user?.profile().first();
      
      expect(profile).toBeDefined();
      expect(profile?.user_id).toBe(user?.id);
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait récupérer une relation hasOne avec eager loading', async () => {
      const user = await User.with('profile').find(1);
      const profile = user?.getRelation('profile');
      
      expect(profile).toBeDefined();
      expect(profile?.user_id).toBe(user?.id);
      expect(mockDb.transaction).toHaveBeenCalled();
    });
  });
  
  describe('One-to-One (BelongsTo)', () => {
    test('devrait récupérer une relation belongsTo', async () => {
      const profile = await Profile.find(1);
      const user = await profile?.user().first();
      
      expect(user).toBeDefined();
      expect(user?.id).toBe(profile?.user_id);
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait récupérer une relation belongsTo avec eager loading', async () => {
      const profile = await Profile.with('user').find(1);
      const user = profile?.getRelation('user');
      
      expect(user).toBeDefined();
      expect(user?.id).toBe(profile?.user_id);
      expect(mockDb.transaction).toHaveBeenCalled();
    });
  });
  
  describe('One-to-Many (HasMany)', () => {
    test('devrait récupérer une relation hasMany', async () => {
      const user = await User.find(1);
      const posts = await user?.posts().get();
      
      expect(posts).toBeDefined();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts?.length).toBeGreaterThan(0);
      expect(posts?.[0].user_id).toBe(user?.id);
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait récupérer une relation hasMany avec eager loading', async () => {
      const user = await User.with('posts').find(1);
      const posts = user?.getRelation('posts');
      
      expect(posts).toBeDefined();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts?.length).toBeGreaterThan(0);
      expect(posts?.[0].user_id).toBe(user?.id);
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait récupérer une relation hasMany avec conditions', async () => {
      const user = await User.find(1);
      const posts = await user?.posts().where('id', 1).get();
      
      expect(posts).toBeDefined();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts?.length).toBe(1);
      expect(posts?.[0].id).toBe(1);
      expect(mockDb.transaction).toHaveBeenCalled();
    });
  });
  
  describe('Many-to-Many (BelongsToMany)', () => {
    test('devrait récupérer une relation belongsToMany', async () => {
      const user = await User.find(1);
      const roles = await user?.roles().get();
      
      expect(roles).toBeDefined();
      expect(Array.isArray(roles)).toBe(true);
      expect(roles?.length).toBeGreaterThan(0);
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait récupérer une relation belongsToMany avec eager loading', async () => {
      const user = await User.with('roles').find(1);
      const roles = user?.getRelation('roles');
      
      expect(roles).toBeDefined();
      expect(Array.isArray(roles)).toBe(true);
      expect(roles?.length).toBeGreaterThan(0);
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait récupérer une relation belongsToMany avec données pivot', async () => {
      const user = await User.find(1);
      const roles = await user?.roles().withPivot(['created_at']).get();
      
      expect(roles).toBeDefined();
      expect(Array.isArray(roles)).toBe(true);
      expect(roles?.length).toBeGreaterThan(0);
      expect(roles?.[0].pivot).toBeDefined();
      expect(roles?.[0].pivot.created_at).toBeDefined();
      expect(mockDb.transaction).toHaveBeenCalled();
    });
  });
  
  describe('Relations imbriquées', () => {
    test('devrait récupérer des relations imbriquées avec eager loading', async () => {
      const user = await User.with(['posts.comments']).find(1);
      const posts = user?.getRelation('posts');
      
      expect(posts).toBeDefined();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts?.length).toBeGreaterThan(0);
      
      const comments = posts?.[0].getRelation('comments');
      expect(comments).toBeDefined();
      expect(Array.isArray(comments)).toBe(true);
      expect(comments?.length).toBeGreaterThan(0);
      
      expect(mockDb.transaction).toHaveBeenCalled();
    });
  });
  
  describe('Opérations sur les relations', () => {
    test('devrait créer un enregistrement via une relation', async () => {
      const user = await User.find(1);
      const post = await user?.posts().create({
        title: 'New Post',
        content: 'New Content'
      });
      
      expect(post).toBeDefined();
      expect(post?.user_id).toBe(user?.id);
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait attacher des enregistrements à une relation many-to-many', async () => {
      const user = await User.find(1);
      await user?.roles().attach([3, 4]);
      
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait détacher des enregistrements d\'une relation many-to-many', async () => {
      const user = await User.find(1);
      await user?.roles().detach([2]);
      
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait synchroniser des enregistrements dans une relation many-to-many', async () => {
      const user = await User.find(1);
      await user?.roles().sync([1, 3]);
      
      expect(mockDb.transaction).toHaveBeenCalled();
    });
  });
});
