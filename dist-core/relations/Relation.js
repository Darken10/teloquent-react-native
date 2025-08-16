"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Relation = void 0;
const Query_1 = require("../query/Query");
class Relation {
    /**
     * Constructeur de la relation
     */
    constructor(relatedModel, parentModel) {
        this.relatedModel = relatedModel;
        this.parentModel = parentModel;
        this.query = new Query_1.Query(relatedModel, relatedModel.getTable());
        this.addConstraints();
    }
    /**
     * Obtenir la requête de base pour la relation
     */
    getQuery() {
        return this.query;
    }
    /**
     * Ajouter des contraintes à la requête
     */
    where(column, operator, value) {
        this.query.where(column, operator, value);
        return this;
    }
    /**
     * Ajouter une clause ORDER BY à la requête
     */
    orderBy(column, direction = 'asc') {
        this.query.orderBy(column, direction);
        return this;
    }
    /**
     * Ajouter une clause LIMIT à la requête
     */
    limit(limit) {
        this.query.limit(limit);
        return this;
    }
    /**
     * Ajouter une clause OFFSET à la requête
     */
    offset(offset) {
        this.query.offset(offset);
        return this;
    }
    /**
     * Spécifier les relations à charger avec eager loading
     */
    with(...relations) {
        this.query.with(...relations);
        return this;
    }
    /**
     * Exécuter la requête et obtenir tous les résultats
     */
    async get() {
        return this.query.get();
    }
    /**
     * Exécuter la requête et obtenir le premier résultat
     */
    async first() {
        return this.query.first();
    }
    /**
     * Compter le nombre de résultats
     */
    async count() {
        return this.query.count();
    }
    /**
     * Vérifier si des résultats existent
     */
    async exists() {
        return this.query.exists();
    }
}
exports.Relation = Relation;
