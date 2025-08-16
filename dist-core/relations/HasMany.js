"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HasMany = void 0;
const Collection_1 = require("../core/Collection");
const Relation_1 = require("./Relation");
class HasMany extends Relation_1.Relation {
    /**
     * Constructeur de la relation HasMany
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
        return this.get();
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
        // Grouper les résultats par clé étrangère
        const dictionary = {};
        results.each(model => {
            const key = model.getAttribute(this.foreignKey);
            if (!dictionary[key]) {
                dictionary[key] = [];
            }
            dictionary[key].push(model);
        });
        // Associer les résultats aux modèles parents
        collection.each(model => {
            const key = model.getAttribute(this.localKey);
            const relationModels = dictionary[key] || [];
            model.relations[relationName.split('.')[0]] = new Collection_1.Collection(relationModels);
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
    /**
     * Créer un nouveau modèle lié et l'associer au parent
     */
    async create(attributes = {}) {
        // Ajouter la clé étrangère aux attributs
        attributes[this.foreignKey] = this.parentModel.getAttribute(this.localKey);
        // Créer le nouveau modèle
        const instance = new this.relatedModel();
        instance.fill(attributes);
        await instance.save();
        return instance;
    }
    /**
     * Sauvegarder un modèle existant et l'associer au parent
     */
    async save(model) {
        model.setAttribute(this.foreignKey, this.parentModel.getAttribute(this.localKey));
        await model.save();
        return model;
    }
}
exports.HasMany = HasMany;
