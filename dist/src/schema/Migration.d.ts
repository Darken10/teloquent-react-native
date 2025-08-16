import { MigrationOptions } from '../types';
export declare class Migration {
    protected static migrationsTable: string;
    protected static migrations: MigrationOptions[];
    /**
     * Initialiser la table des migrations
     */
    static initialize(): Promise<void>;
    /**
     * Enregistrer une migration
     */
    static register(migration: MigrationOptions): void;
    /**
     * Exécuter les migrations
     */
    static migrate(): Promise<void>;
    /**
     * Annuler les migrations
     */
    static rollback(steps?: number): Promise<void>;
    /**
     * Réinitialiser toutes les migrations
     */
    static reset(): Promise<void>;
    /**
     * Rafraîchir les migrations (reset + migrate)
     */
    static refresh(): Promise<void>;
    /**
     * Obtenir les migrations exécutées
     */
    protected static getExecutedMigrations(): Promise<Array<{
        id: number;
        name: string;
        batch: number;
    }>>;
    /**
     * Enregistrer une migration comme exécutée
     */
    protected static logMigration(name: string, batch: number): Promise<void>;
    /**
     * Supprimer une migration de la table
     */
    protected static removeMigration(name: string): Promise<void>;
}
