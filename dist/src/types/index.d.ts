/**
 * Types principaux pour Teloquent
 */
export * from './model';
export * from './relations';
export * from './schema';
export * from './teloquent';
export * from './migration';
export type DatabaseDriver = 'expo' | 'react-native';
export interface ConnectionConfig {
    driver: DatabaseDriver;
    database: any;
    enableLogging?: boolean;
}
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
export type RelationType = 'hasOne' | 'hasMany' | 'belongsTo' | 'belongsToMany';
export type ColumnType = 'integer' | 'bigInteger' | 'string' | 'text' | 'boolean' | 'date' | 'datetime' | 'float' | 'decimal' | 'json';
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
export type ModelEvent = 'creating' | 'created' | 'updating' | 'updated' | 'saving' | 'saved' | 'deleting' | 'deleted';
export interface Transaction {
    execute<T>(callback: () => Promise<T>): Promise<T>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
}
