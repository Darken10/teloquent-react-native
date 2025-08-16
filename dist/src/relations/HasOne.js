"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HasOne = void 0;
const Relation_1 = require("./Relation");
class HasOne extends Relation_1.Relation {
    /**
     * Constructeur de la relation HasOne
     */
    constructor(relatedModel, parentModel, foreignKey, localKey) {
        super(relatedModel, parentModel);
        this.foreignKey = foreignKey;
        this.localKey = localKey;
    }
    /**
     * Ajouter les contraintes de base à la requête
     */
    addConstraints() {
        this.query.where(this.foreignKey, this.parentModel.getAttribute(this.localKey));
    }
    /**
     * Obtenir les résultats de la relation
     */
    async getResults() {
        return this.first();
    }
    /**
     * Charger la relation pour une collection de modèles
     */
    async loadForCollection(collection, relationName) {
        if (collection.isEmpty()) {
            return;
        }
        // Obtenir toutes les clés parentes
        const parentKeys = collection.pluck(this.localKey);
        // Créer une nouvelle requête sans les contraintes précédentes
        const query = new this.query.constructor(this.relatedModel, this.relatedModel.getTable());
        // Ajouter la contrainte pour charger tous les modèles liés
        query.whereIn(this.foreignKey, parentKeys);
        // Charger les relations imbriquées si nécessaire
        const nestedRelations = this.getNestedRelations(relationName);
        if (nestedRelations.length > 0) {
            query.with(...nestedRelations);
        }
        // Exécuter la requête
        const results = await query.get();
        // Indexer les résultats par clé étrangère (clé en string)
        const dictionary = results.keyBy((m) => String(m.getAttribute(this.foreignKey)));
        // Associer les résultats aux modèles parents
        collection.each((model) => {
            const key = model.getAttribute(this.localKey);
            const relation = dictionary[String(key)] || null;
            const baseName = relationName.split('.')[0];
            model.setRelation(baseName, relation);
        });
    }
    /**
     * Obtenir les relations imbriquées
     */
    getNestedRelations(relationName) {
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
exports.HasOne = HasOne;
