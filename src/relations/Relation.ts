/**
 * Classe de base pour toutes les relations
 */
import { Model } from '../core/Model';
import { Query } from '../query/Query';
import { Collection } from '../core/Collection';

export abstract class Relation<T extends Model = Model> {
  protected relatedModel: typeof Model;
  protected parentModel: Model;
  protected query: Query<T>;

  /**
   * Constructeur de la relation
   */
  constructor(relatedModel: typeof Model, parentModel: Model) {
    this.relatedModel = relatedModel;
    this.parentModel = parentModel;
    this.query = new Query<T>(relatedModel, relatedModel.getTable()) as Query<T>;
    this.addConstraints();
  }

  /**
   * Ajouter les contraintes de base à la requête
   */
  protected abstract addConstraints(): void;

  /**
   * Obtenir les résultats de la relation
   */
  public abstract getResults(): Promise<T | Collection<T> | null>;

  /**
   * Obtenir la requête de base pour la relation
   */
  public getQuery(): Query<T> {
    return this.query;
  }

  /**
   * Ajouter des contraintes à la requête
   */
  public where(column: string, operator: any, value?: any): this {
    this.query.where(column, operator, value);
    return this;
  }

  /**
   * Ajouter une clause ORDER BY à la requête
   */
  public orderBy(column: string, direction: 'asc' | 'desc' = 'asc'): this {
    this.query.orderBy(column, direction);
    return this;
  }

  /**
   * Ajouter une clause LIMIT à la requête
   */
  public limit(limit: number): this {
    this.query.limit(limit);
    return this;
  }

  /**
   * Ajouter une clause OFFSET à la requête
   */
  public offset(offset: number): this {
    this.query.offset(offset);
    return this;
  }

  /**
   * Spécifier les relations à charger avec eager loading
   */
  public with(...relations: string[]): this {
    this.query.with(...relations);
    return this;
  }

  /**
   * Exécuter la requête et obtenir tous les résultats
   */
  public async get(): Promise<Collection<T>> {
    return this.query.get();
  }

  /**
   * Exécuter la requête et obtenir le premier résultat
   */
  public async first(): Promise<T | null> {
    return this.query.first();
  }

  /**
   * Compter le nombre de résultats
   */
  public async count(): Promise<number> {
    return this.query.count();
  }

  /**
   * Vérifier si des résultats existent
   */
  public async exists(): Promise<boolean> {
    return this.query.exists();
  }

  /**
   * Charger la relation pour une collection de modèles
   */
  public abstract loadForCollection(collection: Collection, relationName: string): Promise<void>;
}
