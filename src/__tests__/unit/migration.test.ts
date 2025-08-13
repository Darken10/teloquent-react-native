/**
 * Tests unitaires pour le système de migrations
 */
import { Migration } from '../../migration';
import { Schema } from '../../schema';
import { Teloquent } from '../../teloquent';
import { MigrationRecord, MigrationStatus } from '../../types/migration';

// Mock de la connexion à la base de données
const mockDb = {
  transaction: jest.fn((callback) => {
    callback({
      executeSql: jest.fn((query, params, success) => {
        if (query.includes('migrations')) {
          // Simuler la table de migrations
          success({}, { 
            rows: { 
              _array: [
                { id: 1, name: 'create_users_table', batch: 1, status: 'completed', created_at: '2025-08-13T10:00:00.000Z' }
              ],
              length: 1,
              item: (idx: number) => ({ 
                id: 1, 
                name: 'create_users_table', 
                batch: 1, 
                status: 'completed', 
                created_at: '2025-08-13T10:00:00.000Z' 
              })
            }, 
            rowsAffected: 0 
          });
        } else {
          // Autres requêtes
          success({}, { rows: { _array: [], length: 0, item: () => ({}) }, rowsAffected: 1 });
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

// Migrations de test
const createUsersTable = {
  name: 'create_users_table',
  up: async (schema: Schema) => {
    await schema.createTable('users', (table) => {
      table.increments('id');
      table.string('name');
      table.string('email').unique();
      table.timestamps();
    });
  },
  down: async (schema: Schema) => {
    await schema.dropTable('users');
  }
};

const createPostsTable = {
  name: 'create_posts_table',
  up: async (schema: Schema) => {
    await schema.createTable('posts', (table) => {
      table.increments('id');
      table.string('title');
      table.text('content');
      table.integer('user_id').unsigned();
      table.foreign('user_id').references('id').on('users');
      table.timestamps();
    });
  },
  down: async (schema: Schema) => {
    await schema.dropTable('posts');
  }
};

describe('Migration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Réinitialiser les migrations enregistrées
    Migration['migrations'] = [];
  });
  
  describe('Enregistrement des migrations', () => {
    test('devrait enregistrer une migration', () => {
      Migration.register(createUsersTable);
      
      expect(Migration['migrations'].length).toBe(1);
      expect(Migration['migrations'][0].name).toBe('create_users_table');
    });
    
    test('devrait enregistrer plusieurs migrations', () => {
      Migration.register([createUsersTable, createPostsTable]);
      
      expect(Migration['migrations'].length).toBe(2);
      expect(Migration['migrations'][0].name).toBe('create_users_table');
      expect(Migration['migrations'][1].name).toBe('create_posts_table');
    });
  });
  
  describe('Initialisation de la table de migrations', () => {
    test('devrait créer la table de migrations si elle n\'existe pas', async () => {
      await Migration.initialize();
      
      expect(mockDb.transaction).toHaveBeenCalled();
    });
  });
  
  describe('Exécution des migrations', () => {
    beforeEach(() => {
      // Enregistrer les migrations de test
      Migration.register([createUsersTable, createPostsTable]);
    });
    
    test('devrait exécuter les migrations', async () => {
      // Mock pour simuler que les migrations n'ont pas encore été exécutées
      mockDb.transaction.mockImplementationOnce((callback) => {
        callback({
          executeSql: jest.fn((query, params, success) => {
            success({}, { rows: { _array: [], length: 0, item: () => ({}) }, rowsAffected: 0 });
          })
        });
        return Promise.resolve();
      });
      
      const result = await Migration.migrate();
      
      expect(result.migrated.length).toBeGreaterThan(0);
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait annuler les migrations', async () => {
      const result = await Migration.rollback();
      
      expect(result.rolledBack.length).toBeGreaterThan(0);
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait réinitialiser les migrations', async () => {
      const result = await Migration.reset();
      
      expect(result.rolledBack.length).toBeGreaterThan(0);
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait rafraîchir les migrations', async () => {
      const result = await Migration.refresh();
      
      expect(result.rolledBack.length).toBeGreaterThan(0);
      expect(result.migrated.length).toBeGreaterThan(0);
      expect(mockDb.transaction).toHaveBeenCalled();
    });
  });
  
  describe('Récupération des informations sur les migrations', () => {
    test('devrait récupérer les migrations exécutées', async () => {
      const migrations = await Migration.getMigrations();
      
      expect(Array.isArray(migrations)).toBe(true);
      expect(migrations.length).toBeGreaterThan(0);
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait récupérer le statut des migrations', async () => {
      const status = await Migration.status();
      
      expect(Array.isArray(status)).toBe(true);
      expect(status.length).toBeGreaterThan(0);
      expect(mockDb.transaction).toHaveBeenCalled();
    });
  });
  
  describe('Gestion des erreurs', () => {
    test('devrait gérer les erreurs lors de l\'exécution des migrations', async () => {
      // Migration qui échoue
      const failingMigration = {
        name: 'failing_migration',
        up: async () => {
          throw new Error('Erreur de test');
        },
        down: async () => {}
      };
      
      Migration.register(failingMigration);
      
      // Mock pour simuler que la migration n'a pas encore été exécutée
      mockDb.transaction.mockImplementationOnce((callback) => {
        callback({
          executeSql: jest.fn((query, params, success) => {
            success({}, { rows: { _array: [], length: 0, item: () => ({}) }, rowsAffected: 0 });
          })
        });
        return Promise.resolve();
      });
      
      try {
        await Migration.migrate();
        fail('La migration aurait dû échouer');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
