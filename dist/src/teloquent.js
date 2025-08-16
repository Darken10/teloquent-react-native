"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Teloquent = void 0;
const DB_1 = require("./core/DB");
const Schema_1 = require("./schema/Schema");
const Migration_1 = require("./schema/Migration");
class Teloquent {
    /**
     * Constructeur privé (singleton)
     */
    constructor(config) {
        this.config = config;
        DB_1.DB.initialize(config);
    }
    /**
     * Obtenir l'instance unique ou en créer une nouvelle
     */
    static getInstance(config) {
        if (!Teloquent.instance && config) {
            Teloquent.instance = new Teloquent(config);
        }
        if (!Teloquent.instance) {
            throw new Error('Teloquent n\'a pas été initialisé. Appelez Teloquent.init() d\'abord.');
        }
        return Teloquent.instance;
    }
    /**
     * Initialiser Teloquent avec une configuration
     */
    static init(config) {
        Teloquent.instance = new Teloquent(config);
        return Teloquent.instance;
    }
    /**
     * Accès à la classe DB (statique)
     */
    getDB() {
        return DB_1.DB;
    }
    /**
     * Accès au gestionnaire de schéma (statique)
     */
    schema() {
        return Schema_1.Schema;
    }
    /**
     * Accès au gestionnaire de migrations (statique)
     */
    migration() {
        return Migration_1.Migration;
    }
}
exports.Teloquent = Teloquent;
