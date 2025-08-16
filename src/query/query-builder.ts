/**
 * Classe QueryBuilder - Constructeur de requêtes SQL
 */
import { Model } from '../core/Model';
import { WhereCondition, OrderByClause } from '../types';
import { Collection } from '../core/Collection';

/**
 * Interface pour le constructeur de requêtes
 */
export class QueryBuilder<T extends Model> {
  /**
   * Table cible de la requête
   */
  protected table: string;

  /**
   * Conditions WHERE de la requête
   */
  protected wheres: WhereCondition[] = [];

  /**
   * Clauses ORDER BY de la requête
   */
  protected orders: OrderByClause[] = [];

  /**
   * Limite de résultats
   */
  protected limitValue: number | null = null;

  /**
   * Décalage des résultats
   */
  protected offsetValue: number | null = null;

  /**
   * Colonnes à sélectionner
   */
  protected columns: string[] = ['*'];

  /**
   * Jointures de la requête
   */
  protected joins: any[] = [];

  /**
   * Groupements de la requête
   */
  protected groups: string[] = [];

  /**
   * Conditions HAVING de la requête
   */
  protected havings: any[] = [];

  /**
   * Classe du modèle associé
   */
  protected model: new () => T;

  /**
   * Constructeur
   * @param table Nom de la table
   * @param model Classe du modèle associé
   */
  constructor(table: string, model: new () => T) {
    this.table = table;
    this.model = model;
  }

  /**
   * Ajoute une condition WHERE à la requête
   * @param column Nom de la colonne
   * @param operator Opérateur de comparaison
   * @param value Valeur à comparer
   */
  where(column: string, operator: string | any, value?: any): this {
    // Si seulement 2 arguments sont fournis, utiliser '=' comme opérateur
    if (value === undefined) {
      value = operator;
      operator = '=';
    }

    this.wheres.push({
      column,
      operator,
      value,
      boolean: 'and'
    });

    return this;
  }

  /**
   * Ajoute une condition WHERE OR à la requête
   * @param column Nom de la colonne
   * @param operator Opérateur de comparaison
   * @param value Valeur à comparer
   */
  orWhere(column: string, operator: string | any, value?: any): this {
    // Si seulement 2 arguments sont fournis, utiliser '=' comme opérateur
    if (value === undefined) {
      value = operator;
      operator = '=';
    }

    this.wheres.push({
      column,
      operator,
      value,
      boolean: 'or'
    });

    return this;
  }

  /**
   * Ajoute une clause ORDER BY à la requête
   * @param column Nom de la colonne
   * @param direction Direction du tri (asc ou desc)
   */
  orderBy(column: string, direction: 'asc' | 'desc' = 'asc'): this {
    this.orders.push({
      column,
      direction
    });

    return this;
  }

  /**
   * Limite le nombre de résultats
   * @param limit Nombre maximum de résultats
   */
  limit(limit: number): this {
    this.limitValue = limit;
    return this;
  }

  /**
   * Décale les résultats
   * @param offset Nombre de résultats à sauter
   */
  offset(offset: number): this {
    this.offsetValue = offset;
    return this;
  }

  /**
   * Spécifie les colonnes à sélectionner
   * @param columns Colonnes à sélectionner
   */
  select(...columns: string[]): this {
    this.columns = columns.length > 0 ? columns : ['*'];
    return this;
  }

  /**
   * Ajoute une jointure à la requête
   * @param table Table à joindre
   * @param first Première colonne de la condition de jointure
   * @param operator Opérateur de comparaison
   * @param second Seconde colonne de la condition de jointure
   * @param type Type de jointure (inner, left, right, etc.)
   */
  join(table: string, first: string, operator: string, second: string, type: string = 'inner'): this {
    this.joins.push({
      table,
      first,
      operator,
      second,
      type
    });

    return this;
  }

  /**
   * Ajoute une jointure LEFT à la requête
   * @param table Table à joindre
   * @param first Première colonne de la condition de jointure
   * @param operator Opérateur de comparaison
   * @param second Seconde colonne de la condition de jointure
   */
  leftJoin(table: string, first: string, operator: string, second: string): this {
    return this.join(table, first, operator, second, 'left');
  }

  /**
   * Ajoute une clause GROUP BY à la requête
   * @param columns Colonnes pour le groupement
   */
  groupBy(...columns: string[]): this {
    this.groups = [...this.groups, ...columns];
    return this;
  }

  /**
   * Ajoute une condition HAVING à la requête
   * @param column Nom de la colonne
   * @param operator Opérateur de comparaison
   * @param value Valeur à comparer
   */
  having(column: string, operator: string | any, value?: any): this {
    // Si seulement 2 arguments sont fournis, utiliser '=' comme opérateur
    if (value === undefined) {
      value = operator;
      operator = '=';
    }

    this.havings.push({
      column,
      operator,
      value,
      boolean: 'and'
    });

    return this;
  }

  /**
   * Récupère le premier résultat de la requête
   */
  async first(): Promise<T | null> {
    const results = await this.limit(1).get();
    return results.first() || null;
  }

  /**
   * Récupère le premier résultat de la requête ou lance une exception
   */
  async firstOrFail(): Promise<T> {
    const model = await this.first();
    if (!model) {
      throw new Error('Model not found');
    }
    return model;
  }

  /**
   * Récupère tous les résultats de la requête
   */
  async get(): Promise<Collection<T>> {
    // Cette méthode serait implémentée dans la classe concrète
    // Ici, nous retournons juste une Collection vide pour la déclaration de type
    return new Collection<T>([]);
  }

  /**
   * Compte le nombre de résultats
   */
  async count(): Promise<number> {
    // Cette méthode serait implémentée dans la classe concrète
    return 0;
  }

  /**
   * Insère un nouvel enregistrement
   * @param values Valeurs à insérer
   */
  async insert(values: Record<string, any>): Promise<number> {
    // Cette méthode serait implémentée dans la classe concrète
    return 0;
  }

  /**
   * Met à jour des enregistrements
   * @param values Valeurs à mettre à jour
   */
  async update(values: Record<string, any>): Promise<number> {
    // Cette méthode serait implémentée dans la classe concrète
    return 0;
  }

  /**
   * Supprime des enregistrements
   */
  async delete(): Promise<number> {
    // Cette méthode serait implémentée dans la classe concrète
    return 0;
  }

  /**
   * Vérifie si des enregistrements existent
   */
  async exists(): Promise<boolean> {
    // Cette méthode serait implémentée dans la classe concrète
    return (await this.count()) > 0;
  }

  /**
   * Génère la requête SQL
   */
  toSql(): string {
    // Cette méthode serait implémentée dans la classe concrète
    return '';
  }

  /**
   * Obtient les paramètres de la requête
   */
  getBindings(): any[] {
    // Cette méthode serait implémentée dans la classe concrète
    return [];
  }
}
