/**
 * Classe principale Teloquent - Point d'entrée de l'ORM
 */
import { ConnectionConfig } from './types';
import { DB } from './core/DB';
import { Schema } from './schema/Schema';
import { Migration } from './schema/Migration';

export class Teloquent {
  /**
   * Instance unique (singleton)
   */
  private static instance: Teloquent;

  // Plus d'instances directes: DB/Schema/Migration sont utilisés en statique

  /**
   * Configuration
   */
  private config: ConnectionConfig;

  /**
   * Constructeur privé (singleton)
   */
  private constructor(config: ConnectionConfig) {
    this.config = config;
    DB.initialize(config);
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
   * Accès à la classe DB (statique)
   */
  public getDB(): typeof DB {
    return DB;
  }

  /**
   * Accès au gestionnaire de schéma (statique)
   */
  public schema(): typeof Schema {
    return Schema;
  }

  /**
   * Accès au gestionnaire de migrations (statique)
   */
  public migration(): typeof Migration {
    return Migration;
  }

  // Les transactions, logs et fermeture de connexion ne sont pas exposés ici.
}
