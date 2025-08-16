/**
 * Relation HasOne - Un modèle parent possède un modèle enfant
 */
import { Model } from '../core/Model';
import { Collection } from '../core/Collection';
import { Relation } from './Relation';
export declare class HasOne<T extends Model = Model> extends Relation<T> {
    protected foreignKey: string;
    protected localKey: string;
    /**
     * Constructeur de la relation HasOne
     */
    constructor(relatedModel: typeof Model, parentModel: Model, foreignKey: string, localKey: string);
    /**
     * Ajouter les contraintes de base à la requête
     */
    protected addConstraints(): void;
    /**
     * Obtenir les résultats de la relation
     */
    getResults(): Promise<T | null>;
    /**
     * Charger la relation pour une collection de modèles
     */
    loadForCollection(collection: Collection, relationName: string): Promise<void>;
    /**
     * Obtenir les relations imbriquées
     */
    protected getNestedRelations(relationName: string): string[];
}
