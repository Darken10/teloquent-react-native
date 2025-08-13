/**
 * Déclarations de types pour les modules externes
 */

/**
 * Déclaration de types pour expo-sqlite
 */
declare module 'expo-sqlite' {
  export interface SQLiteDatabase {
    transaction(
      callback: (transaction: SQLTransaction) => void,
      error?: (error: any) => void,
      success?: () => void
    ): void;
    
    readTransaction(
      callback: (transaction: SQLTransaction) => void,
      error?: (error: any) => void,
      success?: () => void
    ): void;
    
    closeAsync(): Promise<void>;
    
    deleteAsync(): Promise<void>;
    
    execAsync(sqlStatements: string[] | string, params?: any[]): Promise<any>;
  }
  
  export interface SQLTransaction {
    executeSql(
      sqlStatement: string,
      args?: any[],
      success?: (transaction: SQLTransaction, resultSet: SQLResultSet) => void,
      error?: (transaction: SQLTransaction, error: any) => void
    ): void;
  }
  
  export interface SQLResultSet {
    insertId?: number;
    rowsAffected: number;
    rows: {
      length: number;
      item(index: number): any;
      _array: any[];
    };
  }
  
  export function openDatabase(
    name: string,
    version?: string,
    description?: string,
    size?: number,
    callback?: (db: SQLiteDatabase) => void
  ): SQLiteDatabase;
}

/**
 * Déclaration de types pour react-native-sqlite-storage
 */
declare module 'react-native-sqlite-storage' {
  export interface SQLiteDatabase {
    transaction(
      callback: (transaction: SQLTransaction) => void,
      error?: (error: any) => void,
      success?: () => void
    ): void;
    
    readTransaction(
      callback: (transaction: SQLTransaction) => void,
      error?: (error: any) => void,
      success?: () => void
    ): void;
    
    close(): Promise<void>;
    
    executeSql(
      sqlStatement: string,
      params?: any[]
    ): Promise<[SQLResultSet]>;
    
    attach(
      dbName: string,
      dbAlias: string,
      location?: string,
      callback?: () => void
    ): Promise<void>;
    
    detach(
      dbAlias: string,
      callback?: () => void
    ): Promise<void>;
  }
  
  export interface SQLTransaction {
    executeSql(
      sqlStatement: string,
      params?: any[],
      success?: (transaction: SQLTransaction, resultSet: SQLResultSet) => void,
      error?: (transaction: SQLTransaction, error: any) => void
    ): void;
  }
  
  export interface SQLResultSet {
    insertId?: number;
    rowsAffected: number;
    rows: {
      length: number;
      item(index: number): any;
      raw(): any[];
    };
  }
  
  export interface SQLError {
    code: number;
    message: string;
  }
  
  export function openDatabase(
    config: {
      name: string;
      location?: string;
      createFromLocation?: number | string;
      key?: string;
      version?: string;
      readOnly?: boolean;
    },
    success?: (db: SQLiteDatabase) => void,
    error?: (error: SQLError) => void
  ): Promise<SQLiteDatabase>;
  
  export function deleteDatabase(
    config: {
      name: string;
      location?: string;
    },
    success?: () => void,
    error?: (error: SQLError) => void
  ): Promise<void>;
  
  export function enablePromise(enable: boolean): void;
}
