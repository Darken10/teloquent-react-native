import { Query } from '../query/Query';
import { Collection } from './Collection';
import { ModelAttributes, ModelEvent } from '../types';
import { HasOne } from '../relations/HasOne';
import { HasMany } from '../relations/HasMany';
import { BelongsTo } from '../relations/BelongsTo';
import { BelongsToMany } from '../relations/BelongsToMany';
type ModelClass<T extends Model = Model> = {
    new (): T;
    table?: string;
    primaryKey: string;
    timestamps: boolean;
    name: string;
    getTable(): string;
    query(): Query<T>;
    find<U extends Model>(id: string | number): Promise<U | null>;
    create<U extends Model>(attributes: ModelAttributes): Promise<U>;
};
/**
 * Classe Model - La classe de base pour tous les modèles Teloquent
 */
export declare class Model {
    static table?: string;
    static primaryKey: string;
    static timestamps: boolean;
    static dateFormat: string;
    static connection?: string;
    protected attributes: ModelAttributes;
    protected original: ModelAttributes;
    protected changes: ModelAttributes;
    protected relations: Record<string, Model | Collection<Model> | null>;
    protected exists: boolean;
    protected primaryKey: string;
    [key: string]: string | number | boolean | null | undefined | ((...args: unknown[]) => unknown) | object;
    protected casts: Record<string, string>;
    protected hidden: string[];
    protected visible: string[];
    protected appends: string[];
    protected dates: string[];
    protected static globalEventHandlers: Record<ModelEvent, Array<(model: Model) => void | Promise<void>>>;
    /**
     * Constructeur du modèle
     */
    constructor(attributes?: ModelAttributes);
    /**
     * Obtenir le nom de la table pour ce modèle
     */
    static getTable(): string;
    /**
     * Obtenir la clé primaire pour ce modèle
     */
    static getPrimaryKey(): string;
    /**
     * Créer une nouvelle instance de Query pour ce modèle
     */
    static query<T extends Model>(this: ModelClass<T>): Query<T>;
    /**
     * Obtenir tous les enregistrements
     */
    static all<T extends Model>(this: ModelClass<T>): Promise<Collection<T>>;
    /**
     * Trouver un enregistrement par son ID
     */
    static find<T extends Model>(this: ModelClass<T>, id: string | number): Promise<T | null>;
    /**
     * Trouver un enregistrement par sa clé primaire ou échouer
     */
    static findOrFail<T extends Model>(this: ModelClass<T>, id: number | string): Promise<T>;
    /**
     * Créer un nouveau modèle et le sauvegarder dans la base de données
     */
    static create<T extends Model>(this: ModelClass<T>, attributes: ModelAttributes): Promise<T>;
    /**
     * Mettre à jour ou créer un modèle
     */
    static updateOrCreate<T extends Model>(this: ModelClass<T>, attributes: ModelAttributes, values: ModelAttributes): Promise<T>;
    /**
     * Ajouter une clause where à la requête
     */
    static where<T extends Model>(this: ModelClass<T>, column: string, operator: string | number | boolean | null | undefined, value?: string | number | boolean | null | undefined): Query<T>;
    /**
     * Spécifier les relations à charger avec eager loading
     */
    static with<T extends Model>(this: ModelClass<T>, ...relations: string[]): Query<T>;
    /**
     * Remplir le modèle avec des attributs
     */
    fill(attributes: ModelAttributes): this;
    /**
     * Définir un attribut
     */
    setAttribute(key: string, value: string | number | boolean | null | undefined | Date | object | (string | number | boolean | null | undefined | Date | object)[]): this;
    /**
     * Obtenir un attribut
     */
    getAttribute(key: string): string | number | boolean | null | undefined | Date | object | (string | number | boolean | null | undefined | Date | object)[];
    /**
     * Convertir un attribut selon son type défini
     */
    protected castAttribute(key: string, value: unknown): string | number | boolean | null | undefined | Date | object | (string | number | boolean | null | undefined | Date | object)[];
    /**
     * Obtenir la valeur de la clé primaire
     */
    getKey(): string | number | boolean | null | undefined | Date | object | (string | number | boolean | null | undefined | Date | object)[];
    /**
     * Vérifier si le modèle est nouveau (pas encore sauvegardé)
     */
    isNew(): boolean;
    /**
     * Vérifier si le modèle a été modifié
     */
    isDirty(): boolean;
    /**
     * Sauvegarder le modèle dans la base de données
     */
    save(): Promise<boolean>;
    /**
     * Effectuer une insertion dans la base de données
     */
    protected performInsert(): Promise<boolean>;
    /**
     * Effectuer une mise à jour dans la base de données
     */
    protected performUpdate(): Promise<boolean>;
    /**
     * Supprimer le modèle de la base de données
     */
    delete(): Promise<boolean>;
    /**
     * Rafraîchir le modèle depuis la base de données
     */
    refresh(): Promise<this>;
    /**
     * Convertir le modèle en objet JSON
     */
    toJson(): Record<string, string | number | boolean | null | undefined | Date | object | (string | number | boolean | null | undefined | Date | object)[] | Record<string, unknown>>;
    /**
     * Définir une relation hasOne
     */
    protected hasOne<T extends Model>(relatedModel: new () => T, foreignKey?: string, localKey?: string): HasOne<T>;
    /**
     * Définir une relation hasMany
     */
    protected hasMany<T extends Model>(relatedModel: new () => T, foreignKey?: string, localKey?: string): HasMany<T>;
    /**
     * Définir une relation belongsTo
     */
    protected belongsTo<T extends Model>(relatedModel: new () => T, foreignKey?: string, ownerKey?: string): BelongsTo<T>;
    /**
     * Définir une relation belongsToMany
     */
    protected belongsToMany<T extends Model>(relatedModel: new () => T, pivotTable?: string, foreignPivotKey?: string, relatedPivotKey?: string, parentKey?: string, relatedKey?: string): BelongsToMany<T>;
    /**
     * Déclencher un événement de modèle
     */
    protected fireEvent(event: ModelEvent): Promise<void>;
    /**
     * Enregistrer un gestionnaire d'événements global
     */
    static registerGlobalEvent(event: ModelEvent, handler: (model: Model) => void | Promise<void>): void;
    /**
     * Accesseur magique pour les attributs
     */
    get(key: string): string | number | boolean | null | undefined | Date | object | (string | number | boolean | null | undefined | Date | object)[];
    /**
     * Mutateur magique pour les attributs
     */
    set(key: string, value: string | number | boolean | null | undefined | Date | object | (string | number | boolean | null | undefined | Date | object)[]): void;
}
export {};
