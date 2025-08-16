"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = void 0;
class Collection {
    /**
     * Constructeur de Collection
     */
    constructor(items = []) {
        this.items = [];
        this.items = items;
    }
    /**
     * Obtenir tous les éléments de la collection
     */
    all() {
        return this.items;
    }
    /**
     * Obtenir le premier élément de la collection
     */
    first() {
        return this.items.length > 0 ? this.items[0] : null;
    }
    /**
     * Obtenir le dernier élément de la collection
     */
    last() {
        return this.items.length > 0 ? this.items[this.items.length - 1] : null;
    }
    /**
     * Obtenir un élément à un index spécifique
     */
    get(index) {
        return this.items[index];
    }
    /**
     * Vérifier si la collection est vide
     */
    isEmpty() {
        return this.items.length === 0;
    }
    /**
     * Obtenir le nombre d'éléments dans la collection
     */
    count() {
        return this.items.length;
    }
    /**
     * Filtrer la collection avec une fonction de rappel
     */
    filter(callback) {
        const filtered = this.items.filter(callback);
        return new Collection(filtered);
    }
    /**
     * Mapper la collection avec une fonction de rappel
     */
    map(callback) {
        return this.items.map(callback);
    }
    /**
     * Réduire la collection à une seule valeur
     */
    reduce(callback, initial) {
        return this.items.reduce(callback, initial);
    }
    /**
     * Trouver un élément dans la collection
     */
    find(callback) {
        return this.items.find(callback);
    }
    /**
     * Trier la collection
     */
    sortBy(key, direction = 'asc') {
        const sorted = [...this.items].sort((a, b) => {
            const valueA = typeof key === 'function' ? key(a) : a[key];
            const valueB = typeof key === 'function' ? key(b) : b[key];
            if (valueA === valueB)
                return 0;
            const comparison = valueA < valueB ? -1 : 1;
            return direction === 'asc' ? comparison : -comparison;
        });
        return new Collection(sorted);
    }
    /**
     * Grouper la collection par une clé
     */
    groupBy(key) {
        const groups = {};
        this.items.forEach(item => {
            const groupKey = typeof key === 'function' ? key(item) : String(item[key]);
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
        });
        const result = {};
        for (const groupKey in groups) {
            result[groupKey] = new Collection(groups[groupKey]);
        }
        return result;
    }
    /**
     * Obtenir un tableau des valeurs d'une propriété spécifique
     */
    pluck(key) {
        return this.items.map(item => item[key]);
    }
    /**
     * Obtenir un objet avec des clés et des valeurs spécifiques
     */
    keyBy(key) {
        const result = {};
        this.items.forEach(item => {
            const keyValue = typeof key === 'function' ? key(item) : String(item[key]);
            result[keyValue] = item;
        });
        return result;
    }
    /**
     * Fusionner avec une autre collection ou un tableau
     */
    merge(items) {
        const newItems = items instanceof Collection ? items.all() : items;
        return new Collection([...this.items, ...newItems]);
    }
    /**
     * Obtenir une tranche de la collection
     */
    slice(start, end) {
        return new Collection(this.items.slice(start, end));
    }
    /**
     * Obtenir les n premiers éléments
     */
    take(n) {
        return this.slice(0, n);
    }
    /**
     * Obtenir les n derniers éléments
     */
    takeLast(n) {
        return new Collection(this.items.slice(-n));
    }
    /**
     * Exécuter une fonction sur chaque élément
     */
    each(callback) {
        this.items.forEach(callback);
        return this;
    }
    /**
     * Convertir la collection en tableau JSON
     */
    toJson() {
        return this.items.map(item => item.toJson());
    }
    /**
     * Implémenter l'itérateur pour permettre l'utilisation de for...of
     */
    [Symbol.iterator]() {
        let index = 0;
        const items = this.items;
        return {
            next() {
                if (index < items.length) {
                    return { value: items[index++], done: false };
                }
                else {
                    return { value: null, done: true };
                }
            }
        };
    }
}
exports.Collection = Collection;
