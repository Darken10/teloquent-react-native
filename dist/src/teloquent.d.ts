/**
 * Classe principale Teloquent - Point d'entrée de l'ORM
 */
import { ConnectionConfig } from './types';
import { DB } from './core/DB';
import { Schema } from './schema/Schema';
import { Migration } from './schema/Migration';
export declare class Teloquent {
    /**
     * Instance unique (singleton)
     */
    private static instance;
    /**
     * Configuration
     */
    private config;
    /**
     * Constructeur privé (singleton)
     */
    private constructor();
    /**
     * Obtenir l'instance unique ou en créer une nouvelle
     */
    static getInstance(config?: ConnectionConfig): Teloquent;
    /**
     * Initialiser Teloquent avec une configuration
     */
    static init(config: ConnectionConfig): Teloquent;
    /**
     * Accès à la classe DB (statique)
     */
    getDB(): typeof DB;
    /**
     * Accès au gestionnaire de schéma (statique)
     */
    schema(): typeof Schema;
    /**
     * Accès au gestionnaire de migrations (statique)
     */
    migration(): typeof Migration;
}
