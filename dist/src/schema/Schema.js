"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = void 0;
/**
 * Classe Schema pour gérer les opérations de schéma de base de données
 */
const DB_1 = require("../core/DB");
const Blueprint_1 = require("./Blueprint");
class Schema {
    /**
     * Créer une nouvelle table
     */
    static async createTable(tableName, callback) {
        const blueprint = new Blueprint_1.Blueprint(tableName);
        callback(blueprint);
        const statements = blueprint.toSql();
        try {
            // Exécuter les instructions SQL
            for (const statement of statements) {
                await DB_1.DB.query(statement.sql, statement.params);
            }
        }
        catch (error) {
            console.error(`Erreur lors de la création de la table ${tableName}:`, error);
            throw error;
        }
    }
    /**
     * Modifier une table existante
     */
    static async table(tableName, callback) {
        const blueprint = new Blueprint_1.Blueprint(tableName, true);
        callback(blueprint);
        const statements = blueprint.toSql();
        try {
            // Exécuter les instructions SQL
            for (const statement of statements) {
                await DB_1.DB.query(statement.sql, statement.params);
            }
        }
        catch (error) {
            console.error(`Erreur lors de la modification de la table ${tableName}:`, error);
            throw error;
        }
    }
    /**
     * Supprimer une table
     */
    static async dropTable(tableName) {
        try {
            await DB_1.DB.query(`DROP TABLE IF EXISTS ${tableName}`);
        }
        catch (error) {
            console.error(`Erreur lors de la suppression de la table ${tableName}:`, error);
            throw error;
        }
    }
    /**
     * Renommer une table
     */
    static async renameTable(from, to) {
        try {
            await DB_1.DB.query(`ALTER TABLE ${from} RENAME TO ${to}`);
        }
        catch (error) {
            console.error(`Erreur lors du renommage de la table ${from} en ${to}:`, error);
            throw error;
        }
    }
    /**
     * Vérifier si une table existe
     */
    static async hasTable(tableName) {
        try {
            const result = await DB_1.DB.select("SELECT name FROM sqlite_master WHERE type='table' AND name=?", [tableName]);
            return result.length > 0;
        }
        catch (error) {
            console.error(`Erreur lors de la vérification de l'existence de la table ${tableName}:`, error);
            throw error;
        }
    }
    /**
     * Vérifier si une colonne existe dans une table
     */
    static async hasColumn(tableName, columnName) {
        try {
            const result = await DB_1.DB.select(`PRAGMA table_info(${tableName})`);
            return result.some(column => column.name === columnName);
        }
        catch (error) {
            console.error(`Erreur lors de la vérification de l'existence de la colonne ${columnName} dans la table ${tableName}:`, error);
            throw error;
        }
    }
    /**
     * Obtenir les informations sur les colonnes d'une table
     */
    static async getColumnListing(tableName) {
        try {
            const result = await DB_1.DB.select(`PRAGMA table_info(${tableName})`);
            return result.map(column => column.name);
        }
        catch (error) {
            console.error(`Erreur lors de la récupération des colonnes de la table ${tableName}:`, error);
            throw error;
        }
    }
}
exports.Schema = Schema;
