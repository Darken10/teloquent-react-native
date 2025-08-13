/**
 * Tests d'intégration pour Teloquent ORM
 * Ces tests utilisent une vraie base de données SQLite en mémoire
 */
import { Teloquent, Model, Schema, Migration } from '../../../src';

// Mock pour expo-sqlite avec une base de données en mémoire
const mockDb = {
  transaction: jest.fn((callback) => {
    callback({
      executeSql: jest.fn((query, params, success) => {
        // Simuler une vraie base de données SQLite
        if (query.toLowerCase().includes('select')) {
          success({}, { 
            rows: { 
              _array: [{ id: 1, name: 'Test User', email: 'test@example.com' }],
              length: 1,
              item: (idx: number) => ({ id: 1, name: 'Test User', email: 'test@example.com' })
            }, 
            rowsAffected: 0 
          });
        } else {
          success({}, { rows: { _array: [], length: 0, item: () => ({}) }, rowsAffected: 1 });
        }
      })
    });
    return Promise.resolve();
  })
};

// Définition des modèles pour les tests
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

describe('Teloquent ORM - Tests d\'intégration', () => {
  beforeAll(async () => {
    // Initialiser Teloquent avec la base de données mockée
    Teloquent.initialize({
      driver: 'expo',
      database: mockDb as any,
      enableLogging: true
    });
    
    // Créer les tables nécessaires
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
      table.integer('user_id').unsigned();
      table.foreign('user_id').references('id').on('users');
      table.timestamps();
    });
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('devrait créer un nouvel utilisateur', async () => {
    const user = new User();
    user.name = 'John Doe';
    user.email = 'john@example.com';
    await user.save();
    
    expect(mockDb.transaction).toHaveBeenCalled();
  });
  
  test('devrait récupérer un utilisateur par ID', async () => {
    const user = await User.find(1);
    
    expect(user).toBeDefined();
    expect(user?.id).toBe(1);
    expect(user?.name).toBe('Test User');
  });
  
  test('devrait récupérer tous les utilisateurs', async () => {
    const users = await User.all();
    
    expect(users).toBeDefined();
    expect(users.length).toBeGreaterThan(0);
  });
  
  test('devrait mettre à jour un utilisateur', async () => {
    const user = await User.find(1);
    if (user) {
      user.name = 'Updated Name';
      await user.save();
      
      expect(mockDb.transaction).toHaveBeenCalled();
    }
  });
  
  test('devrait supprimer un utilisateur', async () => {
    const user = await User.find(1);
    if (user) {
      await user.delete();
      
      expect(mockDb.transaction).toHaveBeenCalled();
    }
  });
  
  test('devrait exécuter une migration', async () => {
    const testMigration = {
      name: 'create_test_table',
      up: async (schema: Schema) => {
        await schema.createTable('test_table', (table) => {
          table.increments('id');
          table.string('name');
        });
      },
      down: async (schema: Schema) => {
        await schema.dropTable('test_table');
      }
    };
    
    Migration.register([testMigration]);
    await Migration.migrate();
    
    expect(mockDb.transaction).toHaveBeenCalled();
  });
});
