/**
 * Tests unitaires pour le Query Builder
 */
import { QueryBuilder } from '../../query/query-builder';
import { Teloquent } from '../../teloquent';

// Mock de la connexion à la base de données
const mockDb = {
  transaction: jest.fn((callback) => {
    callback({
      executeSql: jest.fn((query, params, success) => {
        success({}, { 
          rows: { 
            _array: [
              { id: 1, name: 'Test 1', email: 'test1@example.com' },
              { id: 2, name: 'Test 2', email: 'test2@example.com' }
            ],
            length: 2,
            item: (idx: number) => ({ 
              id: idx + 1, 
              name: `Test ${idx + 1}`, 
              email: `test${idx + 1}@example.com` 
            })
          }, 
          rowsAffected: 0 
        });
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

describe('QueryBuilder', () => {
  let query: QueryBuilder;
  
  beforeEach(() => {
    jest.clearAllMocks();
    query = new QueryBuilder('users');
  });
  
  describe('Sélection', () => {
    test('devrait construire une requête SELECT simple', () => {
      const sql = query.toSql();
      
      expect(sql).toBe('SELECT * FROM users');
    });
    
    test('devrait sélectionner des colonnes spécifiques', () => {
      const sql = query.select('id', 'name', 'email').toSql();
      
      expect(sql).toBe('SELECT id, name, email FROM users');
    });
    
    test('devrait supporter les alias de colonnes', () => {
      const sql = query.select('id', 'name as user_name', 'email').toSql();
      
      expect(sql).toBe('SELECT id, name as user_name, email FROM users');
    });
  });
  
  describe('Conditions WHERE', () => {
    test('devrait ajouter une condition WHERE simple', () => {
      const sql = query.where('id', '=', 1).toSql();
      
      expect(sql).toBe('SELECT * FROM users WHERE id = ?');
      expect(query.getBindings()).toEqual([1]);
    });
    
    test('devrait utiliser l\'opérateur = par défaut', () => {
      const sql = query.where('id', 1).toSql();
      
      expect(sql).toBe('SELECT * FROM users WHERE id = ?');
      expect(query.getBindings()).toEqual([1]);
    });
    
    test('devrait enchaîner plusieurs conditions WHERE avec AND', () => {
      const sql = query
        .where('id', '>', 1)
        .where('name', 'like', '%test%')
        .toSql();
      
      expect(sql).toBe('SELECT * FROM users WHERE id > ? AND name like ?');
      expect(query.getBindings()).toEqual([1, '%test%']);
    });
    
    test('devrait supporter les conditions OR', () => {
      const sql = query
        .where('id', 1)
        .orWhere('email', 'test@example.com')
        .toSql();
      
      expect(sql).toBe('SELECT * FROM users WHERE id = ? OR email = ?');
      expect(query.getBindings()).toEqual([1, 'test@example.com']);
    });
    
    test('devrait supporter les conditions NULL', () => {
      const sql = query
        .whereNull('deleted_at')
        .toSql();
      
      expect(sql).toBe('SELECT * FROM users WHERE deleted_at IS NULL');
    });
    
    test('devrait supporter les conditions NOT NULL', () => {
      const sql = query
        .whereNotNull('email')
        .toSql();
      
      expect(sql).toBe('SELECT * FROM users WHERE email IS NOT NULL');
    });
    
    test('devrait supporter les conditions IN', () => {
      const sql = query
        .whereIn('id', [1, 2, 3])
        .toSql();
      
      expect(sql).toBe('SELECT * FROM users WHERE id IN (?, ?, ?)');
      expect(query.getBindings()).toEqual([1, 2, 3]);
    });
    
    test('devrait supporter les conditions BETWEEN', () => {
      const sql = query
        .whereBetween('age', [18, 65])
        .toSql();
      
      expect(sql).toBe('SELECT * FROM users WHERE age BETWEEN ? AND ?');
      expect(query.getBindings()).toEqual([18, 65]);
    });
  });
  
  describe('Groupement et tri', () => {
    test('devrait ajouter une clause ORDER BY', () => {
      const sql = query
        .orderBy('name', 'asc')
        .toSql();
      
      expect(sql).toBe('SELECT * FROM users ORDER BY name asc');
    });
    
    test('devrait supporter plusieurs clauses ORDER BY', () => {
      const sql = query
        .orderBy('name', 'asc')
        .orderBy('created_at', 'desc')
        .toSql();
      
      expect(sql).toBe('SELECT * FROM users ORDER BY name asc, created_at desc');
    });
    
    test('devrait ajouter une clause GROUP BY', () => {
      const sql = query
        .groupBy('role_id')
        .toSql();
      
      expect(sql).toBe('SELECT * FROM users GROUP BY role_id');
    });
    
    test('devrait ajouter une clause HAVING', () => {
      const sql = query
        .groupBy('role_id')
        .having('count(*)', '>', 5)
        .toSql();
      
      expect(sql).toBe('SELECT * FROM users GROUP BY role_id HAVING count(*) > ?');
      expect(query.getBindings()).toEqual([5]);
    });
  });
  
  describe('Jointures', () => {
    test('devrait ajouter une jointure INNER JOIN', () => {
      const sql = query
        .join('posts', 'users.id', '=', 'posts.user_id')
        .toSql();
      
      expect(sql).toBe('SELECT * FROM users INNER JOIN posts ON users.id = posts.user_id');
    });
    
    test('devrait ajouter une jointure LEFT JOIN', () => {
      const sql = query
        .leftJoin('posts', 'users.id', '=', 'posts.user_id')
        .toSql();
      
      expect(sql).toBe('SELECT * FROM users LEFT JOIN posts ON users.id = posts.user_id');
    });
    
    test('devrait ajouter une jointure RIGHT JOIN', () => {
      const sql = query
        .rightJoin('posts', 'users.id', '=', 'posts.user_id')
        .toSql();
      
      expect(sql).toBe('SELECT * FROM users RIGHT JOIN posts ON users.id = posts.user_id');
    });
  });
  
  describe('Limites et décalages', () => {
    test('devrait ajouter une clause LIMIT', () => {
      const sql = query
        .limit(10)
        .toSql();
      
      expect(sql).toBe('SELECT * FROM users LIMIT 10');
    });
    
    test('devrait ajouter des clauses LIMIT et OFFSET', () => {
      const sql = query
        .limit(10)
        .offset(20)
        .toSql();
      
      expect(sql).toBe('SELECT * FROM users LIMIT 10 OFFSET 20');
    });
  });
  
  describe('Exécution de requêtes', () => {
    test('devrait exécuter une requête get()', async () => {
      const results = await query.get();
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2);
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait exécuter une requête first()', async () => {
      const result = await query.first();
      
      expect(result).toEqual({ id: 1, name: 'Test 1', email: 'test1@example.com' });
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait exécuter une requête find()', async () => {
      const result = await query.find(1);
      
      expect(result).toEqual({ id: 1, name: 'Test 1', email: 'test1@example.com' });
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait exécuter une requête count()', async () => {
      // Mock pour la requête count
      mockDb.transaction.mockImplementationOnce((callback) => {
        callback({
          executeSql: jest.fn((query, params, success) => {
            success({}, { 
              rows: { 
                _array: [{ count: 2 }],
                length: 1,
                item: () => ({ count: 2 })
              }, 
              rowsAffected: 0 
            });
          })
        });
        return Promise.resolve();
      });
      
      const count = await query.count();
      
      expect(count).toBe(2);
      expect(mockDb.transaction).toHaveBeenCalled();
    });
  });
  
  describe('Requêtes d\'insertion et de mise à jour', () => {
    test('devrait construire une requête INSERT', () => {
      const sql = query.insert({ name: 'Test', email: 'test@example.com' }).toSql();
      
      expect(sql).toBe('INSERT INTO users (name, email) VALUES (?, ?)');
      expect(query.getBindings()).toEqual(['Test', 'test@example.com']);
    });
    
    test('devrait construire une requête UPDATE', () => {
      const sql = query
        .where('id', 1)
        .update({ name: 'Updated', email: 'updated@example.com' })
        .toSql();
      
      expect(sql).toBe('UPDATE users SET name = ?, email = ? WHERE id = ?');
      expect(query.getBindings()).toEqual(['Updated', 'updated@example.com', 1]);
    });
    
    test('devrait construire une requête DELETE', () => {
      const sql = query
        .where('id', 1)
        .delete()
        .toSql();
      
      expect(sql).toBe('DELETE FROM users WHERE id = ?');
      expect(query.getBindings()).toEqual([1]);
    });
  });
});
