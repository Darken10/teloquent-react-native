/**
 * Classe de base pour toutes les relations
 */
import { Model } from '../core/Model';
import { Query } from '../query/Query';
import { Collection } from '../core/Collection';
export declare abstract class Relation<T extends Model = Model> {
    protected relatedModel: typeof Model;
    protected parentModel: Model;
    protected query: Query<T>;
    /**
     * Constructeur de la relation
     */
    constructor(relatedModel: typeof Model, parentModel: Model);
    /**
     * Ajouter les contraintes de base à la requête
     */
    protected abstract addConstraints(): void;
    /**
     * Obtenir les résultats de la relation
     */
    abstract getResults(): Promise<T | Collection<T>>;
    /**
     * Obtenir la requête de base pour la relation
     */
    getQuery(): Query<T>;
    /**
     * Ajouter des contraintes à la requête
     */
    where(column: string, operator: any, value?: any): this;
    /**
     * Ajouter une clause ORDER BY à la requête
     */
    orderBy(column: string, direction?: 'asc' | 'desc'): this;
    /**
     * Ajouter une clause LIMIT à la requête
     */
    limit(limit: number): this;
    /**
     * Ajouter une clause OFFSET à la requête
     */
    offset(offset: number): this;
    /**
     * Spécifier les relations à charger avec eager loading
     */
    with(...relations: string[]): this;
    /**
     * Exécuter la requête et obtenir tous les résultats
     */
    get(): Promise<Collection<T>>;
    /**
     * Exécuter la requête et obtenir le premier résultat
     */
    first(): Promise<T | null>;
    /**
     * Compter le nombre de résultats
     */
    count(): Promise<number>;
    /**
     * Vérifier si des résultats existent
     */
    exists(): Promise<boolean>;
    /**
     * Charger la relation pour une collection de modèles
     */
    abstract loadForCollection(collection: Collection, relationName: string): Promise<void>;
}
