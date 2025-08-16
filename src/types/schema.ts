/**
 * Types pour le système de schéma de base de données
 */
import { Blueprint } from '../schema/Blueprint';

/**
 * Interface pour les fonctions de schéma
 */
export interface SchemaFunctions {
  /**
   * Crée une nouvelle table dans la base de données
   * @param tableName Nom de la table à créer
   * @param callback Fonction de construction du blueprint
   */
  createTable(tableName: string, callback: (table: Blueprint) => void): Promise<void>;
  
  /**
   * Modifie une table existante
   * @param tableName Nom de la table à modifier
   * @param callback Fonction de construction du blueprint
   */
  table(tableName: string, callback: (table: Blueprint) => void): Promise<void>;
  
  /**
   * Supprime une table
   * @param tableName Nom de la table à supprimer
   */
  dropTable(tableName: string): Promise<void>;
  
  /**
   * Supprime une table si elle existe
   * @param tableName Nom de la table à supprimer
   */
  dropTableIfExists(tableName: string): Promise<void>;
  
  /**
   * Renomme une table
   * @param from Nom actuel de la table
   * @param to Nouveau nom de la table
   */
  renameTable(from: string, to: string): Promise<void>;
  
  /**
   * Vérifie si une table existe
   * @param tableName Nom de la table à vérifier
   */
  hasTable(tableName: string): Promise<boolean>;
  
  /**
   * Vérifie si une colonne existe dans une table
   * @param tableName Nom de la table
   * @param columnName Nom de la colonne à vérifier
   */
  hasColumn(tableName: string, columnName: string): Promise<boolean>;
}

/**
 * Interface pour les fonctions de colonne dans le blueprint
 */
export interface ColumnFunction {
  /**
   * Définit la colonne comme non nullable
   */
  notNullable(): this;
  
  /**
   * Définit la colonne comme nullable
   */
  nullable(): this;
  
  /**
   * Définit une valeur par défaut pour la colonne
   * @param value Valeur par défaut
   */
  defaultTo(value: any): this;
  
  /**
   * Définit la colonne comme unique
   */
  unique(): this;
  
  /**
   * Définit la colonne comme clé primaire
   */
  primary(): this;
  
  /**
   * Définit la colonne comme index
   */
  index(): this;
}

/**
 * Interface pour les fonctions de colonne numérique
 */
export interface NumericColumnFunction extends ColumnFunction {
  /**
   * Définit la colonne comme non signée (positive)
   */
  unsigned(): this;
}

/**
 * Interface pour les fonctions de clé étrangère
 */
export interface ForeignKeyFunction {
  /**
   * Spécifie la colonne référencée
   * @param column Nom de la colonne référencée
   */
  references(column: string): this;
  
  /**
   * Spécifie la table référencée
   * @param table Nom de la table référencée
   */
  on(table: string): this;
  
  /**
   * Spécifie l'action à effectuer lors de la suppression
   * @param action Action (CASCADE, SET NULL, etc.)
   */
  onDelete(action: string): this;
  
  /**
   * Spécifie l'action à effectuer lors de la mise à jour
   * @param action Action (CASCADE, SET NULL, etc.)
   */
  onUpdate(action: string): this;
}

/**
 * Interface pour les fonctions de blueprint
 */
export interface BlueprintFunctions {
  /**
   * Ajoute une colonne d'ID auto-incrémentée
   * @param columnName Nom de la colonne (par défaut: 'id')
   */
  increments(columnName?: string): NumericColumnFunction;
  
  /**
   * Ajoute une colonne de type texte
   * @param columnName Nom de la colonne
   * @param length Longueur maximale (optionnel)
   */
  string(columnName: string, length?: number): ColumnFunction;
  
  /**
   * Ajoute une colonne de type texte long
   * @param columnName Nom de la colonne
   */
  text(columnName: string): ColumnFunction;
  
  /**
   * Ajoute une colonne de type entier
   * @param columnName Nom de la colonne
   */
  integer(columnName: string): NumericColumnFunction;
  
  /**
   * Ajoute une colonne de type bigint
   * @param columnName Nom de la colonne
   */
  bigInteger(columnName: string): NumericColumnFunction;
  
  /**
   * Ajoute une colonne de type décimal
   * @param columnName Nom de la colonne
   * @param precision Précision totale
   * @param scale Nombre de décimales
   */
  decimal(columnName: string, precision?: number, scale?: number): NumericColumnFunction;
  
  /**
   * Ajoute une colonne de type booléen
   * @param columnName Nom de la colonne
   */
  boolean(columnName: string): ColumnFunction;
  
  /**
   * Ajoute une colonne de type date
   * @param columnName Nom de la colonne
   */
  date(columnName: string): ColumnFunction;
  
  /**
   * Ajoute une colonne de type datetime
   * @param columnName Nom de la colonne
   */
  datetime(columnName: string): ColumnFunction;
  
  /**
   * Ajoute une colonne de type timestamp
   * @param columnName Nom de la colonne
   */
  timestamp(columnName: string): ColumnFunction;
  
  /**
   * Ajoute des colonnes created_at et updated_at
   */
  timestamps(): void;
  
  /**
   * Ajoute une colonne deleted_at pour soft deletes
   */
  softDeletes(): ColumnFunction;
  
  /**
   * Crée une clé étrangère
   * @param columns Nom(s) de colonne(s)
   */
  foreign(columns: string | string[]): ForeignKeyFunction;
  
  /**
   * Crée un index
   * @param columns Nom(s) de colonne(s)
   * @param indexName Nom de l'index (optionnel)
   */
  index(columns: string | string[], indexName?: string): Blueprint;
  
  /**
   * Supprime une colonne
   * @param columnName Nom de la colonne à supprimer
   */
  dropColumn(columnName: string): Blueprint;
  
  /**
   * Renomme une colonne
   * @param from Nom actuel de la colonne
   * @param to Nouveau nom de la colonne
   */
  renameColumn(from: string, to: string): Blueprint;
  
  /**
   * Fonctions SQL disponibles (NOW, etc.)
   */
  fn: {
    /**
     * Fonction SQL NOW()
     */
    now(): any;
  };
}

/**
 * Extension de Teloquent avec les fonctions de schéma
 */
export interface TeloquentWithSchema {
  /**
   * Fonctions de schéma
   */
  schema: SchemaFunctions;
}
