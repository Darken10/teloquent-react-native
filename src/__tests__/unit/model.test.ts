/**
 * Tests unitaires pour la classe Model
 */
import { Model } from '../../model';
import { Teloquent } from '../../teloquent';

// Mock de la connexion à la base de données
const mockDb = {
  transaction: jest.fn((callback) => {
    callback({
      executeSql: jest.fn((query, params, success) => {
        if (query.toLowerCase().includes('select')) {
          success({}, { 
            rows: { 
              _array: [{ id: 1, name: 'Test', email: 'test@example.com' }],
              length: 1,
              item: (idx: number) => ({ id: 1, name: 'Test', email: 'test@example.com' })
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

// Initialiser Teloquent avec le mock
beforeAll(() => {
  Teloquent.initialize({
    driver: 'expo',
    database: mockDb as any,
    debug: false
  });
});

// Définition d'un modèle de test
class TestUser extends Model {
  declare id: number;
  declare name: string;
  declare email: string;
  
  // Personnaliser le nom de la table
  protected static table = 'users';
  
  // Attributs remplissables en masse
  protected fillable = ['name', 'email'];
  
  // Attributs cachés
  protected hidden = ['password'];
  
  // Accesseur personnalisé
  getFullNameAttribute(): string {
    return `${this.name} <${this.email}>`;
  }
  
  // Mutateur personnalisé
  setEmailAttribute(value: string): void {
    this.attributes.email = value.toLowerCase();
  }
}

describe('Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Constructeur et attributs', () => {
    test('devrait créer une instance avec des attributs', () => {
      const user = new TestUser({ name: 'Jean', email: 'JEAN@EXAMPLE.COM' });
      
      expect(user).toBeInstanceOf(TestUser);
      expect(user.name).toBe('Jean');
      expect(user.email).toBe('jean@example.com'); // Converti en minuscules par le mutateur
    });
    
    test('devrait définir les attributs via les setters', () => {
      const user = new TestUser();
      user.name = 'Marie';
      user.email = 'MARIE@EXAMPLE.COM';
      
      expect(user.name).toBe('Marie');
      expect(user.email).toBe('marie@example.com'); // Converti en minuscules par le mutateur
    });
  });
  
  describe('Méthodes statiques', () => {
    test('devrait retourner le nom de la table', () => {
      expect(TestUser.getTable()).toBe('users');
    });
    
    test('devrait créer une nouvelle instance via create()', async () => {
      const user = await TestUser.create({ name: 'Pierre', email: 'pierre@example.com' });
      
      expect(user).toBeInstanceOf(TestUser);
      expect(user.name).toBe('Pierre');
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait trouver un enregistrement par ID', async () => {
      const user = await TestUser.find(1);
      
      expect(user).toBeInstanceOf(TestUser);
      expect(user?.id).toBe(1);
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait récupérer tous les enregistrements', async () => {
      const users = await TestUser.all();
      
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
      expect(users[0]).toBeInstanceOf(TestUser);
      expect(mockDb.transaction).toHaveBeenCalled();
    });
  });
  
  describe('Méthodes d\'instance', () => {
    test('devrait sauvegarder un modèle', async () => {
      const user = new TestUser({ name: 'Sophie', email: 'sophie@example.com' });
      await user.save();
      
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait supprimer un modèle', async () => {
      const user = new TestUser({ id: 1, name: 'Test', email: 'test@example.com' });
      await user.delete();
      
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    
    test('devrait convertir en objet simple', () => {
      const user = new TestUser({ 
        id: 1, 
        name: 'Test', 
        email: 'test@example.com',
        password: 'secret'
      });
      
      const obj = user.toObject();
      
      expect(obj.id).toBe(1);
      expect(obj.name).toBe('Test');
      expect(obj.email).toBe('test@example.com');
      expect(obj.password).toBeUndefined(); // Caché
    });
    
    test('devrait convertir en JSON', () => {
      const user = new TestUser({ 
        id: 1, 
        name: 'Test', 
        email: 'test@example.com',
        password: 'secret'
      });
      
      const json = user.toJson();
      const parsed = JSON.parse(json);
      
      expect(parsed.id).toBe(1);
      expect(parsed.name).toBe('Test');
      expect(parsed.email).toBe('test@example.com');
      expect(parsed.password).toBeUndefined(); // Caché
    });
  });
  
  describe('Accesseurs et mutateurs', () => {
    test('devrait utiliser un accesseur personnalisé', () => {
      const user = new TestUser({ name: 'Test', email: 'test@example.com' });
      
      expect(user.fullName).toBe('Test <test@example.com>');
    });
    
    test('devrait utiliser un mutateur personnalisé', () => {
      const user = new TestUser();
      user.email = 'TEST@EXAMPLE.COM';
      
      expect(user.email).toBe('test@example.com');
    });
  });
  
  describe('Attributs sales et originaux', () => {
    test('devrait suivre les attributs modifiés', () => {
      const user = new TestUser({ id: 1, name: 'Original', email: 'original@example.com' });
      user.name = 'Modifié';
      
      expect(user.isDirty()).toBe(true);
      expect(user.isDirty('name')).toBe(true);
      expect(user.isDirty('email')).toBe(false);
      expect(user.getOriginal('name')).toBe('Original');
    });
    
    test('devrait réinitialiser les attributs sales après sauvegarde', async () => {
      const user = new TestUser({ id: 1, name: 'Original', email: 'original@example.com' });
      user.name = 'Modifié';
      
      expect(user.isDirty()).toBe(true);
      
      await user.save();
      
      expect(user.isDirty()).toBe(false);
    });
  });
});
