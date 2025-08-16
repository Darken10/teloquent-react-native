/**
 * Relation BelongsToMany - Relation many-to-many entre deux modèles
 */
import { Model } from '../core/Model';
import { Collection } from '../core/Collection';
import { Relation } from './Relation';
export declare class BelongsToMany<T extends Model = Model> extends Relation<T> {
    protected pivotTable: string;
    protected foreignPivotKey: string;
    protected relatedPivotKey: string;
    protected parentKey: string;
    protected relatedKey: string;
    protected pivotColumns: string[];
    /**
     * Constructeur de la relation BelongsToMany
     */
    constructor(relatedModel: typeof Model, parentModel: Model, pivotTable: string, foreignPivotKey: string, relatedPivotKey: string, parentKey: string, relatedKey: string);
    /**
     * Ajouter les contraintes de base à la requête
     */
    protected addConstraints(): void;
    /**
     * Effectuer la jointure avec la table pivot
     */
    protected performJoin(): void;
    /**
     * Spécifier les colonnes supplémentaires à sélectionner dans la table pivot
     */
    withPivot(...columns: string[]): this;
    /**
     * Obtenir les résultats de la relation
     */
    getResults(): Promise<Collection<T>>;
    /**
     * Ajouter les colonnes pivot à la sélection
     */
    protected addPivotColumns(): void;
    /**
     * Attacher un modèle à la relation
     */
    attach(id: number | string | T | (number | string | T)[], pivotAttributes?: Record<string, any>): Promise<void>;
    /**
     * Attacher un seul modèle à la relation
     */
    protected attachOne(id: number | string, pivotAttributes?: Record<string, any>): Promise<void>;
    /**
     * Détacher un modèle de la relation
     */
    detach(id?: number | string | T | (number | string | T)[] | null): Promise<void>;
    /**
     * Détacher tous les modèles de la relation
     */
    protected detachAll(): Promise<void>;
    /**
     * Synchroniser la relation avec une liste d'IDs
     */
    sync(ids: (number | string | T)[], pivotAttributes?: Record<string, any>): Promise<void>;
    /**
     * Mettre à jour les attributs pivot pour un modèle
     */
    updateExistingPivot(id: number | string, attributes: Record<string, any>): Promise<void>;
    /**
     * Convertir les entrées en IDs
     */
    protected convertToIds(value: number | string | T | (number | string | T)[]): (number | string)[];
    /**
     * Charger la relation pour une collection de modèles
     */
    loadForCollection(collection: Collection, relationName: string): Promise<void>;
    /**
     * Obtenir les relations imbriquées
     */
    protected getNestedRelations(relationName: string): string[];
}
