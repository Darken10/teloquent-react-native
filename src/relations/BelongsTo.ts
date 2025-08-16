/**
 * Relation BelongsTo - Un modèle enfant appartient à un modèle parent
 */
import { Model } from '../core/Model';
import { Collection } from '../core/Collection';
import { Relation } from './Relation';

export class BelongsTo<T extends Model = Model> extends Relation<T> {
  protected foreignKey: string;
  protected ownerKey: string;

  /**
   * Constructeur de la relation BelongsTo
   */
  constructor(
    relatedModel: typeof Model,
    parentModel: Model,
    foreignKey: string,
    ownerKey: string
  ) {
    super(relatedModel, parentModel);
    this.foreignKey = foreignKey;
    this.ownerKey = ownerKey;
  }

  /**
   * Ajouter les contraintes de base à la requête
   */
  protected addConstraints(): void {
    const foreignKeyValue = this.parentModel.getAttribute(this.foreignKey);
    
    // Ne pas ajouter de contrainte si la clé étrangère est null
    if (foreignKeyValue !== null && foreignKeyValue !== undefined) {
      this.query.where(this.ownerKey, foreignKeyValue);
    }
  }

  /**
   * Obtenir les résultats de la relation
   */
  public async getResults(): Promise<T | null> {
    const foreignKeyValue = this.parentModel.getAttribute(this.foreignKey);
    
    if (foreignKeyValue === null || foreignKeyValue === undefined) {
      return null;
    }
    
    return this.first();
  }

  /**
   * Associer un modèle à la relation
   */
  public async associate(model: T): Promise<Model> {
    this.parentModel.setAttribute(this.foreignKey, model.getAttribute(this.ownerKey));
    await this.parentModel.save();
    return this.parentModel;
  }

  /**
   * Dissocier le modèle de la relation
   */
  public async dissociate(): Promise<Model> {
    this.parentModel.setAttribute(this.foreignKey, null);
    await this.parentModel.save();
    return this.parentModel;
  }

  /**
   * Charger la relation pour une collection de modèles
   */
  public async loadForCollection(collection: Collection, relationName: string): Promise<void> {
    if (collection.isEmpty()) {
      return;
    }

    // Obtenir toutes les clés étrangères uniques
    const foreignKeys = collection
      .pluck(this.foreignKey)
      .filter(key => key !== null && key !== undefined);
    
    // Si aucune clé étrangère valide n'est trouvée, retourner
    if (foreignKeys.length === 0) {
      return;
    }
    
    // Créer une nouvelle requête sans les contraintes précédentes
    const query = new (this.query.constructor as any)(this.relatedModel, this.relatedModel.getTable());
    
    // Ajouter la contrainte pour charger tous les modèles liés
    query.whereIn(this.ownerKey, foreignKeys);
    
    // Charger les relations imbriquées si nécessaire
    const nestedRelations = this.getNestedRelations(relationName);
    if (nestedRelations.length > 0) {
      query.with(...nestedRelations);
    }
    
    // Exécuter la requête
    const results = await query.get();
    
    // Indexer les résultats par clé primaire (clé en string)
    const dictionary = results.keyBy((m: T) => String(m.getAttribute(this.ownerKey)));
    
    // Associer les résultats aux modèles parents
    collection.each((model: Model) => {
      const key = model.getAttribute(this.foreignKey);
      const relation = key !== null && key !== undefined ? dictionary[String(key)] ?? null : null;
      const baseName = relationName.split('.')[0];
      model.setRelation(baseName, relation);
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
