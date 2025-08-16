"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BelongsTo = void 0;
const Relation_1 = require("./Relation");
class BelongsTo extends Relation_1.Relation {
    /**
     * Constructeur de la relation BelongsTo
     */
    constructor(relatedModel, parentModel, foreignKey, ownerKey) {
        super(relatedModel, parentModel);
        this.foreignKey = foreignKey;
        this.ownerKey = ownerKey;
    }
    /**
     * Ajouter les contraintes de base à la requête
     */
    addConstraints() {
        const foreignKeyValue = this.parentModel.getAttribute(this.foreignKey);
        // Ne pas ajouter de contrainte si la clé étrangère est null
        if (foreignKeyValue !== null && foreignKeyValue !== undefined) {
            this.query.where(this.ownerKey, foreignKeyValue);
        }
    }
    /**
     * Obtenir les résultats de la relation
     */
    async getResults() {
        const foreignKeyValue = this.parentModel.getAttribute(this.foreignKey);
        if (foreignKeyValue === null || foreignKeyValue === undefined) {
            return null;
        }
        return this.first();
    }
    /**
     * Associer un modèle à la relation
     */
    async associate(model) {
        this.parentModel.setAttribute(this.foreignKey, model.getAttribute(this.ownerKey));
        await this.parentModel.save();
        return this.parentModel;
    }
    /**
     * Dissocier le modèle de la relation
     */
    async dissociate() {
        this.parentModel.setAttribute(this.foreignKey, null);
        await this.parentModel.save();
        return this.parentModel;
    }
    /**
     * Charger la relation pour une collection de modèles
     */
    async loadForCollection(collection, relationName) {
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
        const query = new this.query.constructor(this.relatedModel, this.relatedModel.getTable());
        // Ajouter la contrainte pour charger tous les modèles liés
        query.whereIn(this.ownerKey, foreignKeys);
        // Charger les relations imbriquées si nécessaire
        const nestedRelations = this.getNestedRelations(relationName);
        if (nestedRelations.length > 0) {
            query.with(...nestedRelations);
        }
        // Exécuter la requête
        const results = await query.get();
        // Indexer les résultats par clé primaire
        const dictionary = results.keyBy(model => model.getAttribute(this.ownerKey));
        // Associer les résultats aux modèles parents
        collection.each(model => {
            const key = model.getAttribute(this.foreignKey);
            const relation = key !== null && key !== undefined ? dictionary[key] || null : null;
            model.relations[relationName.split('.')[0]] = relation;
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
exports.BelongsTo = BelongsTo;
