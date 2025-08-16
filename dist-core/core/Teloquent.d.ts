/**
 * Classe principale pour initialiser et configurer Teloquent
 */
import { ConnectionConfig } from '../types';
export declare class Teloquent {
    private static _instance;
    private _config;
    private _initialized;
    private constructor();
    /**
     * Obtenir l'instance unique de Teloquent
     */
    static getInstance(): Teloquent;
    /**
     * Initialiser Teloquent avec la configuration de connexion
     */
    static initialize(config: ConnectionConfig): void;
    /**
     * Réinitialiser la configuration de Teloquent
     */
    static reset(): void;
    /**
     * Vérifier si Teloquent est initialisé
     */
    static isInitialized(): boolean;
    /**
     * Obtenir la configuration actuelle
     */
    static getConfig(): ConnectionConfig | null;
    /**
     * Activer ou désactiver la journalisation des requêtes SQL
     */
    static enableLogging(enable?: boolean): void;
}
