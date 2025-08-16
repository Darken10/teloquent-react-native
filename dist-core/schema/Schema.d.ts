import { Blueprint } from './Blueprint';
export declare class Schema {
    /**
     * Créer une nouvelle table
     */
    static createTable(tableName: string, callback: (table: Blueprint) => void): Promise<void>;
    /**
     * Modifier une table existante
     */
    static table(tableName: string, callback: (table: Blueprint) => void): Promise<void>;
    /**
     * Supprimer une table
     */
    static dropTable(tableName: string): Promise<void>;
    /**
     * Renommer une table
     */
    static renameTable(from: string, to: string): Promise<void>;
    /**
     * Vérifier si une table existe
     */
    static hasTable(tableName: string): Promise<boolean>;
    /**
     * Vérifier si une colonne existe dans une table
     */
    static hasColumn(tableName: string, columnName: string): Promise<boolean>;
    /**
     * Obtenir les informations sur les colonnes d'une table
     */
    static getColumnListing(tableName: string): Promise<string[]>;
}
