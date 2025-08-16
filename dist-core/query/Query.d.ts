/**
 * Classe Query - Extension de QueryBuilder avec des fonctionnalités spécifiques aux modèles
 */
import { Model } from '../core/Model';
import { Collection } from '../core/Collection';
import { QueryBuilder } from './query-builder';
export declare class Query<T extends Model> extends QueryBuilder<T> {
    /**
     * Classe du modèle associé
     */
    protected modelClass: typeof Model;
    /**
     * Relations à charger avec eager loading
     */
    protected eagerLoad: string[];
    /**
     * Constructeur
     * @param modelClass Classe du modèle
     * @param table Nom de la table
     */
    constructor(modelClass: typeof Model, table: string);
    /**
     * Spécifier les relations à charger avec eager loading
     * @param relations Relations à charger
     */
    with(...relations: string[]): this;
    /**
     * Trouver un modèle par sa clé primaire
     * @param id Valeur de la clé primaire
     */
    find(id: number | string): Promise<T | null>;
    /**
     * Récupérer tous les résultats de la requête
     */
    get(): Promise<Collection<T>>;
    /**
     * Exécuter la requête SQL
     */
    private executeQuery;
    /**
     * Créer des instances de modèle à partir des résultats bruts
     * @param results Résultats bruts de la requête
     */
    private hydrateModels;
    /**
     * Charger les relations pour une collection de modèles
     * @param models Collection de modèles
     */
    private loadRelations;
}
