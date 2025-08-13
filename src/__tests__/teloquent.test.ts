/**
 * Tests pour Teloquent ORM
 */
import { Teloquent, Model, Schema, DB, Collection } from '../index';
import * as SQLite from 'expo-sqlite';

// Mock pour expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabase: jest.fn().mockReturnValue({
    transaction: jest.fn((callback) => {
      callback({
        executeSql: jest.fn((query, params, success) => {
          success({}, { rows: { _array: [] }, rowsAffected: 1 });
        })
      });
      return Promise.resolve();
    })
  })
}));

describe('Teloquent ORM', () => {
  // Définir un modèle de test
  class User extends Model {
    declare id: number;
    declare name: string;
    declare email: string;
    
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
  
  beforeAll(() => {
    // Initialiser Teloquent avec le mock de SQLite
    const db = SQLite.openDatabase('test.db');
    Teloquent.initialize({ driver: 'expo', database: db });
  });
  
  beforeEach(async () => {
    // Créer les tables de test
    await Schema.createTable('users', (table) => {
      table.increments('id');
      table.string('name');
      table.string('email');
      table.timestamps();
    });
    
    await Schema.createTable('posts', (table) => {
      table.increments('id');
      table.string('title');
      table.text('content');
      table.integer('user_id');
      table.timestamps();
    });
    
    // Espionner les méthodes de DB
    jest.spyOn(DB, 'insert').mockResolvedValue(1);
    jest.spyOn(DB, 'update').mockResolvedValue(1);
    jest.spyOn(DB, 'delete').mockResolvedValue(1);
    jest.spyOn(DB, 'select').mockImplementation((query) => {
      if (query.includes('users')) {
        return Promise.resolve([
          { id: 1, name: 'Test User', email: 'test@example.com', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ]);
      } else if (query.includes('posts')) {
        return Promise.resolve([
          { id: 1, title: 'Test Post', content: 'Content...', user_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ]);
      }
      return Promise.resolve([]);
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('devrait créer une instance de modèle', () => {
    const user = new User();
    expect(user).toBeInstanceOf(User);
    expect(user).toBeInstanceOf(Model);
  });
  
  test('devrait définir et récupérer des attributs', () => {
    const user = new User();
    user.name = 'Test User';
    user.email = 'test@example.com';
    
    expect(user.name).toBe('Test User');
    expect(user.email).toBe('test@example.com');
  });
  
  test('devrait sauvegarder un modèle', async () => {
    const user = new User();
    user.name = 'Test User';
    user.email = 'test@example.com';
    
    await user.save();
    
    expect(DB.insert).toHaveBeenCalled();
    expect(user.id).toBeDefined();
  });
  
  test('devrait récupérer tous les modèles', async () => {
    const users = await User.all();
    
    expect(DB.select).toHaveBeenCalled();
    expect(users).toBeInstanceOf(Collection);
    expect(users.length).toBeGreaterThan(0);
  });
  
  test('devrait trouver un modèle par ID', async () => {
    const user = await User.find(1);
    
    expect(DB.select).toHaveBeenCalled();
    expect(user).toBeInstanceOf(User);
    expect(user?.id).toBe(1);
  });
  
  test('devrait mettre à jour un modèle', async () => {
    const user = await User.find(1);
    if (user) {
      user.name = 'Updated Name';
      await user.save();
      
      expect(DB.update).toHaveBeenCalled();
    }
  });
  
  test('devrait supprimer un modèle', async () => {
    const user = await User.find(1);
    if (user) {
      await user.delete();
      
      expect(DB.delete).toHaveBeenCalled();
    }
  });
  
  test('devrait construire des requêtes avec le Query Builder', async () => {
    const users = await User
      .where('name', 'LIKE', '%Test%')
      .orderBy('created_at', 'desc')
      .limit(10)
      .get();
    
    expect(DB.select).toHaveBeenCalled();
    expect(users).toBeInstanceOf(Collection);
  });
  
  test('devrait charger des relations', async () => {
    jest.spyOn(DB, 'select').mockImplementation((query) => {
      if (query.includes('users')) {
        return Promise.resolve([
          { id: 1, name: 'Test User', email: 'test@example.com', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ]);
      } else if (query.includes('posts')) {
        return Promise.resolve([
          { id: 1, title: 'Test Post 1', content: 'Content 1', user_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 2, title: 'Test Post 2', content: 'Content 2', user_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ]);
      }
      return Promise.resolve([]);
    });
    
    const user = await User.with('posts').find(1);
    
    expect(DB.select).toHaveBeenCalled();
    expect(user).toBeInstanceOf(User);
    expect(user?.posts).toBeDefined();
    expect(user?.posts().get()).toBeInstanceOf(Collection);
  });
});
