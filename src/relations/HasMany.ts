/**
 * Relation HasMany - Un modèle parent possède plusieurs modèles enfants
 */
import { Model } from '../core/Model';
import { Collection } from '../core/Collection';
import { Relation } from './Relation';

export class HasMany<T extends Model = Model> extends Relation<T> {
  protected foreignKey: string;
  protected localKey: string;

  /**
   * Constructeur de la relation HasMany
   */
  constructor(
    relatedModel: typeof Model,
    parentModel: Model,
    foreignKey: string,
    localKey: string
  ) {
    super(relatedModel, parentModel);
    this.foreignKey = foreignKey;
    this.localKey = localKey;
  }

  /**
   * Ajouter les contraintes de base à la requête
   */
  protected addConstraints(): void {
    this.query.where(this.foreignKey, this.parentModel.getAttribute(this.localKey));
  }

  /**
   * Obtenir les résultats de la relation
   */
  public async getResults(): Promise<Collection<T>> {
    return this.get();
  }

  /**
   * Charger la relation pour une collection de modèles
   */
  public async loadForCollection(collection: Collection, relationName: string): Promise<void> {
    if (collection.isEmpty()) {
      return;
    }

    // Obtenir toutes les clés parentes
    const parentKeys = collection.pluck(this.localKey) as (string | number)[];
    
    // Créer une nouvelle requête sans les contraintes précédentes
    const query = new (this.query.constructor as any)(this.relatedModel, this.relatedModel.getTable());
    
    // Ajouter la contrainte pour charger tous les modèles liés
    query.whereIn(this.foreignKey, parentKeys);
    
    // Charger les relations imbriquées si nécessaire
    const nestedRelations = this.getNestedRelations(relationName);
    if (nestedRelations.length > 0) {
      query.with(...nestedRelations);
    }
    
    // Exécuter la requête
    const results = await query.get();
    
    // Grouper les résultats par clé étrangère
    const dictionary: Record<string, T[]> = {};
    
    results.each((model: T) => {
      const key = String(model.getAttribute(this.foreignKey));
      
      if (!dictionary[key]) {
        dictionary[key] = [];
      }
      
      dictionary[key].push(model);
    });
    
    // Associer les résultats aux modèles parents
    collection.each((model: Model) => {
      const key = String(model.getAttribute(this.localKey));
      const relationModels = dictionary[key] || [];
      const baseName = relationName.split('.')[0];
      model.setRelation(baseName, new Collection<T>(relationModels));
    });
  }

  /**
   * Obtenir les relations imbriquées
   */
  protected getNestedRelations(relationName: string): string[] {
    const parts = relationName.split('.');
    
    // Si la relation n'a pas de parties imbriquées, retourner un tableau vide
    if (parts.length === 1) {
      return [];
    }
    
    // Supprimer la première partie et joindre le reste
    parts.shift();
    return [parts.join('.')];
  }

  /**
   * Créer un nouveau modèle lié et l'associer au parent
   */
  public async create(attributes: Record<string, any> = {}): Promise<T> {
    // Ajouter la clé étrangère aux attributs
    attributes[this.foreignKey] = this.parentModel.getAttribute(this.localKey);
    
    // Créer le nouveau modèle
    const instance = new this.relatedModel() as T;
    instance.fill(attributes);
    await instance.save();
    
    return instance;
  }

  /**
   * Sauvegarder un modèle existant et l'associer au parent
   */
  public async save(model: T): Promise<T> {
    model.setAttribute(this.foreignKey, this.parentModel.getAttribute(this.localKey));
    await model.save();
    return model;
  }
}
