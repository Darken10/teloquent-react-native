"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB = void 0;
class DB {
    /**
     * Initialiser la connexion à la base de données
     */
    static initialize(config) {
        DB._config = config;
        DB._database = config.database;
    }
    /**
     * Réinitialiser la connexion à la base de données
     */
    static reset() {
        DB._config = null;
        DB._database = null;
    }
    /**
     * Vérifier si la connexion est initialisée
     */
    static isInitialized() {
        return DB._database !== null;
    }
    /**
     * Obtenir l'instance de base de données
     */
    static getDatabase() {
        if (!DB._database) {
            throw new Error('La base de données n\'est pas initialisée. Appelez Teloquent.initialize() d\'abord.');
        }
        return DB._database;
    }
    /**
     * Exécuter une requête SQL
     */
    static async query(sql, params = []) {
        if (!DB.isInitialized()) {
            throw new Error('La base de données n\'est pas initialisée. Appelez Teloquent.initialize() d\'abord.');
        }
        if (DB._config?.enableLogging) {
            console.log(`SQL: ${sql}`, params);
        }
        try {
            if (DB._config?.driver === 'expo') {
                // Pour expo-sqlite
                return new Promise((resolve, reject) => {
                    DB._database.transaction((tx) => {
                        tx.executeSql(sql, params, (_, result) => {
                            resolve(result);
                        }, (_, error) => {
                            reject(error);
                            return false;
                        });
                    }, (error) => reject(error));
                });
            }
            else if (DB._config?.driver === 'react-native') {
                // Pour react-native-sqlite-storage
                const db = DB._database;
                return db.executeSql(sql, params);
            }
            else {
                throw new Error(`Driver de base de données non supporté: ${DB._config?.driver}`);
            }
        }
        catch (error) {
            console.error('Erreur lors de l\'exécution de la requête SQL:', error);
            throw error;
        }
    }
    /**
     * Exécuter une requête SELECT
     */
    static async select(sql, params = []) {
        const result = await DB.query(sql, params);
        // Normaliser les résultats entre les différents drivers
        if (DB._config?.driver === 'expo') {
            return result.rows._array || [];
        }
        else if (DB._config?.driver === 'react-native') {
            const r = result; // react-native-sqlite-storage retourne [result]
            const rows = [];
            for (let i = 0; i < r[0].rows.length; i++) {
                rows.push(r[0].rows.item(i));
            }
            return rows;
        }
        return [];
    }
    /**
     * Exécuter une requête INSERT
     */
    static async insert(table, data) {
        const columns = Object.keys(data);
        const placeholders = columns.map(() => '?').join(', ');
        const values = Object.values(data);
        const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
        const result = await DB.query(sql, values);
        // Retourner l'ID inséré
        if (DB._config?.driver === 'expo') {
            return result.insertId || 0;
        }
        else if (DB._config?.driver === 'react-native') {
            const r = result;
            return r[0].insertId || 0;
        }
        return 0;
    }
    /**
     * Exécuter une requête UPDATE
     */
    static async update(table, data, whereClause, whereParams = []) {
        const setClause = Object.keys(data)
            .map(column => `${column} = ?`)
            .join(', ');
        const values = [...Object.values(data), ...whereParams];
        const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
        const result = await DB.query(sql, values);
        // Retourner le nombre de lignes affectées
        if (DB._config?.driver === 'expo') {
            return result.rowsAffected || 0;
        }
        else if (DB._config?.driver === 'react-native') {
            const r = result;
            return r[0].rowsAffected || 0;
        }
        return 0;
    }
    /**
     * Exécuter une requête DELETE
     */
    static async delete(table, whereClause, whereParams = []) {
        const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
        const result = await DB.query(sql, whereParams);
        // Retourner le nombre de lignes affectées
        if (DB._config?.driver === 'expo') {
            return result.rowsAffected || 0;
        }
        else if (DB._config?.driver === 'react-native') {
            const r = result;
            return r[0].rowsAffected || 0;
        }
        return 0;
    }
    /**
     * Démarrer une transaction
     */
    static async beginTransaction() {
        if (!DB.isInitialized()) {
            throw new Error('La base de données n\'est pas initialisée. Appelez Teloquent.initialize() d\'abord.');
        }
        if (DB._config?.driver === 'expo') {
            // Pour expo-sqlite, on retourne une promesse qui sera résolue avec une transaction
            return new Promise((resolve, reject) => {
                DB._database.transaction((tx) => resolve(tx), (error) => reject(error));
            });
        }
        else if (DB._config?.driver === 'react-native') {
            // Pour react-native-sqlite-storage
            return DB._database.transaction();
        }
        else {
            throw new Error(`Driver de base de données non supporté: ${DB._config?.driver}`);
        }
    }
}
exports.DB = DB;
DB._config = null;
DB._database = null;
