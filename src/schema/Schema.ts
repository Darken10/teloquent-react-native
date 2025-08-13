/**
 * Classe Schema pour gérer les opérations de schéma de base de données
 */
import { DB } from '../core/DB';
import { Blueprint } from './Blueprint';

export class Schema {
  /**
   * Créer une nouvelle table
   */
  public static async createTable(tableName: string, callback: (table: Blueprint) => void): Promise<void> {
    const blueprint = new Blueprint(tableName);
    callback(blueprint);
    
    const statements = blueprint.toSql();
    
    try {
      // Exécuter les instructions SQL
      for (const statement of statements) {
        await DB.query(statement.sql, statement.params);
      }
    } catch (error) {
      console.error(`Erreur lors de la création de la table ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Modifier une table existante
   */
  public static async table(tableName: string, callback: (table: Blueprint) => void): Promise<void> {
    const blueprint = new Blueprint(tableName, true);
    callback(blueprint);
    
    const statements = blueprint.toSql();
    
    try {
      // Exécuter les instructions SQL
      for (const statement of statements) {
        await DB.query(statement.sql, statement.params);
      }
    } catch (error) {
      console.error(`Erreur lors de la modification de la table ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Supprimer une table
   */
  public static async dropTable(tableName: string): Promise<void> {
    try {
      await DB.query(`DROP TABLE IF EXISTS ${tableName}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de la table ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Renommer une table
   */
  public static async renameTable(from: string, to: string): Promise<void> {
    try {
      await DB.query(`ALTER TABLE ${from} RENAME TO ${to}`);
    } catch (error) {
      console.error(`Erreur lors du renommage de la table ${from} en ${to}:`, error);
      throw error;
    }
  }

  /**
   * Vérifier si une table existe
   */
  public static async hasTable(tableName: string): Promise<boolean> {
    try {
      const result = await DB.select(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        [tableName]
      );
      
      return result.length > 0;
    } catch (error) {
      console.error(`Erreur lors de la vérification de l'existence de la table ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Vérifier si une colonne existe dans une table
   */
  public static async hasColumn(tableName: string, columnName: string): Promise<boolean> {
    try {
      const result = await DB.select(
        `PRAGMA table_info(${tableName})`
      );
      
      return result.some(column => column.name === columnName);
    } catch (error) {
      console.error(`Erreur lors de la vérification de l'existence de la colonne ${columnName} dans la table ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Obtenir les informations sur les colonnes d'une table
   */
  public static async getColumnListing(tableName: string): Promise<string[]> {
    try {
      const result = await DB.select(
        `PRAGMA table_info(${tableName})`
      );
      
      return result.map(column => column.name);
    } catch (error) {
      console.error(`Erreur lors de la récupération des colonnes de la table ${tableName}:`, error);
      throw error;
    }
  }
}
