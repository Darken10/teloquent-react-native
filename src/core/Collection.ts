/**
 * Classe Collection pour gérer les collections de modèles
 */
import { Model } from './Model';

export class Collection<T extends Model = Model> {
  protected items: T[] = [];

  /**
   * Constructeur de Collection
   */
  constructor(items: T[] = []) {
    this.items = items;
  }

  /**
   * Obtenir tous les éléments de la collection
   */
  public all(): T[] {
    return this.items;
  }

  /**
   * Obtenir le premier élément de la collection
   */
  public first(): T | null {
    return this.items.length > 0 ? this.items[0] : null;
  }

  /**
   * Obtenir le dernier élément de la collection
   */
  public last(): T | null {
    return this.items.length > 0 ? this.items[this.items.length - 1] : null;
  }

  /**
   * Obtenir un élément à un index spécifique
   */
  public get(index: number): T | undefined {
    return this.items[index];
  }

  /**
   * Vérifier si la collection est vide
   */
  public isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Obtenir le nombre d'éléments dans la collection
   */
  public count(): number {
    return this.items.length;
  }

  /**
   * Filtrer la collection avec une fonction de rappel
   */
  public filter(callback: (item: T, index: number) => boolean): Collection<T> {
    const filtered = this.items.filter(callback);
    return new Collection<T>(filtered);
  }

  /**
   * Mapper la collection avec une fonction de rappel
   */
  public map<U>(callback: (item: T, index: number) => U): U[] {
    return this.items.map(callback);
  }

  /**
   * Réduire la collection à une seule valeur
   */
  public reduce<U>(callback: (carry: U, item: T) => U, initial: U): U {
    return this.items.reduce(callback, initial);
  }

  /**
   * Trouver un élément dans la collection
   */
  public find(callback: (item: T) => boolean): T | undefined {
    return this.items.find(callback);
  }

  /**
   * Trier la collection
   */
  public sortBy(key: keyof T | ((item: T) => any), direction: 'asc' | 'desc' = 'asc'): Collection<T> {
    const sorted = [...this.items].sort((a, b) => {
      const valueA = typeof key === 'function' ? key(a) : a[key];
      const valueB = typeof key === 'function' ? key(b) : b[key];
      
      if (valueA === valueB) return 0;
      
      const comparison = valueA < valueB ? -1 : 1;
      return direction === 'asc' ? comparison : -comparison;
    });
    
    return new Collection<T>(sorted);
  }

  /**
   * Grouper la collection par une clé
   */
  public groupBy(key: keyof T | ((item: T) => any)): Record<string, Collection<T>> {
    const groups: Record<string, T[]> = {};
    
    this.items.forEach(item => {
      const groupKey = typeof key === 'function' ? key(item) : String(item[key]);
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      
      groups[groupKey].push(item);
    });
    
    const result: Record<string, Collection<T>> = {};
    
    for (const groupKey in groups) {
      result[groupKey] = new Collection<T>(groups[groupKey]);
    }
    
    return result;
  }

  /**
   * Obtenir un tableau des valeurs d'une propriété spécifique
   */
  public pluck<K extends keyof T>(key: K): T[K][] {
    return this.items.map(item => item[key]);
  }

  /**
   * Obtenir un objet avec des clés et des valeurs spécifiques
   */
  public keyBy(key: keyof T | ((item: T) => string)): Record<string, T> {
    const result: Record<string, T> = {};
    
    this.items.forEach(item => {
      const keyValue = typeof key === 'function' ? key(item) : String(item[key]);
      result[keyValue] = item;
    });
    
    return result;
  }

  /**
   * Fusionner avec une autre collection ou un tableau
   */
  public merge(items: T[] | Collection<T>): Collection<T> {
    const newItems = items instanceof Collection ? items.all() : items;
    return new Collection<T>([...this.items, ...newItems]);
  }

  /**
   * Obtenir une tranche de la collection
   */
  public slice(start: number, end?: number): Collection<T> {
    return new Collection<T>(this.items.slice(start, end));
  }

  /**
   * Obtenir les n premiers éléments
   */
  public take(n: number): Collection<T> {
    return this.slice(0, n);
  }

  /**
   * Obtenir les n derniers éléments
   */
  public takeLast(n: number): Collection<T> {
    return new Collection<T>(this.items.slice(-n));
  }

  /**
   * Exécuter une fonction sur chaque élément
   */
  public each(callback: (item: T, index: number) => void): this {
    this.items.forEach(callback);
    return this;
  }

  /**
   * Convertir la collection en tableau JSON
   */
  public toJson(): Record<string, any>[] {
    return this.items.map(item => item.toJson());
  }

  /**
   * Implémenter l'itérateur pour permettre l'utilisation de for...of
   */
  public [Symbol.iterator](): Iterator<T> {
    let index = 0;
    const items = this.items;
    
    return {
      next(): IteratorResult<T> {
        if (index < items.length) {
          return { value: items[index++], done: false };
        } else {
          return { value: null as any, done: true };
        }
      }
    };
  }
}
