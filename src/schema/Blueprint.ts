/**
 * Classe Blueprint pour définir la structure des tables
 */
import { ColumnDefinition, ColumnType } from '../types';

interface SqlStatement {
  sql: string;
  params: any[];
}

export class Blueprint {
  protected tableName: string;
  protected columns: ColumnDefinition[] = [];
  protected commands: Array<{ type: string; name?: string; to?: string }> = [];
  protected isModification: boolean;

  /**
   * Constructeur du Blueprint
   */
  constructor(tableName: string, isModification: boolean = false) {
    this.tableName = tableName;
    this.isModification = isModification;
  }

  /**
   * Ajouter une colonne de type incrémental (clé primaire)
   */
  public increments(columnName: string = 'id'): this {
    this.columns.push({
      name: columnName,
      type: 'integer',
      primaryKey: true
    });
    
    return this;
  }

  /**
   * Ajouter une colonne de type entier
   */
  public integer(columnName: string): this {
    this.columns.push({
      name: columnName,
      type: 'integer'
    });
    
    return this;
  }

  /**
   * Ajouter une colonne de type grand entier
   */
  public bigInteger(columnName: string): this {
    this.columns.push({
      name: columnName,
      type: 'bigInteger'
    });
    
    return this;
  }

  /**
   * Ajouter une colonne de type chaîne de caractères
   */
  public string(columnName: string, length: number = 255): this {
    this.columns.push({
      name: columnName,
      type: 'string',
      length
    });
    
    return this;
  }

  /**
   * Ajouter une colonne de type texte
   */
  public text(columnName: string): this {
    this.columns.push({
      name: columnName,
      type: 'text'
    });
    
    return this;
  }

  /**
   * Ajouter une colonne de type booléen
   */
  public boolean(columnName: string): this {
    this.columns.push({
      name: columnName,
      type: 'boolean'
    });
    
    return this;
  }

  /**
   * Ajouter une colonne de type date
   */
  public date(columnName: string): this {
    this.columns.push({
      name: columnName,
      type: 'date'
    });
    
    return this;
  }

  /**
   * Ajouter une colonne de type datetime
   */
  public datetime(columnName: string): this {
    this.columns.push({
      name: columnName,
      type: 'datetime'
    });
    
    return this;
  }

  /**
   * Ajouter une colonne de type float
   */
  public float(columnName: string, precision: number = 8, scale: number = 2): this {
    this.columns.push({
      name: columnName,
      type: 'float',
      precision,
      scale
    });
    
    return this;
  }

  /**
   * Ajouter une colonne de type decimal
   */
  public decimal(columnName: string, precision: number = 8, scale: number = 2): this {
    this.columns.push({
      name: columnName,
      type: 'decimal',
      precision,
      scale
    });
    
    return this;
  }

  /**
   * Ajouter une colonne de type JSON
   */
  public json(columnName: string): this {
    this.columns.push({
      name: columnName,
      type: 'json'
    });
    
    return this;
  }

  /**
   * Définir une colonne comme nullable
   */
  public nullable(): this {
    if (this.columns.length > 0) {
      this.columns[this.columns.length - 1].nullable = true;
    }
    
    return this;
  }

  /**
   * Définir une valeur par défaut pour une colonne
   */
  public defaultValue(value: any): this {
    if (this.columns.length > 0) {
      this.columns[this.columns.length - 1].defaultValue = value;
    }
    
    return this;
  }

  /**
   * Définir une colonne comme unique
   */
  public unique(): this {
    if (this.columns.length > 0) {
      this.columns[this.columns.length - 1].unique = true;
    }
    
    return this;
  }

  /**
   * Définir une colonne comme index
   */
  public index(): this {
    if (this.columns.length > 0) {
      this.columns[this.columns.length - 1].index = true;
    }
    
    return this;
  }

  /**
   * Définir une colonne comme clé primaire
   */
  public primary(): this {
    if (this.columns.length > 0) {
      this.columns[this.columns.length - 1].primaryKey = true;
    }
    
    return this;
  }

  /**
   * Définir une colonne comme clé étrangère
   */
  public references(column: string): this {
    if (this.columns.length > 0) {
      this.columns[this.columns.length - 1].references = {
        table: '',
        column
      };
    }
    
    return this;
  }

  /**
   * Définir la table référencée par une clé étrangère
   */
  public on(table: string): this {
    if (this.columns.length > 0 && this.columns[this.columns.length - 1].references) {
      this.columns[this.columns.length - 1].references!.table = table;
    }
    
    return this;
  }

  /**
   * Définir l'action ON DELETE pour une clé étrangère
   */
  public onDelete(action: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION'): this {
    if (this.columns.length > 0) {
      this.columns[this.columns.length - 1].onDelete = action;
    }
    
    return this;
  }

  /**
   * Définir l'action ON UPDATE pour une clé étrangère
   */
  public onUpdate(action: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION'): this {
    if (this.columns.length > 0) {
      this.columns[this.columns.length - 1].onUpdate = action;
    }
    
    return this;
  }

  /**
   * Ajouter des colonnes de timestamps (created_at, updated_at)
   */
  public timestamps(): this {
    this.datetime('created_at').nullable();
    this.datetime('updated_at').nullable();
    
    return this;
  }

  /**
   * Ajouter une colonne de timestamp de suppression (deleted_at)
   */
  public softDeletes(): this {
    this.datetime('deleted_at').nullable();
    
    return this;
  }

  /**
   * Supprimer une colonne
   */
  public dropColumn(columnName: string): this {
    this.commands.push({
      type: 'dropColumn',
      name: columnName
    });
    
    return this;
  }

  /**
   * Renommer une colonne
   */
  public renameColumn(from: string, to: string): this {
    this.commands.push({
      type: 'renameColumn',
      name: from,
      to
    });
    
    return this;
  }

  /**
   * Générer les instructions SQL
   */
  public toSql(): SqlStatement[] {
    const statements: SqlStatement[] = [];
    
    if (!this.isModification) {
      // Créer une nouvelle table
      statements.push(this.createTableSql());
      
      // Ajouter les index et contraintes
      statements.push(...this.createIndexesSql());
    } else {
      // Modifier une table existante
      statements.push(...this.alterTableSql());
    }
    
    return statements;
  }

  /**
   * Générer l'instruction SQL pour créer une table
   */
  protected createTableSql(): SqlStatement {
    // 1) Colonnes
    const columnSqlParts = this.columns.map(column => {
      let sql = `${column.name} ${this.getColumnType(column)}`;

      if (column.primaryKey) {
        sql += ' PRIMARY KEY';
        if (column.type === 'integer') {
          sql += ' AUTOINCREMENT';
        }
      }

      if (column.nullable === false) {
        sql += ' NOT NULL';
      }

      if (column.defaultValue !== undefined) {
        sql += ` DEFAULT ${this.getDefaultValueSql(column.defaultValue)}`;
      }

      if (column.unique) {
        sql += ' UNIQUE';
      }

      return sql;
    });

    // 2) Contraintes de clés étrangères (SQLite: doivent être dans CREATE TABLE)
    const fkSqlParts: string[] = [];
    this.columns.forEach(column => {
      if (column.references && column.references.table && column.references.column) {
        let fk = `FOREIGN KEY (${column.name}) REFERENCES ${column.references.table} (${column.references.column})`;
        if (column.onDelete) {
          fk += ` ON DELETE ${column.onDelete}`;
        }
        if (column.onUpdate) {
          fk += ` ON UPDATE ${column.onUpdate}`;
        }
        fkSqlParts.push(fk);
      }
    });

    const allParts = [...columnSqlParts, ...fkSqlParts];

    return {
      sql: `CREATE TABLE IF NOT EXISTS ${this.tableName} (${allParts.join(', ')})`,
      params: []
    };
  }

  /**
   * Générer les instructions SQL pour les index et contraintes
   */
  protected createIndexesSql(): SqlStatement[] {
    const statements: SqlStatement[] = [];
    
    // Ajouter les index
    this.columns.forEach(column => {
      if (column.index && !column.primaryKey && !column.unique) {
        statements.push({
          sql: `CREATE INDEX IF NOT EXISTS idx_${this.tableName}_${column.name} ON ${this.tableName} (${column.name})`,
          params: []
        });
      }
    });
    
    return statements;
  }

  /**
   * Générer les instructions SQL pour modifier une table
   */
  protected alterTableSql(): SqlStatement[] {
    const statements: SqlStatement[] = [];
    
    // Ajouter les nouvelles colonnes
    this.columns.forEach(column => {
      let sql = `ALTER TABLE ${this.tableName} ADD COLUMN ${column.name} ${this.getColumnType(column)}`;
      
      if (column.nullable === false) {
        sql += ' NOT NULL';
      }
      
      if (column.defaultValue !== undefined) {
        sql += ` DEFAULT ${this.getDefaultValueSql(column.defaultValue)}`;
      }
      
      statements.push({
        sql,
        params: []
      });
      
      // Ajouter les index
      if (column.index && !column.primaryKey && !column.unique) {
        statements.push({
          sql: `CREATE INDEX IF NOT EXISTS idx_${this.tableName}_${column.name} ON ${this.tableName} (${column.name})`,
          params: []
        });
      }
      
      // Ajouter les contraintes d'unicité
      if (column.unique) {
        statements.push({
          sql: `CREATE UNIQUE INDEX IF NOT EXISTS unq_${this.tableName}_${column.name} ON ${this.tableName} (${column.name})`,
          params: []
        });
      }
    });
    
    // Exécuter les commandes
    this.commands.forEach(command => {
      if (command.type === 'dropColumn') {
        // SQLite ne supporte pas directement ALTER TABLE DROP COLUMN
        // Il faut recréer la table sans la colonne
        statements.push({
          sql: `-- DROP COLUMN ${command.name} (nécessite une recréation de table en SQLite)`,
          params: []
        });
      } else if (command.type === 'renameColumn' && command.to) {
        statements.push({
          sql: `ALTER TABLE ${this.tableName} RENAME COLUMN ${command.name} TO ${command.to}`,
          params: []
        });
      }
    });
    
    return statements;
  }

  /**
   * Obtenir le type SQL pour une colonne
   */
  protected getColumnType(column: ColumnDefinition): string {
    switch (column.type) {
      case 'integer':
      case 'bigInteger':
        return 'INTEGER';
      case 'string':
        return `VARCHAR(${column.length || 255})`;
      case 'text':
        return 'TEXT';
      case 'boolean':
        return 'BOOLEAN';
      case 'date':
      case 'datetime':
        return 'DATETIME';
      case 'float':
      case 'decimal':
        return `REAL`;
      case 'json':
        return 'TEXT';
      default:
        return 'TEXT';
    }
  }

  /**
   * Obtenir la représentation SQL d'une valeur par défaut
   */
  protected getDefaultValueSql(value: any): string {
    if (value === null) {
      return 'NULL';
    }
    
    if (typeof value === 'boolean') {
      return value ? '1' : '0';
    }
    
    if (typeof value === 'number') {
      return value.toString();
    }
    
    if (typeof value === 'object') {
      return `'${JSON.stringify(value)}'`;
    }
    
    return `'${value}'`;
  }
}
