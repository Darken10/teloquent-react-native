/**
 * Relation HasOne - Un modèle parent possède un modèle enfant
 */
import { Model } from '../core/Model';
import { Collection } from '../core/Collection';
import { Relation } from './Relation';

export class HasOne<T extends Model = Model> extends Relation<T> {
  protected foreignKey: string;
  protected localKey: string;

  /**
   * Constructeur de la relation HasOne
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
  public async getResults(): Promise<T | null> {
    return this.first();
  }

  /**
   * Charger la relation pour une collection de modèles
   */
  public async loadForCollection(collection: Collection, relationName: string): Promise<void> {
    if (collection.isEmpty()) {
      return;
    }

    // Obtenir toutes les clés parentes
    const parentKeys = collection.pluck(this.localKey);
    
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
    
    // Indexer les résultats par clé étrangère
    const dictionary = results.keyBy(model => model.getAttribute(this.foreignKey));
    
    // Associer les résultats aux modèles parents
    collection.each(model => {
      const key = model.getAttribute(this.localKey);
      const relation = dictionary[key] || null;
      model.relations[relationName.split('.')[0]] = relation;
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
}
