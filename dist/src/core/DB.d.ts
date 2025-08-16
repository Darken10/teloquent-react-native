/**
 * Classe DB pour gérer les connexions à la base de données et exécuter des requêtes SQL
 */
import { ConnectionConfig, QueryResult } from '../types';
export declare class DB {
    private static _config;
    private static _database;
    /**
     * Initialiser la connexion à la base de données
     */
    static initialize(config: ConnectionConfig): void;
    /**
     * Réinitialiser la connexion à la base de données
     */
    static reset(): void;
    /**
     * Vérifier si la connexion est initialisée
     */
    static isInitialized(): boolean;
    /**
     * Obtenir l'instance de base de données
     */
    static getDatabase(): any;
    /**
     * Exécuter une requête SQL
     */
    static query(sql: string, params?: any[]): Promise<QueryResult>;
    /**
     * Exécuter une requête SELECT
     */
    static select(sql: string, params?: any[]): Promise<any[]>;
    /**
     * Exécuter une requête INSERT
     */
    static insert(table: string, data: Record<string, any>): Promise<number>;
    /**
     * Exécuter une requête UPDATE
     */
    static update(table: string, data: Record<string, any>, whereClause: string, whereParams?: any[]): Promise<number>;
    /**
     * Exécuter une requête DELETE
     */
    static delete(table: string, whereClause: string, whereParams?: any[]): Promise<number>;
    /**
     * Démarrer une transaction
     */
    static beginTransaction(): Promise<any>;
}
