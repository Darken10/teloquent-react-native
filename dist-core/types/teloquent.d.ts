/**
 * Types pour la classe principale Teloquent
 */
import { SchemaFunctions } from './schema';
/**
 * Options de configuration pour Teloquent
 */
export interface TeloquentConfig {
    /**
     * Driver de base de données ('expo' ou 'react-native')
     */
    driver: 'expo' | 'react-native';
    /**
     * Instance de la base de données
     */
    database: any;
    /**
     * Mode debug (affiche les requêtes SQL)
     */
    debug?: boolean;
    /**
     * Préfixe de table
     */
    tablePrefix?: string;
    /**
     * Fonction de journalisation personnalisée
     */
    logger?: (message: string) => void;
}
/**
 * Interface pour les transactions de base de données
 */
export interface Transaction {
    /**
     * Exécute une fonction dans une transaction
     * @param callback Fonction à exécuter dans la transaction
     */
    execute<T>(callback: () => Promise<T>): Promise<T>;
    /**
     * Valide la transaction
     */
    commit(): Promise<void>;
    /**
     * Annule la transaction
     */
    rollback(): Promise<void>;
}
/**
 * Interface pour la classe Teloquent
 */
export interface TeloquentInterface {
    /**
     * Initialise Teloquent avec la configuration spécifiée
     * @param config Configuration de Teloquent
     */
    initialize(config: TeloquentConfig): void;
    /**
     * Obtient l'instance de la base de données
     */
    getDatabase(): any;
    /**
     * Obtient le driver de base de données
     */
    getDriver(): string;
    /**
     * Vérifie si le mode debug est activé
     */
    isDebug(): boolean;
    /**
     * Obtient le préfixe de table
     */
    getTablePrefix(): string;
    /**
     * Exécute une requête SQL brute
     * @param query Requête SQL
     * @param bindings Paramètres de la requête
     */
    raw(query: string, bindings?: any[]): Promise<any>;
    /**
     * Démarre une nouvelle transaction
     */
    beginTransaction(): Promise<Transaction>;
    /**
     * Exécute une fonction dans une transaction
     * @param callback Fonction à exécuter dans la transaction
     */
    transaction<T>(callback: (trx: Transaction) => Promise<T>): Promise<T>;
    /**
     * Fonctions de schéma
     */
    schema: SchemaFunctions;
    /**
     * Journalise un message
     * @param message Message à journaliser
     */
    log(message: string): void;
}
