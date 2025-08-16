/**
 * Classe QueryBuilder - Constructeur de requêtes SQL
 */
import { Model } from '../core/Model';
import { WhereCondition, OrderByClause } from '../types';
/**
 * Interface pour le constructeur de requêtes
 */
export declare class QueryBuilder<T extends Model> {
    /**
     * Table cible de la requête
     */
    protected table: string;
    /**
     * Conditions WHERE de la requête
     */
    protected wheres: WhereCondition[];
    /**
     * Clauses ORDER BY de la requête
     */
    protected orders: OrderByClause[];
    /**
     * Limite de résultats
     */
    protected limitValue: number | null;
    /**
     * Décalage des résultats
     */
    protected offsetValue: number | null;
    /**
     * Colonnes à sélectionner
     */
    protected columns: string[];
    /**
     * Jointures de la requête
     */
    protected joins: any[];
    /**
     * Groupements de la requête
     */
    protected groups: string[];
    /**
     * Conditions HAVING de la requête
     */
    protected havings: any[];
    /**
     * Classe du modèle associé
     */
    protected model: new () => T;
    /**
     * Constructeur
     * @param table Nom de la table
     * @param model Classe du modèle associé
     */
    constructor(table: string, model: new () => T);
    /**
     * Ajoute une condition WHERE à la requête
     * @param column Nom de la colonne
     * @param operator Opérateur de comparaison
     * @param value Valeur à comparer
     */
    where(column: string, operator: string | any, value?: any): this;
    /**
     * Ajoute une condition WHERE OR à la requête
     * @param column Nom de la colonne
     * @param operator Opérateur de comparaison
     * @param value Valeur à comparer
     */
    orWhere(column: string, operator: string | any, value?: any): this;
    /**
     * Ajoute une clause ORDER BY à la requête
     * @param column Nom de la colonne
     * @param direction Direction du tri (asc ou desc)
     */
    orderBy(column: string, direction?: 'asc' | 'desc'): this;
    /**
     * Limite le nombre de résultats
     * @param limit Nombre maximum de résultats
     */
    limit(limit: number): this;
    /**
     * Décale les résultats
     * @param offset Nombre de résultats à sauter
     */
    offset(offset: number): this;
    /**
     * Spécifie les colonnes à sélectionner
     * @param columns Colonnes à sélectionner
     */
    select(...columns: string[]): this;
    /**
     * Ajoute une jointure à la requête
     * @param table Table à joindre
     * @param first Première colonne de la condition de jointure
     * @param operator Opérateur de comparaison
     * @param second Seconde colonne de la condition de jointure
     * @param type Type de jointure (inner, left, right, etc.)
     */
    join(table: string, first: string, operator: string, second: string, type?: string): this;
    /**
     * Ajoute une jointure LEFT à la requête
     * @param table Table à joindre
     * @param first Première colonne de la condition de jointure
     * @param operator Opérateur de comparaison
     * @param second Seconde colonne de la condition de jointure
     */
    leftJoin(table: string, first: string, operator: string, second: string): this;
    /**
     * Ajoute une clause GROUP BY à la requête
     * @param columns Colonnes pour le groupement
     */
    groupBy(...columns: string[]): this;
    /**
     * Ajoute une condition HAVING à la requête
     * @param column Nom de la colonne
     * @param operator Opérateur de comparaison
     * @param value Valeur à comparer
     */
    having(column: string, operator: string | any, value?: any): this;
    /**
     * Récupère le premier résultat de la requête
     */
    first(): Promise<T | null>;
    /**
     * Récupère le premier résultat de la requête ou lance une exception
     */
    firstOrFail(): Promise<T>;
    /**
     * Récupère tous les résultats de la requête
     */
    get(): Promise<T[]>;
    /**
     * Compte le nombre de résultats
     */
    count(): Promise<number>;
    /**
     * Insère un nouvel enregistrement
     * @param values Valeurs à insérer
     */
    insert(values: Record<string, any>): Promise<number>;
    /**
     * Met à jour des enregistrements
     * @param values Valeurs à mettre à jour
     */
    update(values: Record<string, any>): Promise<number>;
    /**
     * Supprime des enregistrements
     */
    delete(): Promise<number>;
    /**
     * Vérifie si des enregistrements existent
     */
    exists(): Promise<boolean>;
    /**
     * Génère la requête SQL
     */
    toSql(): string;
    /**
     * Obtient les paramètres de la requête
     */
    getBindings(): any[];
}
