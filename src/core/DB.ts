/**
 * Classe DB pour gérer les connexions à la base de données et exécuter des requêtes SQL
 */
import { ConnectionConfig, QueryResult } from '../types';

export class DB {
  private static _config: ConnectionConfig | null = null;
  private static _database: any = null;

  /**
   * Initialiser la connexion à la base de données
   */
  public static initialize(config: ConnectionConfig): void {
    DB._config = config;
    DB._database = config.database;
  }

  /**
   * Réinitialiser la connexion à la base de données
   */
  public static reset(): void {
    DB._config = null;
    DB._database = null;
  }

  /**
   * Vérifier si la connexion est initialisée
   */
  public static isInitialized(): boolean {
    return DB._database !== null;
  }

  /**
   * Obtenir l'instance de base de données
   */
  public static getDatabase(): any {
    if (!DB._database) {
      throw new Error('La base de données n\'est pas initialisée. Appelez Teloquent.initialize() d\'abord.');
    }
    return DB._database;
  }

  /**
   * Exécuter une requête SQL
   */
  public static async query(sql: string, params: any[] = []): Promise<QueryResult> {
    if (!DB.isInitialized()) {
      throw new Error('La base de données n\'est pas initialisée. Appelez Teloquent.initialize() d\'abord.');
    }

    if (DB._config?.enableLogging) {
      console.log(`SQL: ${sql}`, params);
    }

    try {
      if (DB._config?.driver === 'expo') {
        // Supporte à la fois l'API legacy (transaction/executeSql) et la nouvelle API (runAsync/getAllAsync)
        const db = DB._database;
        const hasLegacyTx = db && typeof db.transaction === 'function';
        const hasNewApi = db && (typeof db.runAsync === 'function' || typeof db.getAllAsync === 'function');

        if (hasLegacyTx) {
          // API legacy d'expo-sqlite
          return new Promise((resolve, reject) => {
            db.transaction(
              (tx: any) => {
                tx.executeSql(
                  sql,
                  params,
                  (_: any, result: any) => resolve(result),
                  (_: any, error: any) => {
                    reject(error);
                    return false;
                  }
                );
              },
              (error: any) => reject(error)
            );
          });
        }

        if (hasNewApi) {
          // Nouvelle API d'expo-sqlite (SDK récents)
          const isSelect = /^\s*select/i.test(sql);
          if (isSelect) {
            // getAllAsync retourne un tableau de lignes (objets)
            const rowsArray = await db.getAllAsync(sql, params);
            const result: QueryResult = {
              rowsAffected: 0,
              rows: {
                length: rowsArray.length,
                item: (index: number) => rowsArray[index],
                _array: rowsArray,
                raw: undefined as any
              }
            };
            return result;
          } else {
            // runAsync pour INSERT/UPDATE/DELETE/DDL
            const runRes = await db.runAsync(sql, params);
            const insertId = (runRes && typeof runRes.lastInsertRowid !== 'undefined')
              ? Number(runRes.lastInsertRowid)
              : 0;
            const rowsAffected = (runRes && typeof runRes.changes !== 'undefined')
              ? Number(runRes.changes)
              : 0;
            const result: QueryResult = {
              insertId,
              rowsAffected,
              rows: {
                length: 0,
                item: (_: number) => null,
                _array: [],
                raw: undefined as any
              }
            } as any;
            return result;
          }
        }

        throw new Error('API expo-sqlite non supportée: ni transaction/executeSql ni runAsync/getAllAsync disponibles.');
      } else if (DB._config?.driver === 'react-native') {
        // Pour react-native-sqlite-storage
        const db = DB._database;
        return db.executeSql(sql, params);
      } else {
        throw new Error(`Driver de base de données non supporté: ${DB._config?.driver}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'exécution de la requête SQL:', error);
      throw error;
    }
  }

  /**
   * Exécuter une requête SELECT
   */
  public static async select(sql: string, params: any[] = []): Promise<any[]> {
    const result = await DB.query(sql, params);
    
    // Normaliser les résultats entre les différents drivers
    if (DB._config?.driver === 'expo') {
      return result.rows._array || [];
    } else if (DB._config?.driver === 'react-native') {
      const r = result as any; // react-native-sqlite-storage retourne [result]
      const rows: any[] = [];
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
  public static async insert(table: string, data: Record<string, any>): Promise<number> {
    const columns = Object.keys(data);
    const placeholders = columns.map(() => '?').join(', ');
    const values = Object.values(data);
    
    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
    const result = await DB.query(sql, values);
    
    // Retourner l'ID inséré
    if (DB._config?.driver === 'expo') {
      return result.insertId || 0;
    } else if (DB._config?.driver === 'react-native') {
      const r = result as any;
      return r[0].insertId || 0;
    }
    
    return 0;
  }

  /**
   * Exécuter une requête UPDATE
   */
  public static async update(table: string, data: Record<string, any>, whereClause: string, whereParams: any[] = []): Promise<number> {
    const setClause = Object.keys(data)
      .map(column => `${column} = ?`)
      .join(', ');
    const values = [...Object.values(data), ...whereParams];
    
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    const result = await DB.query(sql, values);
    
    // Retourner le nombre de lignes affectées
    if (DB._config?.driver === 'expo') {
      return result.rowsAffected || 0;
    } else if (DB._config?.driver === 'react-native') {
      const r = result as any;
      return r[0].rowsAffected || 0;
    }
    
    return 0;
  }

  /**
   * Exécuter une requête DELETE
   */
  public static async delete(table: string, whereClause: string, whereParams: any[] = []): Promise<number> {
    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
    const result = await DB.query(sql, whereParams);
    
    // Retourner le nombre de lignes affectées
    if (DB._config?.driver === 'expo') {
      return result.rowsAffected || 0;
    } else if (DB._config?.driver === 'react-native') {
      const r = result as any;
      return r[0].rowsAffected || 0;
    }
    
    return 0;
  }

  /**
   * Démarrer une transaction
   */
  public static async beginTransaction(): Promise<any> {
    if (!DB.isInitialized()) {
      throw new Error('La base de données n\'est pas initialisée. Appelez Teloquent.initialize() d\'abord.');
    }

    if (DB._config?.driver === 'expo') {
      const db = DB._database;
      const hasLegacyTx = db && typeof db.transaction === 'function';
      const hasNewApi = db && typeof db.withTransactionAsync === 'function';

      if (hasLegacyTx) {
        // Legacy
        return new Promise((resolve, reject) => {
          db.transaction(
            (tx: any) => resolve(tx),
            (error: any) => reject(error)
          );
        });
      }

      if (hasNewApi) {
        // Nouvelle API: on expose un objet minimaliste qui offre execute/commit/rollback
        // en s'appuyant sur withTransactionAsync
        return {
          execute: async (callback: () => Promise<any>) => {
            return await db.withTransactionAsync(async () => {
              return await callback();
            });
          },
          commit: async () => { /* géré implicitement par withTransactionAsync */ },
          rollback: async () => { throw new Error('Rollback manuel non supporté avec withTransactionAsync.'); }
        };
      }

      throw new Error('API expo-sqlite non supportée pour les transactions.');
    } else if (DB._config?.driver === 'react-native') {
      // Pour react-native-sqlite-storage
      return DB._database.transaction();
    } else {
      throw new Error(`Driver de base de données non supporté: ${DB._config?.driver}`);
    }
  }
}
