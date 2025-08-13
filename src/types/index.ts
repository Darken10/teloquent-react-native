/**
 * Types principaux pour Teloquent
 */

// Types de base de données supportés
export type DatabaseDriver = 'expo' | 'react-native';

// Configuration de la connexion
export interface ConnectionConfig {
  driver: DatabaseDriver;
  database: any; // SQLite.WebSQLDatabase pour expo ou SQLiteDatabase pour react-native-sqlite-storage
  enableLogging?: boolean;
}

// Types pour les requêtes
export type WhereOperator = '=' | '!=' | '<' | '<=' | '>' | '>=' | 'LIKE' | 'NOT LIKE' | 'IN' | 'NOT IN' | 'NULL' | 'NOT NULL' | 'BETWEEN' | 'NOT BETWEEN';
export type OrderDirection = 'asc' | 'desc';

export interface WhereCondition {
  column: string;
  operator: WhereOperator;
  value: any;
  boolean: 'and' | 'or';
}

export interface OrderByClause {
  column: string;
  direction: OrderDirection;
}

// Types pour les attributs de modèle
export interface ModelAttributes {
  [key: string]: any;
}

export interface ModelOptions {
  table?: string;
  primaryKey?: string;
  timestamps?: boolean;
  dateFormat?: string;
  connection?: string;
}

// Types pour les relations
export type RelationType = 'hasOne' | 'hasMany' | 'belongsTo' | 'belongsToMany';

// Types pour les migrations et schémas
export type ColumnType = 
  | 'integer' 
  | 'bigInteger' 
  | 'string' 
  | 'text' 
  | 'boolean' 
  | 'date' 
  | 'datetime' 
  | 'float' 
  | 'decimal' 
  | 'json';

export interface ColumnDefinition {
  name: string;
  type: ColumnType;
  length?: number;
  precision?: number;
  scale?: number;
  nullable?: boolean;
  defaultValue?: any;
  primaryKey?: boolean;
  unique?: boolean;
  index?: boolean;
  references?: {
    table: string;
    column: string;
  };
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
}

// Types pour les résultats de requêtes
export interface QueryResult {
  insertId?: number;
  rowsAffected: number;
  rows: {
    length: number;
    item: (index: number) => any;
    _array?: any[];
    raw?: () => any[];
  };
}

// Types pour les hooks et événements
export type ModelEvent = 'creating' | 'created' | 'updating' | 'updated' | 'saving' | 'saved' | 'deleting' | 'deleted';

// Types pour les transactions
export interface Transaction {
  execute<T>(callback: () => Promise<T>): Promise<T>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

// Types pour les migrations
export interface MigrationOptions {
  name: string;
  up: (schema: any) => Promise<void>;
  down: (schema: any) => Promise<void>;
}
