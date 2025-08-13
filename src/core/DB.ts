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
        // Pour expo-sqlite
        return new Promise((resolve, reject) => {
          DB._database.transaction(
            (tx: any) => {
              tx.executeSql(
                sql,
                params,
                (_: any, result: any) => {
                  resolve(result);
                },
                (_: any, error: any) => {
                  reject(error);
                  return false;
                }
              );
            },
            (error: any) => reject(error)
          );
        });
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
      const rows = [];
      for (let i = 0; i < result[0].rows.length; i++) {
        rows.push(result[0].rows.item(i));
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
      return result[0].insertId || 0;
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
      return result[0].rowsAffected || 0;
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
      return result[0].rowsAffected || 0;
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
      // Pour expo-sqlite, on retourne une promesse qui sera résolue avec une transaction
      return new Promise((resolve, reject) => {
        DB._database.transaction(
          (tx: any) => resolve(tx),
          (error: any) => reject(error)
        );
      });
    } else if (DB._config?.driver === 'react-native') {
      // Pour react-native-sqlite-storage
      return DB._database.transaction();
    } else {
      throw new Error(`Driver de base de données non supporté: ${DB._config?.driver}`);
    }
  }
}
