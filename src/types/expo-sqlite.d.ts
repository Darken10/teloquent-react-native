/**
 * Déclaration de types pour expo-sqlite
 */
declare module 'expo-sqlite' {
  export interface SQLiteCallback {
    (transaction: SQLiteTransaction): void;
  }

  export interface SQLiteResultCallback {
    (transaction: SQLiteTransaction, resultSet: SQLResultSet): void;
  }

  export interface SQLiteErrorCallback {
    (error: any): void;
  }

  export interface SQLiteTransaction {
    executeSql: (
      sqlStatement: string,
      args?: any[],
      success?: SQLiteResultCallback,
      error?: SQLiteErrorCallback
    ) => void;
  }

  export interface SQLResultSet {
    insertId?: number;
    rowsAffected: number;
    rows: {
      length: number;
      item: (idx: number) => any;
      _array: any[];
    };
  }

  export interface Database {
    transaction: (
      callback: SQLiteCallback,
      error?: SQLiteErrorCallback,
      success?: () => void
    ) => void;
    readTransaction: (
      callback: SQLiteCallback,
      error?: SQLiteErrorCallback,
      success?: () => void
    ) => void;
    exec: (queries: { sql: string; args?: any[] }[], readOnly: boolean, callback: (error?: Error, resultSet?: SQLResultSet[]) => void) => void;
  }

  export function openDatabase(
    name: string,
    version?: string,
    description?: string,
    size?: number,
    callback?: (db: Database) => void
  ): Database;
}
