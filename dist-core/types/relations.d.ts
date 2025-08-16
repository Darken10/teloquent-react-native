/**
 * Types pour les relations entre modèles
 */
import { Model } from '../model';
import { QueryBuilder } from '../query/query-builder';
/**
 * Interface pour la relation HasOne
 */
export interface HasOneRelation<T extends Model> {
    /**
     * Obtient le premier résultat de la relation
     */
    first(): Promise<T | null>;
    /**
     * Obtient tous les résultats de la relation (normalement un seul pour HasOne)
     */
    get(): Promise<T[]>;
    /**
     * Crée une nouvelle instance liée à cette relation
     * @param attributes Attributs du nouveau modèle
     */
    create(attributes: Record<string, any>): Promise<T>;
    /**
     * Applique des conditions à la requête
     * @param column Nom de la colonne
     * @param operator Opérateur de comparaison
     * @param value Valeur à comparer
     */
    where(column: string, operator: string | any, value?: any): QueryBuilder<T>;
    /**
     * Applique un ordre à la requête
     * @param column Nom de la colonne
     * @param direction Direction du tri (asc ou desc)
     */
    orderBy(column: string, direction?: 'asc' | 'desc'): QueryBuilder<T>;
}
/**
 * Interface pour la relation HasMany
 */
export interface HasManyRelation<T extends Model> {
    /**
     * Obtient le premier résultat de la relation
     */
    first(): Promise<T | null>;
    /**
     * Obtient tous les résultats de la relation
     */
    get(): Promise<T[]>;
    /**
     * Crée une nouvelle instance liée à cette relation
     * @param attributes Attributs du nouveau modèle
     */
    create(attributes: Record<string, any>): Promise<T>;
    /**
     * Applique des conditions à la requête
     * @param column Nom de la colonne
     * @param operator Opérateur de comparaison
     * @param value Valeur à comparer
     */
    where(column: string, operator: string | any, value?: any): QueryBuilder<T>;
    /**
     * Applique un ordre à la requête
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
     * Compte le nombre de résultats
     */
    count(): Promise<number>;
}
/**
 * Interface pour la relation BelongsTo
 */
export interface BelongsToRelation<T extends Model> {
    /**
     * Obtient le premier résultat de la relation
     */
    first(): Promise<T | null>;
    /**
     * Obtient tous les résultats de la relation (normalement un seul pour BelongsTo)
     */
    get(): Promise<T[]>;
    /**
     * Applique des conditions à la requête
     * @param column Nom de la colonne
     * @param operator Opérateur de comparaison
     * @param value Valeur à comparer
     */
    where(column: string, operator: string | any, value?: any): QueryBuilder<T>;
    /**
     * Associe le modèle parent à cette relation
     * @param model Modèle parent ou ID du modèle parent
     */
    associate(model: T | number): Promise<void>;
    /**
     * Dissocie le modèle parent de cette relation
     */
    dissociate(): Promise<void>;
}
/**
 * Interface pour la relation BelongsToMany
 */
export interface BelongsToManyRelation<T extends Model> {
    /**
     * Obtient le premier résultat de la relation
     */
    first(): Promise<T | null>;
    /**
     * Obtient tous les résultats de la relation
     */
    get(): Promise<T[]>;
    /**
     * Applique des conditions à la requête
     * @param column Nom de la colonne
     * @param operator Opérateur de comparaison
     * @param value Valeur à comparer
     */
    where(column: string, operator: string | any, value?: any): QueryBuilder<T>;
    /**
     * Applique un ordre à la requête
     * @param column Nom de la colonne
     * @param direction Direction du tri (asc ou desc)
     */
    orderBy(column: string, direction?: 'asc' | 'desc'): QueryBuilder<T>;
    /**
     * Attache des modèles à cette relation
     * @param ids IDs des modèles à attacher ou objets avec IDs et attributs pivot
     * @param pivotAttributes Attributs supplémentaires pour la table pivot
     */
    attach(ids: number[] | Record<number, Record<string, any>>, pivotAttributes?: Record<string, any>): Promise<void>;
    /**
     * Détache des modèles de cette relation
     * @param ids IDs des modèles à détacher (tous si non spécifié)
     */
    detach(ids?: number[]): Promise<void>;
    /**
     * Synchronise les modèles de cette relation
     * @param ids IDs des modèles à synchroniser
     * @param detaching Si true, détache les modèles qui ne sont pas dans ids
     */
    sync(ids: number[], detaching?: boolean): Promise<void>;
    /**
     * Bascule les modèles de cette relation
     * @param ids IDs des modèles à basculer
     */
    toggle(ids: number[]): Promise<void>;
    /**
     * Inclut les colonnes de la table pivot dans les résultats
     * @param columns Noms des colonnes pivot à inclure
     */
    withPivot(columns: string[]): BelongsToManyRelation<T>;
    /**
     * Applique des conditions sur la table pivot
     * @param column Nom de la colonne pivot
     * @param operator Opérateur de comparaison
     * @param value Valeur à comparer
     */
    wherePivot(column: string, operator: string | any, value?: any): BelongsToManyRelation<T>;
}
/**
 * Type pour les méthodes de relation dans les modèles
 */
export interface RelationMethods {
    /**
     * Définit une relation HasOne
     * @param related Classe du modèle lié
     * @param foreignKey Clé étrangère (par défaut: {this.constructor.name.toLowerCase()}_id)
     * @param localKey Clé locale (par défaut: primaryKey du modèle)
     */
    hasOne<T extends Model>(related: new () => T, foreignKey?: string, localKey?: string): HasOneRelation<T>;
    /**
     * Définit une relation HasMany
     * @param related Classe du modèle lié
     * @param foreignKey Clé étrangère (par défaut: {this.constructor.name.toLowerCase()}_id)
     * @param localKey Clé locale (par défaut: primaryKey du modèle)
     */
    hasMany<T extends Model>(related: new () => T, foreignKey?: string, localKey?: string): HasManyRelation<T>;
    /**
     * Définit une relation BelongsTo
     * @param related Classe du modèle lié
     * @param foreignKey Clé étrangère dans ce modèle (par défaut: {related.name.toLowerCase()}_id)
     * @param ownerKey Clé du propriétaire dans le modèle lié (par défaut: primaryKey du modèle lié)
     */
    belongsTo<T extends Model>(related: new () => T, foreignKey?: string, ownerKey?: string): BelongsToRelation<T>;
    /**
     * Définit une relation BelongsToMany
     * @param related Classe du modèle lié
     * @param table Nom de la table pivot
     * @param foreignPivotKey Clé étrangère pour ce modèle dans la table pivot
     * @param relatedPivotKey Clé étrangère pour le modèle lié dans la table pivot
     * @param parentKey Clé locale de ce modèle
     * @param relatedKey Clé locale du modèle lié
     */
    belongsToMany<T extends Model>(related: new () => T, table?: string, foreignPivotKey?: string, relatedPivotKey?: string, parentKey?: string, relatedKey?: string): BelongsToManyRelation<T>;
}
/**
 * Extension du modèle de base avec les méthodes de relation
 */
export interface ModelWithRelations extends Model, RelationMethods {
}
/**
 * Type pour les méthodes statiques de relation dans les modèles
 */
export interface StaticRelationMethods {
    /**
     * Charge des relations pour une collection de modèles
     * @param models Collection de modèles
     * @param relations Noms des relations à charger
     */
    loadRelations<T extends Model>(models: T[], relations: string | string[]): Promise<T[]>;
    /**
     * Charge des relations pour un modèle
     * @param model Modèle
     * @param relations Noms des relations à charger
     */
    loadRelation<T extends Model>(model: T, relations: string | string[]): Promise<T>;
    /**
     * Inclut des relations dans la requête
     * @param relations Noms des relations à inclure
     */
    with<T extends Model>(this: new () => T, relations: string | string[]): QueryBuilder<T>;
}
/**
 * Extension de la classe de modèle avec les méthodes statiques de relation
 */
export interface ModelClassWithRelations<T extends Model> {
    new (): T;
    with(relations: string | string[]): QueryBuilder<T>;
    loadRelations(models: T[], relations: string | string[]): Promise<T[]>;
    loadRelation(model: T, relations: string | string[]): Promise<T>;
}
