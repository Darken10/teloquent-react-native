/**
 * Classe principale pour initialiser et configurer Teloquent
 */
import { ConnectionConfig } from '../types';
import { DB } from './DB';

export class Teloquent {
  private static _instance: Teloquent;
  private _config: ConnectionConfig | null = null;
  private _initialized = false;

  private constructor() {
    // Constructeur privé pour le singleton
  }

  /**
   * Obtenir l'instance unique de Teloquent
   */
  public static getInstance(): Teloquent {
    if (!Teloquent._instance) {
      Teloquent._instance = new Teloquent();
    }
    return Teloquent._instance;
  }

  /**
   * Initialiser Teloquent avec la configuration de connexion
   */
  public static initialize(config: ConnectionConfig): void {
    const instance = Teloquent.getInstance();
    if (instance._initialized) {
      console.warn('Teloquent est déjà initialisé. Pour changer la configuration, utilisez reset() d\'abord.');
      return;
    }

    instance._config = config;
    instance._initialized = true;

    // Initialiser la connexion à la base de données
    DB.initialize(config);
  }

  /**
   * Réinitialiser la configuration de Teloquent
   */
  public static reset(): void {
    const instance = Teloquent.getInstance();
    instance._config = null;
    instance._initialized = false;
    DB.reset();
  }

  /**
   * Vérifier si Teloquent est initialisé
   */
  public static isInitialized(): boolean {
    return Teloquent.getInstance()._initialized;
  }

  /**
   * Obtenir la configuration actuelle
   */
  public static getConfig(): ConnectionConfig | null {
    return Teloquent.getInstance()._config;
  }

  /**
   * Activer ou désactiver la journalisation des requêtes SQL
   */
  public static enableLogging(enable: boolean = true): void {
    const instance = Teloquent.getInstance();
    if (instance._config) {
      instance._config.enableLogging = enable;
    }
  }
}
