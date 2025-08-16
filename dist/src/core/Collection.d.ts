/**
 * Classe Collection pour gérer les collections de modèles
 */
import { Model } from './Model';
export declare class Collection<T extends Model = Model> {
    protected items: T[];
    /**
     * Constructeur de Collection
     */
    constructor(items?: T[]);
    /**
     * Obtenir tous les éléments de la collection
     */
    all(): T[];
    /**
     * Obtenir le premier élément de la collection
     */
    first(): T | null;
    /**
     * Obtenir le dernier élément de la collection
     */
    last(): T | null;
    /**
     * Obtenir un élément à un index spécifique
     */
    get(index: number): T | undefined;
    /**
     * Vérifier si la collection est vide
     */
    isEmpty(): boolean;
    /**
     * Obtenir le nombre d'éléments dans la collection
     */
    count(): number;
    /**
     * Filtrer la collection avec une fonction de rappel
     */
    filter(callback: (item: T, index: number) => boolean): Collection<T>;
    /**
     * Mapper la collection avec une fonction de rappel
     */
    map<U>(callback: (item: T, index: number) => U): U[];
    /**
     * Réduire la collection à une seule valeur
     */
    reduce<U>(callback: (carry: U, item: T) => U, initial: U): U;
    /**
     * Trouver un élément dans la collection
     */
    find(callback: (item: T) => boolean): T | undefined;
    /**
     * Trier la collection
     */
    sortBy(key: keyof T | ((item: T) => any), direction?: 'asc' | 'desc'): Collection<T>;
    /**
     * Grouper la collection par une clé
     */
    groupBy(key: keyof T | ((item: T) => any)): Record<string, Collection<T>>;
    /**
     * Obtenir un tableau des valeurs d'une propriété spécifique
     */
    pluck<K extends keyof T>(key: K): T[K][];
    /**
     * Obtenir un objet avec des clés et des valeurs spécifiques
     */
    keyBy(key: keyof T | ((item: T) => string)): Record<string, T>;
    /**
     * Fusionner avec une autre collection ou un tableau
     */
    merge(items: T[] | Collection<T>): Collection<T>;
    /**
     * Obtenir une tranche de la collection
     */
    slice(start: number, end?: number): Collection<T>;
    /**
     * Obtenir les n premiers éléments
     */
    take(n: number): Collection<T>;
    /**
     * Obtenir les n derniers éléments
     */
    takeLast(n: number): Collection<T>;
    /**
     * Exécuter une fonction sur chaque élément
     */
    each(callback: (item: T, index: number) => void): this;
    /**
     * Convertir la collection en tableau JSON
     */
    toJson(): Record<string, any>[];
    /**
     * Implémenter l'itérateur pour permettre l'utilisation de for...of
     */
    [Symbol.iterator](): Iterator<T>;
}
