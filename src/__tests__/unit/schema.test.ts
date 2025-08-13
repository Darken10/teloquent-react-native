/**
 * Tests unitaires pour le système de schéma
 */
import { Schema } from '../../schema';
import { Teloquent } from '../../teloquent';
import { Blueprint } from '../../schema/blueprint';

// Mock de la connexion à la base de données
const mockDb = {
  transaction: jest.fn((callback) => {
    callback({
      executeSql: jest.fn((query, params, success) => {
        if (query.includes('sqlite_master')) {
          // Simuler la vérification d'existence de table
          const tableExists = query.includes('users');
          success({}, { 
            rows: { 
              _array: tableExists ? [{ name: 'users' }] : [],
              length: tableExists ? 1 : 0,
              item: (idx: number) => tableExists ? { name: 'users' } : null
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

describe('Schema', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Création de tables', () => {
    test('devrait créer une table simple', async () => {
      await Schema.createTable('test_table', (table) => {
        table.increments('id');
        table.string('name');
        table.timestamps();
      });
      
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait créer une table avec des colonnes avancées', async () => {
      await Schema.createTable('advanced_table', (table) => {
        table.increments('id');
        table.string('name', 100).notNullable();
        table.text('description').nullable();
        table.integer('count').unsigned().defaultTo(0);
        table.decimal('price', 8, 2);
        table.boolean('is_active').defaultTo(true);
        table.date('birth_date');
        table.datetime('created_at');
        table.timestamp('updated_at').defaultTo(table.fn.now());
      });
      
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait créer une table avec des clés étrangères', async () => {
      await Schema.createTable('posts', (table) => {
        table.increments('id');
        table.string('title');
        table.text('content');
        table.integer('user_id').unsigned();
        table.foreign('user_id').references('id').on('users').onDelete('CASCADE');
        table.timestamps();
      });
      
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait créer une table avec des index', async () => {
      await Schema.createTable('indexed_table', (table) => {
        table.increments('id');
        table.string('email').unique();
        table.string('username').index();
        table.integer('category_id');
        table.index(['category_id', 'created_at']);
        table.timestamps();
      });
      
      expect(mockDb.transaction).toHaveBeenCalled();
    });
  });
  
  describe('Modification de tables', () => {
    test('devrait modifier une table existante', async () => {
      await Schema.table('users', (table) => {
        table.string('phone').nullable();
        table.boolean('is_active').defaultTo(true);
      });
      
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait supprimer des colonnes', async () => {
      await Schema.table('users', (table) => {
        table.dropColumn('unused_column');
      });
      
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait renommer des colonnes', async () => {
      await Schema.table('users', (table) => {
        table.renameColumn('old_name', 'new_name');
      });
      
      expect(mockDb.transaction).toHaveBeenCalled();
    });
  });
  
  describe('Suppression de tables', () => {
    test('devrait supprimer une table', async () => {
      await Schema.dropTable('temporary_table');
      
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait supprimer une table si elle existe', async () => {
      await Schema.dropTableIfExists('maybe_exists');
      
      expect(mockDb.transaction).toHaveBeenCalled();
    });
  });
  
  describe('Vérification d\'existence', () => {
    test('devrait vérifier si une table existe', async () => {
      const exists = await Schema.hasTable('users');
      
      expect(exists).toBe(true);
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait vérifier si une colonne existe', async () => {
      // Mock pour la vérification de colonne
      mockDb.transaction.mockImplementationOnce((callback) => {
        callback({
          executeSql: jest.fn((query, params, success) => {
            success({}, { 
              rows: { 
                _array: [{ name: 'email' }],
                length: 1,
                item: () => ({ name: 'email' })
              }, 
              rowsAffected: 0 
            });
          })
        });
        return Promise.resolve();
      });
      
      const exists = await Schema.hasColumn('users', 'email');
      
      expect(exists).toBe(true);
      expect(mockDb.transaction).toHaveBeenCalled();
    });
  });
  
  describe('Blueprint', () => {
    test('devrait créer un objet Blueprint', () => {
      const blueprint = new Blueprint('test_table');
      
      expect(blueprint).toBeInstanceOf(Blueprint);
      expect(blueprint.getTableName()).toBe('test_table');
    });
    
    test('devrait ajouter des colonnes au Blueprint', () => {
      const blueprint = new Blueprint('test_table');
      
      blueprint.increments('id');
      blueprint.string('name');
      blueprint.integer('age');
      
      const columns = blueprint.getColumns();
      
      expect(columns.length).toBe(3);
      expect(columns[0].name).toBe('id');
      expect(columns[1].name).toBe('name');
      expect(columns[2].name).toBe('age');
    });
    
    test('devrait générer le SQL pour créer une table', () => {
      const blueprint = new Blueprint('test_table');
      
      blueprint.increments('id');
      blueprint.string('name').notNullable();
      blueprint.integer('age').defaultTo(18);
      
      const sql = blueprint.toSql();
      
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS test_table');
      expect(sql).toContain('id INTEGER PRIMARY KEY AUTOINCREMENT');
      expect(sql).toContain('name TEXT NOT NULL');
      expect(sql).toContain('age INTEGER DEFAULT 18');
    });
    
    test('devrait générer le SQL pour modifier une table', () => {
      const blueprint = new Blueprint('test_table', true);
      
      blueprint.string('new_column').nullable();
      
      const statements = blueprint.toSql();
      
      expect(Array.isArray(statements)).toBe(true);
      expect(statements.length).toBeGreaterThan(0);
      expect(statements[0]).toContain('ALTER TABLE test_table ADD COLUMN new_column TEXT');
    });
  });
});
