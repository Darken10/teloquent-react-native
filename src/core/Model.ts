/**
 * Classe Model - La classe de base pour tous les modèles Teloquent
 */
import { DB } from './DB';
import { Query } from './Query';
import { Collection } from './Collection';
import { ModelAttributes, ModelEvent } from '../types';
import pluralize from 'pluralize';
import { singularize } from '../utils/inflector';
import { HasOne } from '../relations/HasOne';
import { HasMany } from '../relations/HasMany';
import { BelongsTo } from '../relations/BelongsTo';
import { BelongsToMany } from '../relations/BelongsToMany';

// Définition des types pour les méthodes statiques
type ModelClass<T extends Model = Model> = {
  new(): T;
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
export class Model {
  // Propriétés statiques pour la configuration du modèle
  public static table?: string;
  public static primaryKey: string = 'id';
  public static timestamps: boolean = true;
  public static dateFormat: string = 'YYYY-MM-DD HH:mm:ss';
  public static connection?: string;

  // Propriétés d'instance
  protected attributes: ModelAttributes = {};
  protected original: ModelAttributes = {};
  protected changes: ModelAttributes = {};
  protected relations: Record<string, Model | Collection<Model> | null> = {};
  protected exists: boolean = false;
  protected primaryKey: string = 'id';
  
  // Permettre l'accès aux attributs comme des propriétés
  [key: string]: string | number | boolean | null | undefined | ((...args: unknown[]) => unknown) | object;

  protected casts: Record<string, string> = {};
  protected hidden: string[] = [];
  protected visible: string[] = [];
  protected appends: string[] = [];
  protected dates: string[] = [];

  // Hooks d'événements
  protected static globalEventHandlers: Record<ModelEvent, Array<(model: Model) => void | Promise<void>>> = {
    creating: [],
    created: [],
    updating: [],
    updated: [],
    saving: [],
    saved: [],
    deleting: [],
    deleted: []
  };

  /**
   * Constructeur du modèle
   */
  constructor(attributes: ModelAttributes = {}) {
    this.fill(attributes);
  }
  
  /**
   * Définir une relation chargée sur le modèle
   */
  public setRelation(name: string, value: Model | Collection<Model> | null): void {
    this.relations[name] = value as any;
  }

  /**
   * Définir l'état d'existence du modèle (persisté en base)
   */
  public setExists(value: boolean): void {
    this.exists = value;
  }

  /**
   * Supprimer un attribut de manière sûre
   */
  public unsetAttribute(key: string): void {
    if (key in this.attributes) {
      delete this.attributes[key];
    }
    if (key in this.changes) {
      delete this.changes[key];
    }
  }

  /**
   * Obtenir le nom de la table pour ce modèle
   */
  public static getTable(): string {
    if (this.table) {
      return this.table;
    }
    
    // Par défaut, utiliser le nom de la classe au pluriel et en minuscules
    return pluralize(this.name.toLowerCase());
  }

  /**
   * Obtenir la clé primaire pour ce modèle
   */
  public static getPrimaryKey(): string {
    return this.primaryKey;
  }

  // La méthode getTable est déjà définie plus haut

  /**
   * Créer une nouvelle instance de Query pour ce modèle
   */
  public static query<T extends Model>(this: ModelClass<T>): Query<T> {
    const modelClass = this as unknown as typeof Model;
    const table = this.getTable();
    return new Query<T>(modelClass, table);
  }

  /**
   * Obtenir tous les enregistrements
   */
  public static async all<T extends Model>(this: ModelClass<T>): Promise<Collection<T>> {
    const query = this.query();
    return query.get();
  }

  /**
   * Trouver un enregistrement par son ID
   */
  public static async find<T extends Model>(this: ModelClass<T>, id: string | number): Promise<T | null> {
    const query = this.query();
    return query.find(id);
  }

  /**
   * Trouver un enregistrement par sa clé primaire ou échouer
   */
  public static async findOrFail<T extends Model>(this: ModelClass<T>, id: number | string): Promise<T> {
    const model = await this.find<T>(id);
    
    if (!model) {
      throw new Error(`Modèle ${this.name} non trouvé avec l'ID ${id}`);
    }
    
    return model;
  }

  /**
   * Créer un nouveau modèle et le sauvegarder dans la base de données
   */
  public static async create<T extends Model>(this: ModelClass<T>, attributes: ModelAttributes): Promise<T> {
    const model = new this();
    model.fill(attributes);
    await model.save();
    return model as T;
  }

  /**
   * Mettre à jour ou créer un modèle
   */
  public static async updateOrCreate<T extends Model>(
    this: ModelClass<T>,
    attributes: ModelAttributes,
    values: ModelAttributes
  ): Promise<T> {
    const query = this.query();
    
    // Ajouter les conditions de recherche
    Object.entries(attributes).forEach(([key, value]) => {
      // S'assurer que la valeur est compatible avec le type attendu par where
      query.where(key, value as string | number | boolean | null | undefined);
    });
    
    // Chercher le modèle existant
    const model = await query.first();
    
    if (model) {
      // Mettre à jour le modèle existant
      model.fill(values);
      await model.save();
      return model;
    } else {
      // Créer un nouveau modèle
      return this.create<T>({ ...attributes, ...values });
    }
  }

  /**
   * Ajouter une clause where à la requête
   */
  public static where<T extends Model>(
    this: ModelClass<T>,
    column: string,
    operator: string | number | boolean | null | undefined,
    value?: string | number | boolean | null | undefined
  ): Query<T> {
    const query = this.query();
    return query.where(column, operator, value);
  }

  /**
   * Spécifier les relations à charger avec eager loading
   */
  public static with<T extends Model>(
    this: ModelClass<T>,
    ...relations: string[]
  ): Query<T> {
    const query = this.query();
    return query.with(...relations);
  }

  /**
   * Remplir le modèle avec des attributs
   */
  public fill(attributes: ModelAttributes): this {
    Object.entries(attributes).forEach(([key, value]) => {
      this.setAttribute(key, value);
    });
    
    return this;
  }

  /**
   * Définir un attribut
   */
  public setAttribute(key: string, value: string | number | boolean | null | undefined | Date | object | (string | number | boolean | null | undefined | Date | object)[]): this {
    // Appliquer les conversions de type si nécessaire
    if (this.casts[key]) {
      value = this.castAttribute(key, value);
    }
    
    this.attributes[key] = value;
    this.changes[key] = value;
    
    return this;
  }

  /**
   * Obtenir un attribut
   */
  public getAttribute(key: string): string | number | boolean | null | undefined | Date | object | (string | number | boolean | null | undefined | Date | object)[] {
    // Vérifier si l'attribut existe
    if (this.attributes[key] !== undefined) {
      return this.attributes[key];
    }
    
    // Vérifier si c'est une relation chargée
    if (this.relations[key] !== undefined) {
      return this.relations[key];
    }
    
    // Vérifier s'il y a un accesseur pour cet attribut
    const accessor = `get${key.charAt(0).toUpperCase() + key.slice(1)}Attribute`;
    const fn = (this as any)[accessor];
    if (typeof fn === 'function') {
      return fn.call(this);
    }
    
    return undefined;
  }

  /**
   * Convertir un attribut selon son type défini
   */
  protected castAttribute(key: string, value: unknown): string | number | boolean | null | undefined | Date | object | (string | number | boolean | null | undefined | Date | object)[] {
    const type = this.casts[key];
    
    if (value === null) {
      return null;
    }
    
    switch (type) {
      case 'int':
      case 'integer':
        return typeof value === 'string' || typeof value === 'number' ? parseInt(String(value), 10) : 0;
      case 'float':
      case 'double':
        return typeof value === 'string' || typeof value === 'number' ? parseFloat(String(value)) : 0;
      case 'bool':
      case 'boolean':
        return Boolean(value);
      case 'string':
        return String(value);
      case 'array':
        if (Array.isArray(value)) return value;
        return typeof value === 'string' ? JSON.parse(value) : [];
      case 'object':
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) return value;
        return typeof value === 'string' ? JSON.parse(value) : {};
      case 'date':
        if (value instanceof Date) return value;
        return typeof value === 'string' || typeof value === 'number' ? new Date(value) : new Date();
      default:
        return value;
    }
  }

  /**
   * Obtenir la valeur de la clé primaire
   */
  public getKey(): string | number | boolean | null | undefined | Date | object | (string | number | boolean | null | undefined | Date | object)[] {
    const key = (this.constructor as typeof Model).getPrimaryKey();
    return this.getAttribute(key);
  }

  /**
   * Vérifier si le modèle est nouveau (pas encore sauvegardé)
   */
  public isNew(): boolean {
    return !this.exists;
  }

  /**
   * Vérifier si le modèle a été modifié
   */
  public isDirty(): boolean {
    return Object.keys(this.changes).length > 0;
  }

  /**
   * Sauvegarder le modèle dans la base de données
   */
  public async save(): Promise<boolean> {
    // Déclencher l'événement saving
    await this.fireEvent('saving');
    
    // Si le modèle existe déjà, mettre à jour, sinon insérer
    const result = this.exists ? await this.performUpdate() : await this.performInsert();
    
    // Réinitialiser les changements
    this.changes = {};
    
    // Déclencher l'événement saved
    await this.fireEvent('saved');
    
    return result;
  }

  /**
   * Effectuer une insertion dans la base de données
   */
  protected async performInsert(): Promise<boolean> {
    const modelClass = this.constructor as typeof Model;
    const table = modelClass.getTable();
    
    // Ajouter les timestamps si nécessaire
    if (modelClass.timestamps) {
      const now = new Date().toISOString();
      this.setAttribute('created_at', now);
      this.setAttribute('updated_at', now);
    }
    
    // Déclencher l'événement creating
    await this.fireEvent('creating');
    
    // Insérer dans la base de données
    const insertId = await DB.insert(table, this.attributes);
    
    // Définir la clé primaire et marquer comme existant
    const primaryKey = modelClass.getPrimaryKey();
    if (!this.getAttribute(primaryKey)) {
      this.setAttribute(primaryKey, insertId);
    }
    this.exists = true;
    
    // Mettre à jour les attributs originaux
    this.original = { ...this.attributes };
    
    // Déclencher l'événement created
    await this.fireEvent('created');
    
    return true;
  }

  /**
   * Effectuer une mise à jour dans la base de données
   */
  protected async performUpdate(): Promise<boolean> {
    // Si rien n'a changé, retourner true sans rien faire
    if (!this.isDirty()) {
      return true;
    }
    
    const modelClass = this.constructor as typeof Model;
    const table = modelClass.getTable();
    const primaryKey = modelClass.getPrimaryKey();
    
    // Ajouter le timestamp de mise à jour si nécessaire
    if (modelClass.timestamps) {
      this.setAttribute('updated_at', new Date().toISOString());
    }
    
    // Déclencher l'événement updating
    await this.fireEvent('updating');
    
    // Mettre à jour dans la base de données
    const rowsAffected = await DB.update(
      table,
      this.changes,
      `${primaryKey} = ?`,
      [this.getKey()]
    );
    
    // Mettre à jour les attributs originaux
    this.original = { ...this.attributes };
    
    // Déclencher l'événement updated
    await this.fireEvent('updated');
    
    return rowsAffected > 0;
  }

  /**
   * Supprimer le modèle de la base de données
   */
  public async delete(): Promise<boolean> {
    if (!this.exists) {
      return false;
    }
    
    const modelClass = this.constructor as typeof Model;
    const table = modelClass.getTable();
    const primaryKey = modelClass.getPrimaryKey();
    
    // Déclencher l'événement deleting
    await this.fireEvent('deleting');
    
    // Supprimer de la base de données
    const rowsAffected = await DB.delete(
      table,
      `${primaryKey} = ?`,
      [this.getKey()]
    );
    
    if (rowsAffected > 0) {
      this.exists = false;
      
      // Déclencher l'événement deleted
      await this.fireEvent('deleted');
      
      return true;
    }
    
    return false;
  }

  /**
   * Rafraîchir le modèle depuis la base de données
   */
  public async refresh(): Promise<this> {
    if (!this.exists) {
      return this;
    }
    
    const modelClass = this.constructor as typeof Model;
    const key = this.getKey();
    // Vérifier que la clé est bien une chaîne ou un nombre
    const validKey = typeof key === 'string' || typeof key === 'number' ? key : null;
    const freshModel = validKey !== null ? await modelClass.find(validKey) : null;
    
    if (freshModel) {
      this.attributes = { ...freshModel.attributes };
      this.original = { ...freshModel.attributes };
      this.changes = {};
      this.relations = {};
    }
    
    return this;
  }

  /**
   * Convertir le modèle en objet JSON
   */
  public toJson(): Record<string, string | number | boolean | null | undefined | Date | object | (string | number | boolean | null | undefined | Date | object)[] | Record<string, unknown>> {
    const json: Record<string, string | number | boolean | null | undefined | Date | object | (string | number | boolean | null | undefined | Date | object)[] | Record<string, unknown>> = {};
    
    // Déterminer quels attributs inclure
    const attributes = this.visible.length > 0
      ? this.visible
      : Object.keys(this.attributes).filter(key => !this.hidden.includes(key));
    
    // Ajouter les attributs
    attributes.forEach(key => {
      json[key] = this.getAttribute(key);
    });
    
    // Ajouter les attributs calculés
    this.appends.forEach(key => {
      json[key] = this.getAttribute(key);
    });
    
    // Ajouter les relations
    Object.entries(this.relations).forEach(([key, relation]) => {
      if (relation instanceof Model) {
        json[key] = relation.toJson();
      } else if (relation instanceof Collection) {
        json[key] = relation.toJson();
      }
    });
    
    return json;
  }

  /**
   * Définir une relation hasOne
   */
  protected hasOne<T extends Model>(
    relatedModel: new () => T,
    foreignKey?: string,
    localKey?: string
  ): HasOne<T> {
    const modelClass = this.constructor as typeof Model;
    
    // Déterminer les clés par défaut si non spécifiées
    if (!foreignKey) {
      foreignKey = `${singularize(modelClass.name.toLowerCase())}_id`;
    }
    
    if (!localKey) {
      localKey = modelClass.getPrimaryKey();
    }
    
    return new HasOne<T>(
      relatedModel as unknown as typeof Model,
      this,
      foreignKey,
      localKey
    );
  }

  /**
   * Définir une relation hasMany
   */
  protected hasMany<T extends Model>(
    relatedModel: new () => T,
    foreignKey?: string,
    localKey?: string
  ): HasMany<T> {
    const modelClass = this.constructor as typeof Model;
    
    // Déterminer les clés par défaut si non spécifiées
    if (!foreignKey) {
      foreignKey = `${singularize(modelClass.name.toLowerCase())}_id`;
    }
    
    if (!localKey) {
      localKey = modelClass.getPrimaryKey();
    }
    
    return new HasMany<T>(
      relatedModel as unknown as typeof Model,
      this,
      foreignKey,
      localKey
    );
  }

  /**
   * Définir une relation belongsTo
   */
  protected belongsTo<T extends Model>(
    relatedModel: new () => T,
    foreignKey?: string,
    ownerKey?: string
  ): BelongsTo<T> {
    // Déterminer les clés par défaut si non spécifiées
    if (!foreignKey) {
      foreignKey = `${singularize(relatedModel.name.toLowerCase())}_id`;
    }
    
    if (!ownerKey) {
      ownerKey = (relatedModel as unknown as typeof Model).getPrimaryKey();
    }
    
    return new BelongsTo<T>(
      relatedModel as unknown as typeof Model,
      this,
      foreignKey,
      ownerKey
    );
  }

  /**
   * Définir une relation belongsToMany
   */
  protected belongsToMany<T extends Model>(
    relatedModel: new () => T,
    pivotTable?: string,
    foreignPivotKey?: string,
    relatedPivotKey?: string,
    parentKey?: string,
    relatedKey?: string
  ): BelongsToMany<T> {
    const modelClass = this.constructor as typeof Model;
    
    // Déterminer les noms par défaut si non spécifiés
    if (!pivotTable) {
      const models = [
        singularize(modelClass.name.toLowerCase()),
        singularize(relatedModel.name.toLowerCase())
      ].sort();
      pivotTable = `${models[0]}_${models[1]}`;
    }
    
    if (!foreignPivotKey) {
      foreignPivotKey = `${singularize(modelClass.name.toLowerCase())}_id`;
    }
    
    if (!relatedPivotKey) {
      relatedPivotKey = `${singularize(relatedModel.name.toLowerCase())}_id`;
    }
    
    if (!parentKey) {
      parentKey = modelClass.getPrimaryKey();
    }
    
    if (!relatedKey) {
      relatedKey = (relatedModel as unknown as typeof Model).getPrimaryKey();
    }
    
    return new BelongsToMany<T>(
      relatedModel as unknown as typeof Model,
      this,
      pivotTable,
      foreignPivotKey,
      relatedPivotKey,
      parentKey,
      relatedKey
    );
  }

  /**
   * Déclencher un événement de modèle
   */
  protected async fireEvent(event: ModelEvent): Promise<void> {
    const handlers = (this.constructor as typeof Model).globalEventHandlers[event] || [];
    
    for (const handler of handlers) {
      await handler(this);
    }
  }

  /**
   * Enregistrer un gestionnaire d'événements global
   */
  public static registerGlobalEvent(event: ModelEvent, handler: (model: Model) => void | Promise<void>): void {
    if (!this.globalEventHandlers[event]) {
      this.globalEventHandlers[event] = [];
    }
    
    this.globalEventHandlers[event].push(handler);
  }

  /**
   * Accesseur magique pour les attributs
   */
  public get(key: string): string | number | boolean | null | undefined | Date | object | (string | number | boolean | null | undefined | Date | object)[] {
    return this.getAttribute(key);
  }

  /**
   * Mutateur magique pour les attributs
   */
  public set(key: string, value: string | number | boolean | null | undefined | Date | object | (string | number | boolean | null | undefined | Date | object)[]): void {
    this.setAttribute(key, value);
  }
}
