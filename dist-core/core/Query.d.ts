import { Collection } from './Collection';
import { Model } from './Model';
import { WhereCondition, OrderByClause, WhereOperator } from '../types';
export declare class Query<M extends Model = Model> {
    protected _table: string;
    protected _modelClass: typeof Model;
    protected _selects: string[];
    protected _wheres: WhereCondition[];
    protected _orders: OrderByClause[];
    protected _limit: number | null;
    protected _offset: number | null;
    protected _joins: string[];
    protected _groups: string[];
    protected _havings: WhereCondition[];
    protected _relations: string[];
    /**
     * Constructeur de Query
     */
    constructor(modelClass: typeof Model, table: string);
    /**
     * Spécifier les colonnes à sélectionner
     */
    select(...columns: string[]): this;
    /**
     * Ajouter une clause WHERE
     */
    where(column: string, operator: WhereOperator | string | number | boolean | null | undefined, value?: string | number | boolean | null | undefined | (string | number | boolean | null | undefined)[], boolean?: 'and' | 'or'): this;
    /**
     * Ajouter une clause WHERE avec OR
     */
    orWhere(column: string, operator: WhereOperator | string | number | boolean | null | undefined, value?: string | number | boolean | null | undefined | (string | number | boolean | null | undefined)[]): this;
    /**
     * Ajouter une clause WHERE IN
     */
    whereIn(column: string, values: (string | number | boolean | null | undefined)[], boolean?: 'and' | 'or'): this;
    /**
     * Ajouter une clause WHERE NOT IN
     */
    whereNotIn(column: string, values: (string | number | boolean | null | undefined)[], boolean?: 'and' | 'or'): this;
    /**
     * Ajouter une clause WHERE NULL
     */
    whereNull(column: string, boolean?: 'and' | 'or'): this;
    /**
     * Ajouter une clause WHERE NOT NULL
     */
    whereNotNull(column: string, boolean?: 'and' | 'or'): this;
    /**
     * Ajouter une clause ORDER BY
     */
    orderBy(column: string, direction?: 'asc' | 'desc'): this;
    /**
     * Ajouter une clause LIMIT
     */
    limit(limit: number): this;
    /**
     * Ajouter une clause OFFSET
     */
    offset(offset: number): this;
    /**
     * Ajouter une clause JOIN
     */
    join(table: string, first: string, operator: string, second: string): this;
    /**
     * Ajouter une clause LEFT JOIN
     */
    leftJoin(table: string, first: string, operator: string, second: string): this;
    /**
     * Ajouter une clause GROUP BY
     */
    groupBy(...columns: string[]): this;
    /**
     * Ajouter une clause HAVING
     */
    having(column: string, operator: WhereOperator | string | number | boolean | null | undefined, value?: string | number | boolean | null | undefined | (string | number | boolean | null | undefined)[], boolean?: 'and' | 'or'): this;
    /**
     * Spécifier les relations à charger avec eager loading
     */
    with(...relations: string[]): this;
    /**
     * Construire la requête SQL
     */
    protected buildQuery(): {
        sql: string;
        params: (string | number | boolean | null | undefined)[];
    };
    /**
     * Exécuter la requête et retourner tous les résultats
     */
    get(): Promise<Collection<M>>;
    /**
     * Exécuter la requête et retourner le premier résultat
     */
    first(): Promise<M | null>;
    /**
     * Trouver un modèle par sa clé primaire
     */
    find(id: number | string): Promise<M | null>;
    /**
     * Compter le nombre de résultats
     */
    count(column?: string): Promise<number>;
    /**
     * Vérifier si des résultats existent
     */
    exists(): Promise<boolean>;
    /**
     * Mettre à jour des enregistrements
     */
    update(data: Record<string, string | number | boolean | null | undefined | Date | object | (string | number | boolean | null | undefined | Date | object)[]>): Promise<number>;
    /**
     * Supprimer des enregistrements
     */
    delete(): Promise<number>;
    /**
     * Construire uniquement la clause WHERE
     */
    protected buildWhereClause(): {
        sql: string;
        params: (string | number | boolean | null | undefined)[];
    };
    /**
     * Charger les relations pour une collection de modèles
     */
    protected loadRelations(collection: Collection<M>): Promise<void>;
}
