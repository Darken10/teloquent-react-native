/**
 * Classe Blueprint pour définir la structure des tables
 */
import { ColumnDefinition } from '../types';
interface SqlStatement {
    sql: string;
    params: any[];
}
export declare class Blueprint {
    protected tableName: string;
    protected columns: ColumnDefinition[];
    protected commands: Array<{
        type: string;
        name?: string;
        to?: string;
    }>;
    protected isModification: boolean;
    /**
     * Constructeur du Blueprint
     */
    constructor(tableName: string, isModification?: boolean);
    /**
     * Ajouter une colonne de type incrémental (clé primaire)
     */
    increments(columnName?: string): this;
    /**
     * Ajouter une colonne de type entier
     */
    integer(columnName: string): this;
    /**
     * Ajouter une colonne de type grand entier
     */
    bigInteger(columnName: string): this;
    /**
     * Ajouter une colonne de type chaîne de caractères
     */
    string(columnName: string, length?: number): this;
    /**
     * Ajouter une colonne de type texte
     */
    text(columnName: string): this;
    /**
     * Ajouter une colonne de type booléen
     */
    boolean(columnName: string): this;
    /**
     * Ajouter une colonne de type date
     */
    date(columnName: string): this;
    /**
     * Ajouter une colonne de type datetime
     */
    datetime(columnName: string): this;
    /**
     * Ajouter une colonne de type float
     */
    float(columnName: string, precision?: number, scale?: number): this;
    /**
     * Ajouter une colonne de type decimal
     */
    decimal(columnName: string, precision?: number, scale?: number): this;
    /**
     * Ajouter une colonne de type JSON
     */
    json(columnName: string): this;
    /**
     * Définir une colonne comme nullable
     */
    nullable(): this;
    /**
     * Définir une valeur par défaut pour une colonne
     */
    defaultValue(value: any): this;
    /**
     * Définir une colonne comme unique
     */
    unique(): this;
    /**
     * Définir une colonne comme index
     */
    index(): this;
    /**
     * Définir une colonne comme clé primaire
     */
    primary(): this;
    /**
     * Définir une colonne comme clé étrangère
     */
    references(column: string): this;
    /**
     * Définir la table référencée par une clé étrangère
     */
    on(table: string): this;
    /**
     * Définir l'action ON DELETE pour une clé étrangère
     */
    onDelete(action: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION'): this;
    /**
     * Définir l'action ON UPDATE pour une clé étrangère
     */
    onUpdate(action: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION'): this;
    /**
     * Ajouter des colonnes de timestamps (created_at, updated_at)
     */
    timestamps(): this;
    /**
     * Ajouter une colonne de timestamp de suppression (deleted_at)
     */
    softDeletes(): this;
    /**
     * Supprimer une colonne
     */
    dropColumn(columnName: string): this;
    /**
     * Renommer une colonne
     */
    renameColumn(from: string, to: string): this;
    /**
     * Générer les instructions SQL
     */
    toSql(): SqlStatement[];
    /**
     * Générer l'instruction SQL pour créer une table
     */
    protected createTableSql(): SqlStatement;
    /**
     * Générer les instructions SQL pour les index et contraintes
     */
    protected createIndexesSql(): SqlStatement[];
    /**
     * Générer les instructions SQL pour modifier une table
     */
    protected alterTableSql(): SqlStatement[];
    /**
     * Obtenir le type SQL pour une colonne
     */
    protected getColumnType(column: ColumnDefinition): string;
    /**
     * Obtenir la représentation SQL d'une valeur par défaut
     */
    protected getDefaultValueSql(value: any): string;
}
export {};
