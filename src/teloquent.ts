/**
 * Classe principale Teloquent - Point d'entrée de l'ORM
 */
import { ConnectionConfig, Transaction } from './types';
import { DB } from './core/DB';
import { Schema } from './schema/Schema';
import { Migration } from './migrations/Migration';

export class Teloquent {
  /**
   * Instance unique (singleton)
   */
  private static instance: Teloquent;

  /**
   * Base de données
   */
  private db: DB;

  /**
   * Gestionnaire de schéma
   */
  private schemaInstance: Schema;

  /**
   * Gestionnaire de migrations
   */
  private migrationInstance: Migration;

  /**
   * Configuration
   */
  private config: ConnectionConfig;

  /**
   * Constructeur privé (singleton)
   */
  private constructor(config: ConnectionConfig) {
    this.config = config;
    this.db = new DB(config);
    this.schemaInstance = new Schema(this.db);
    this.migrationInstance = new Migration(this.db, this.schemaInstance);
  }

  /**
   * Obtenir l'instance unique ou en créer une nouvelle
   */
  public static getInstance(config?: ConnectionConfig): Teloquent {
    if (!Teloquent.instance && config) {
      Teloquent.instance = new Teloquent(config);
    }
    
    if (!Teloquent.instance) {
      throw new Error('Teloquent n\'a pas été initialisé. Appelez Teloquent.init() d\'abord.');
    }
    
    return Teloquent.instance;
  }

  /**
   * Initialiser Teloquent avec une configuration
   */
  public static init(config: ConnectionConfig): Teloquent {
    Teloquent.instance = new Teloquent(config);
    return Teloquent.instance;
  }

  /**
   * Obtenir l'instance de base de données
   */
  public getDB(): DB {
    return this.db;
  }

  /**
   * Obtenir l'instance de schéma
   */
  public schema(): Schema {
    return this.schemaInstance;
  }

  /**
   * Obtenir l'instance de migration
   */
  public migration(): Migration {
    return this.migrationInstance;
  }

  /**
   * Démarrer une transaction
   */
  public async transaction<T>(callback: (trx: Transaction) => Promise<T>): Promise<T> {
    return this.db.transaction(callback);
  }

  /**
   * Activer ou désactiver les logs SQL
   */
  public enableLogging(enable: boolean = true): void {
    this.db.enableLogging(enable);
  }

  /**
   * Fermer la connexion à la base de données
   */
  public async close(): Promise<void> {
    await this.db.close();
  }
}
