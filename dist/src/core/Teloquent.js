"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Teloquent = void 0;
const DB_1 = require("./DB");
class Teloquent {
    constructor() {
        this._config = null;
        this._initialized = false;
        // Constructeur privé pour le singleton
    }
    /**
     * Obtenir l'instance unique de Teloquent
     */
    static getInstance() {
        if (!Teloquent._instance) {
            Teloquent._instance = new Teloquent();
        }
        return Teloquent._instance;
    }
    /**
     * Initialiser Teloquent avec la configuration de connexion
     */
    static initialize(config) {
        const instance = Teloquent.getInstance();
        if (instance._initialized) {
            console.warn('Teloquent est déjà initialisé. Pour changer la configuration, utilisez reset() d\'abord.');
            return;
        }
        instance._config = config;
        instance._initialized = true;
        // Initialiser la connexion à la base de données
        DB_1.DB.initialize(config);
    }
    /**
     * Réinitialiser la configuration de Teloquent
     */
    static reset() {
        const instance = Teloquent.getInstance();
        instance._config = null;
        instance._initialized = false;
        DB_1.DB.reset();
    }
    /**
     * Vérifier si Teloquent est initialisé
     */
    static isInitialized() {
        return Teloquent.getInstance()._initialized;
    }
    /**
     * Obtenir la configuration actuelle
     */
    static getConfig() {
        return Teloquent.getInstance()._config;
    }
    /**
     * Activer ou désactiver la journalisation des requêtes SQL
     */
    static enableLogging(enable = true) {
        const instance = Teloquent.getInstance();
        if (instance._config) {
            instance._config.enableLogging = enable;
        }
    }
}
exports.Teloquent = Teloquent;
