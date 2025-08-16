/**
 * Types pour le système de modèles
 */
import { QueryBuilder } from '../query/query-builder';
import { RelationMethods, StaticRelationMethods } from './relations';
import { Model } from '../core/Model';
/**
 * Interface pour les attributs de modèle
 */
export interface ModelAttributes {
    [key: string]: string | number | boolean | null | undefined | Date | object | (string | number | boolean | null | undefined | Date | object)[];
}
/**
 * Interface pour les options de modèle
 */
export interface ModelOptions {
    /**
     * Nom de la table (par défaut: version plurielle du nom du modèle)
     */
    table?: string;
    /**
     * Nom de la clé primaire (par défaut: 'id')
     */
    primaryKey?: string;
    /**
     * Si le modèle utilise les timestamps (created_at, updated_at)
     */
    timestamps?: boolean;
    /**
     * Si le modèle utilise les soft deletes (deleted_at)
     */
    softDeletes?: boolean;
    /**
     * Attributs qui peuvent être assignés en masse
     */
    fillable?: string[];
    /**
     * Attributs qui sont protégés contre l'assignation en masse
     */
    guarded?: string[];
    /**
     * Attributs qui doivent être cachés lors de la sérialisation
     */
    hidden?: string[];
    /**
     * Attributs qui doivent être visibles lors de la sérialisation
     */
    visible?: string[];
    /**
     * Attributs qui doivent être convertis en types natifs
     */
    casts?: Record<string, string>;
    /**
     * Attributs qui doivent être convertis en dates
     */
    dates?: string[];
    /**
     * Relations à charger automatiquement
     */
    with?: string[];
}
/**
 * Interface pour les méthodes d'événements de modèle
 */
export interface ModelEvents {
    /**
     * Enregistre un écouteur d'événement
     * @param event Nom de l'événement
     * @param callback Fonction de rappel
     */
    on(event: string, callback: Function): void;
    /**
     * Déclenche un événement
     * @param event Nom de l'événement
     * @param payload Données associées à l'événement
     */
    emit(event: string, payload?: any): void;
}
/**
 * Interface pour les méthodes de modèle
 */
export interface ModelMethods {
    /**
     * Obtient la valeur de la clé primaire
     */
    getKey(): any;
    /**
     * Obtient le nom de la clé primaire
     */
    getKeyName(): string;
    /**
     * Obtient le nom de la table
     */
    getTable(): string;
    /**
     * Vérifie si le modèle existe dans la base de données
     */
    exists(): boolean;
    /**
     * Vérifie si le modèle a été modifié depuis le chargement
     */
    isDirty(): boolean;
    /**
     * Vérifie si un attribut spécifique a été modifié
     * @param attribute Nom de l'attribut
     */
    isDirty(attribute: string): boolean;
    /**
     * Obtient les attributs originaux (non modifiés)
     */
    getOriginal(): ModelAttributes;
    /**
     * Obtient la valeur originale d'un attribut
     * @param attribute Nom de l'attribut
     */
    getOriginal(attribute: string): any;
    /**
     * Obtient les attributs modifiés
     */
    getDirty(): ModelAttributes;
    /**
     * Sauvegarde le modèle dans la base de données
     */
    save(): Promise<boolean>;
    /**
     * Supprime le modèle de la base de données
     */
    delete(): Promise<boolean>;
    /**
     * Supprime définitivement le modèle (même avec soft deletes)
     */
    forceDelete(): Promise<boolean>;
    /**
     * Restaure un modèle supprimé avec soft delete
     */
    restore(): Promise<boolean>;
    /**
     * Rafraîchit le modèle depuis la base de données
     */
    refresh(): Promise<this>;
    /**
     * Convertit le modèle en objet
     */
    toObject(): Record<string, any>;
    /**
     * Convertit le modèle en JSON
     */
    toJSON(): Record<string, any>;
    /**
     * Obtient une relation chargée
     * @param relation Nom de la relation
     */
    getRelation<T>(relation: string): T | T[] | null;
    /**
     * Vérifie si une relation est chargée
     * @param relation Nom de la relation
     */
    relationLoaded(relation: string): boolean;
    /**
     * Définit une relation
     * @param relation Nom de la relation
     * @param value Valeur de la relation
     */
    setRelation<T>(relation: string, value: T | T[] | null): this;
}
/**
 * Interface pour les méthodes statiques de modèle
 */
export interface StaticModelMethods<T extends Model> {
    /**
     * Crée une nouvelle instance du modèle
     * @param attributes Attributs initiaux
     */
    make(attributes?: ModelAttributes): T;
    /**
     * Crée et sauvegarde une nouvelle instance du modèle
     * @param attributes Attributs initiaux
     */
    create(attributes?: ModelAttributes): Promise<T>;
    /**
     * Trouve un modèle par sa clé primaire
     * @param id Valeur de la clé primaire
     */
    find(id: any): Promise<T | null>;
    /**
     * Trouve un modèle par sa clé primaire ou lance une exception
     * @param id Valeur de la clé primaire
     */
    findOrFail(id: any): Promise<T>;
    /**
     * Trouve un modèle par un attribut
     * @param attribute Nom de l'attribut
     * @param value Valeur de l'attribut
     */
    findBy(attribute: string, value: any): Promise<T | null>;
    /**
     * Trouve tous les modèles
     */
    all(): Promise<T[]>;
    /**
     * Compte le nombre de modèles
     */
    count(): Promise<number>;
    /**
     * Vérifie si un modèle existe
     * @param id Valeur de la clé primaire
     */
    exists(id: any): Promise<boolean>;
    /**
     * Obtient le premier modèle
     */
    first(): Promise<T | null>;
    /**
     * Obtient le premier modèle ou lance une exception
     */
    firstOrFail(): Promise<T>;
    /**
     * Crée un nouveau query builder
     */
    query(): QueryBuilder<T>;
    /**
     * Applique une condition where
     * @param column Nom de la colonne
     * @param operator Opérateur de comparaison
     * @param value Valeur à comparer
     */
    where(column: string, operator: string | any, value?: any): QueryBuilder<T>;
    /**
     * Applique un ordre
     * @param column Nom de la colonne
     * @param direction Direction du tri (asc ou desc)
     */
    orderBy(column: string, direction?: 'asc' | 'desc'): QueryBuilder<T>;
    /**
     * Limite le nombre de résultats
     * @param limit Nombre maximum de résultats
     */
    limit(limit: number): QueryBuilder<T>;
    /**
     * Décale les résultats
     * @param offset Nombre de résultats à sauter
     */
    offset(offset: number): QueryBuilder<T>;
    /**
     * Inclut les modèles supprimés (soft delete)
     */
    withTrashed(): QueryBuilder<T>;
    /**
     * N'inclut que les modèles supprimés (soft delete)
     */
    onlyTrashed(): QueryBuilder<T>;
}
/**
 * Interface complète pour un modèle
 */
export interface ModelInterface extends ModelMethods, RelationMethods, ModelEvents {
    /**
     * Attributs du modèle
     */
    [key: string]: any;
}
/**
 * Interface pour la classe de modèle
 */
export interface ModelClass<T extends Model> extends StaticModelMethods<T>, StaticRelationMethods {
    new (attributes?: ModelAttributes): T;
    /**
     * Nom de la table
     */
    table: string;
    /**
     * Nom de la clé primaire
     */
    primaryKey: string;
    /**
     * Si le modèle utilise les timestamps
     */
    timestamps: boolean;
    /**
     * Si le modèle utilise les soft deletes
     */
    softDeletes: boolean;
    /**
     * Attributs qui peuvent être assignés en masse
     */
    fillable: string[];
    /**
     * Attributs qui sont protégés contre l'assignation en masse
     */
    guarded: string[];
    /**
     * Attributs qui doivent être cachés lors de la sérialisation
     */
    hidden: string[];
    /**
     * Attributs qui doivent être visibles lors de la sérialisation
     */
    visible: string[];
    /**
     * Attributs qui doivent être convertis en types natifs
     */
    casts: Record<string, string>;
    /**
     * Attributs qui doivent être convertis en dates
     */
    dates: string[];
    /**
     * Relations à charger automatiquement
     */
    withRelations: string[];
}
