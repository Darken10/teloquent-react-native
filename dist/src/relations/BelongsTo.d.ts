/**
 * Relation BelongsTo - Un modèle enfant appartient à un modèle parent
 */
import { Model } from '../core/Model';
import { Collection } from '../core/Collection';
import { Relation } from './Relation';
export declare class BelongsTo<T extends Model = Model> extends Relation<T> {
    protected foreignKey: string;
    protected ownerKey: string;
    /**
     * Constructeur de la relation BelongsTo
     */
    constructor(relatedModel: typeof Model, parentModel: Model, foreignKey: string, ownerKey: string);
    /**
     * Ajouter les contraintes de base à la requête
     */
    protected addConstraints(): void;
    /**
     * Obtenir les résultats de la relation
     */
    getResults(): Promise<T | null>;
    /**
     * Associer un modèle à la relation
     */
    associate(model: T): Promise<Model>;
    /**
     * Dissocier le modèle de la relation
     */
    dissociate(): Promise<Model>;
    /**
     * Charger la relation pour une collection de modèles
     */
    loadForCollection(collection: Collection, relationName: string): Promise<void>;
    /**
     * Obtenir les relations imbriquées
     */
    protected getNestedRelations(relationName: string): string[];
}
