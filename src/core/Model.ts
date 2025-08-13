/**
 * Classe Model - La classe de base pour tous les modèles Teloquent
 */
import { DB } from './DB';
import { Query } from './Query';
import { Collection } from './Collection';
import { ModelAttributes, ModelOptions, ModelEvent } from '../types';
import { pluralize, singularize } from '../utils/inflector';
import { HasOne } from '../relations/HasOne';
import { HasMany } from '../relations/HasMany';
import { BelongsTo } from '../relations/BelongsTo';
import { BelongsToMany } from '../relations/BelongsToMany';

export class Model {
  // Propriétés statiques pour la configuration du modèle
  public static table?: string;
  public static primaryKey: string = 'id';
  public static timestamps: boolean = true;
  public static dateFormat: string = 'YYYY-MM-DD HH:mm:ss';
  public static connection?: string;

  // Propriétés d'instance
  public exists: boolean = false;
  protected attributes: ModelAttributes = {};
  protected original: ModelAttributes = {};
  protected changes: ModelAttributes = {};
  protected relations: Record<string, Model | Collection<Model>> = {};
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

  /**
   * Créer une nouvelle instance de Query pour ce modèle
   */
  public static query(): Query {
    return new Query(this, this.getTable());
  }

  /**
   * Obtenir tous les enregistrements
   */
  public static async all<T extends Model>(this: new () => T): Promise<Collection<T>> {
    return this.query().get() as Promise<Collection<T>>;
  }

  /**
   * Trouver un enregistrement par sa clé primaire
   */
  public static async find<T extends Model>(this: new () => T, id: number | string): Promise<T | null> {
    return this.query().find(id) as Promise<T | null>;
  }

  /**
   * Trouver un enregistrement par sa clé primaire ou échouer
   */
  public static async findOrFail<T extends Model>(this: new () => T, id: number | string): Promise<T> {
    const model = await this.find<T>(id);
    
    if (!model) {
      throw new Error(`Modèle ${this.name} non trouvé avec l'ID ${id}`);
    }
    
    return model;
  }

  /**
   * Créer un nouveau modèle et le sauvegarder dans la base de données
   */
  public static async create<T extends Model>(this: new () => T, attributes: ModelAttributes): Promise<T> {
    const model = new this();
    model.fill(attributes);
    await model.save();
    return model as T;
  }

  /**
   * Mettre à jour ou créer un modèle
   */
  public static async updateOrCreate<T extends Model>(
    this: new () => T,
    attributes: ModelAttributes,
    values: ModelAttributes
  ): Promise<T> {
    const query = this.query();
    
    // Ajouter les conditions de recherche
    Object.entries(attributes).forEach(([key, value]) => {
      query.where(key, value);
    });
    
    // Chercher le modèle existant
    const model = await query.first() as T | null;
    
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
    this: new () => T,
    column: string,
    operator: any,
    value?: any
  ): Query<T> {
    return this.query().where(column, operator, value) as Query<T>;
  }

  /**
   * Spécifier les relations à charger avec eager loading
   */
  public static with<T extends Model>(
    this: new () => T,
    ...relations: string[]
  ): Query<T> {
    return this.query().with(...relations) as Query<T>;
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
  public setAttribute(key: string, value: any): this {
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
  public getAttribute(key: string): any {
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
    if (typeof this[accessor] === 'function') {
      return this[accessor]();
    }
    
    return undefined;
  }

  /**
   * Convertir un attribut selon son type défini
   */
  protected castAttribute(key: string, value: any): any {
    const type = this.casts[key];
    
    if (value === null) {
      return null;
    }
    
    switch (type) {
      case 'int':
      case 'integer':
        return parseInt(value, 10);
      case 'float':
      case 'double':
        return parseFloat(value);
      case 'bool':
      case 'boolean':
        return Boolean(value);
      case 'string':
        return String(value);
      case 'array':
        return typeof value === 'string' ? JSON.parse(value) : value;
      case 'object':
        return typeof value === 'string' ? JSON.parse(value) : value;
      case 'date':
        return new Date(value);
      default:
        return value;
    }
  }

  /**
   * Obtenir la valeur de la clé primaire
   */
  public getKey(): any {
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
    const freshModel = await modelClass.find(this.getKey());
    
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
  public toJson(): Record<string, any> {
    const json: Record<string, any> = {};
    
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
      new relatedModel().constructor as typeof Model,
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
      new relatedModel().constructor as typeof Model,
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
      ownerKey = (new relatedModel().constructor as typeof Model).getPrimaryKey();
    }
    
    return new BelongsTo<T>(
      new relatedModel().constructor as typeof Model,
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
      relatedKey = (new relatedModel().constructor as typeof Model).getPrimaryKey();
    }
    
    return new BelongsToMany<T>(
      new relatedModel().constructor as typeof Model,
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
  public get(key: string): any {
    return this.getAttribute(key);
  }

  /**
   * Mutateur magique pour les attributs
   */
  public set(key: string, value: any): void {
    this.setAttribute(key, value);
  }
}
