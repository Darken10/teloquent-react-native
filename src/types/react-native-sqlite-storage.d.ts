/**
 * Déclaration de types pour react-native-sqlite-storage
 */
declare module 'react-native-sqlite-storage' {
  export interface SQLiteDatabase {
    transaction(txCallback: (tx: SQLiteTransaction) => void): Promise<void>;
    readTransaction(txCallback: (tx: SQLiteTransaction) => void): Promise<void>;
    executeSql(statement: string, params?: any[]): Promise<[SQLiteResultSet]>;
    close(): Promise<void>;
    attach(nameToAttach: string, alias: string, location?: number, callback?: () => void, errorCallback?: (err: Error) => void): void;
    detach(alias: string, callback?: () => void, errorCallback?: (err: Error) => void): void;
  }

  export interface SQLiteTransaction {
    executeSql(
      statement: string,
      params?: any[],
      success?: (tx: SQLiteTransaction, resultSet: SQLiteResultSet) => void,
      error?: (tx: SQLiteTransaction, error: Error) => void
    ): void;
  }

  export interface SQLiteResultSet {
    insertId?: number;
    rowsAffected: number;
    rows: {
      length: number;
      item: (idx: number) => any;
      raw: () => any[];
    };
  }

  export interface SQLitePluginStatic {
    openDatabase(
      config: SQLiteDatabaseConfig | string,
      successCallback?: (db: SQLiteDatabase) => void,
      errorCallback?: (err: Error) => void
    ): Promise<SQLiteDatabase> | SQLiteDatabase;
    deleteDatabase(
      config: SQLiteDatabaseConfig | string,
      successCallback?: () => void,
      errorCallback?: (err: Error) => void
    ): Promise<void> | void;
    echoTest(successCallback: (value: string) => void): void;
    enablePromise(enabled: boolean): void;
    DEBUG: boolean;
    RESULTS: {
      OK: 0;
      DB_CLOSED: 1;
      INTERNAL_ERR: 2;
      SYNTAX_ERR: 3;
      CONSTRAINT_ERR: 4;
      NOT_FOUND: 5;
      FULL: 6;
      QUOTA_ERR: 7;
      IO_ERR: 8;
      CORRUPT: 9;
      UNKNOWN: 10;
      ABORT: 11;
      TIMEOUT: 12;
      BUSY: 13;
      NOT_IMPLEMENTED: 14;
      AUTH_ERR: 15;
      FORMAT_ERR: 16;
    };
    TRANSACTION: {
      DEFERRED: 0;
      IMMEDIATE: 1;
      EXCLUSIVE: 2;
    };
  }

  export interface SQLiteDatabaseConfig {
    name: string;
    location?: string | number;
    createFromLocation?: number | string;
    key?: string;
    androidDatabaseProvider?: 'system' | 'default';
    androidLockWorkaround?: number;
  }

  const SQLitePlugin: SQLitePluginStatic;
  export default SQLitePlugin;
}
