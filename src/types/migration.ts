import { Schema } from '../schema/Schema';

/**
 * Interface pour les options de migration
 */
export interface MigrationOptions {
  /**
   * Nom de la migration
   */
  name: string;
  
  /**
   * Fonction exécutée lors de la migration vers l'avant
   * @param schema Instance du schéma pour créer/modifier des tables
   */
  up: (schema: Schema) => Promise<void>;
  
  /**
   * Fonction exécutée lors de l'annulation de la migration
   * @param schema Instance du schéma pour modifier/supprimer des tables
   */
  down: (schema: Schema) => Promise<void>;
}

/**
 * Interface pour une migration enregistrée dans la base de données
 */
export interface MigrationRecord {
  /**
   * ID unique de la migration
   */
  id: number;
  
  /**
   * Nom de la migration
   */
  name: string;
  
  /**
   * Numéro de lot de la migration
   */
  batch: number;
  
  /**
   * Date d'exécution de la migration
   */
  executed_at: string;
}

/**
 * Options pour les opérations de migration
 */
export interface MigrationRunOptions {
  /**
   * Nombre de migrations à annuler lors d'un rollback
   * Par défaut: 1 lot
   */
  steps?: number;
  
  /**
   * Exécuter en mode silencieux (sans logs)
   */
  silent?: boolean;
}

/**
 * Résultat d'une opération de migration
 */
export interface MigrationResult {
  /**
   * Migrations exécutées
   */
  migrated: string[];
  
  /**
   * Nombre total de migrations exécutées
   */
  count: number;
  
  /**
   * Numéro du lot
   */
  batch?: number;
}

/**
 * État des migrations
 */
export interface MigrationStatus {
  /**
   * Migrations en attente
   */
  pending: string[];
  
  /**
   * Migrations exécutées
   */
  migrated: MigrationRecord[];
  
  /**
   * Dernier numéro de lot
   */
  lastBatch: number;
}
