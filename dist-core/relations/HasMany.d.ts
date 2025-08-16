/**
 * Relation HasMany - Un modèle parent possède plusieurs modèles enfants
 */
import { Model } from '../core/Model';
import { Collection } from '../core/Collection';
import { Relation } from './Relation';
export declare class HasMany<T extends Model = Model> extends Relation<T> {
    protected foreignKey: string;
    protected localKey: string;
    /**
     * Constructeur de la relation HasMany
     */
    constructor(relatedModel: typeof Model, parentModel: Model, foreignKey: string, localKey: string);
    /**
     * Ajouter les contraintes de base à la requête
     */
    protected addConstraints(): void;
    /**
     * Obtenir les résultats de la relation
     */
    getResults(): Promise<Collection<T>>;
    /**
     * Charger la relation pour une collection de modèles
     */
    loadForCollection(collection: Collection, relationName: string): Promise<void>;
    /**
     * Obtenir les relations imbriquées
     */
    protected getNestedRelations(relationName: string): string[];
    /**
     * Créer un nouveau modèle lié et l'associer au parent
     */
    create(attributes?: Record<string, any>): Promise<T>;
    /**
     * Sauvegarder un modèle existant et l'associer au parent
     */
    save(model: T): Promise<T>;
}
