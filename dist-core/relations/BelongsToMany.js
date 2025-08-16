"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BelongsToMany = void 0;
/**
 * Relation BelongsToMany - Relation many-to-many entre deux modèles
 */
const Model_1 = require("../core/Model");
const Collection_1 = require("../core/Collection");
const Relation_1 = require("./Relation");
const DB_1 = require("../core/DB");
class BelongsToMany extends Relation_1.Relation {
    /**
     * Constructeur de la relation BelongsToMany
     */
    constructor(relatedModel, parentModel, pivotTable, foreignPivotKey, relatedPivotKey, parentKey, relatedKey) {
        super(relatedModel, parentModel);
        this.pivotColumns = [];
        this.pivotTable = pivotTable;
        this.foreignPivotKey = foreignPivotKey;
        this.relatedPivotKey = relatedPivotKey;
        this.parentKey = parentKey;
        this.relatedKey = relatedKey;
    }
    /**
     * Ajouter les contraintes de base à la requête
     */
    addConstraints() {
        this.performJoin();
        this.query.where(`${this.pivotTable}.${this.foreignPivotKey}`, this.parentModel.getAttribute(this.parentKey));
    }
    /**
     * Effectuer la jointure avec la table pivot
     */
    performJoin() {
        const relatedTable = this.relatedModel.getTable();
        this.query.join(this.pivotTable, `${relatedTable}.${this.relatedKey}`, '=', `${this.pivotTable}.${this.relatedPivotKey}`);
    }
    /**
     * Spécifier les colonnes supplémentaires à sélectionner dans la table pivot
     */
    withPivot(...columns) {
        this.pivotColumns.push(...columns);
        return this;
    }
    /**
     * Obtenir les résultats de la relation
     */
    async getResults() {
        // Ajouter les colonnes pivot à la sélection
        this.addPivotColumns();
        return this.get();
    }
    /**
     * Ajouter les colonnes pivot à la sélection
     */
    addPivotColumns() {
        const relatedTable = this.relatedModel.getTable();
        // Sélectionner toutes les colonnes de la table liée
        this.query.select(`${relatedTable}.*`);
        // Ajouter les colonnes pivot
        const pivotColumns = [
            this.foreignPivotKey,
            this.relatedPivotKey,
            ...this.pivotColumns
        ];
        pivotColumns.forEach(column => {
            this.query.select(`${this.pivotTable}.${column} as pivot_${column}`);
        });
    }
    /**
     * Attacher un modèle à la relation
     */
    async attach(id, pivotAttributes = {}) {
        const ids = this.convertToIds(id);
        for (const id of ids) {
            await this.attachOne(id, pivotAttributes);
        }
    }
    /**
     * Attacher un seul modèle à la relation
     */
    async attachOne(id, pivotAttributes = {}) {
        // Préparer les données pour l'insertion
        const record = {
            [this.foreignPivotKey]: this.parentModel.getAttribute(this.parentKey),
            [this.relatedPivotKey]: id,
            ...pivotAttributes
        };
        // Insérer dans la table pivot
        await DB_1.DB.insert(this.pivotTable, record);
    }
    /**
     * Détacher un modèle de la relation
     */
    async detach(id = null) {
        // Si aucun ID n'est fourni, détacher tous les modèles
        if (id === null) {
            await this.detachAll();
            return;
        }
        const ids = this.convertToIds(id);
        // Construire la clause WHERE
        let whereClause = `${this.foreignPivotKey} = ?`;
        const params = [this.parentModel.getAttribute(this.parentKey)];
        if (ids.length > 0) {
            const placeholders = ids.map(() => '?').join(', ');
            whereClause += ` AND ${this.relatedPivotKey} IN (${placeholders})`;
            params.push(...ids);
        }
        // Supprimer de la table pivot
        await DB_1.DB.delete(this.pivotTable, whereClause, params);
    }
    /**
     * Détacher tous les modèles de la relation
     */
    async detachAll() {
        const whereClause = `${this.foreignPivotKey} = ?`;
        const params = [this.parentModel.getAttribute(this.parentKey)];
        await DB_1.DB.delete(this.pivotTable, whereClause, params);
    }
    /**
     * Synchroniser la relation avec une liste d'IDs
     */
    async sync(ids, pivotAttributes = {}) {
        // Détacher tous les modèles existants
        await this.detachAll();
        // Attacher les nouveaux modèles
        if (ids.length > 0) {
            await this.attach(ids, pivotAttributes);
        }
    }
    /**
     * Mettre à jour les attributs pivot pour un modèle
     */
    async updateExistingPivot(id, attributes) {
        const whereClause = `${this.foreignPivotKey} = ? AND ${this.relatedPivotKey} = ?`;
        const params = [
            this.parentModel.getAttribute(this.parentKey),
            id
        ];
        await DB_1.DB.update(this.pivotTable, attributes, whereClause, params);
    }
    /**
     * Convertir les entrées en IDs
     */
    convertToIds(value) {
        if (!Array.isArray(value)) {
            value = [value];
        }
        return value.map(item => {
            if (item instanceof Model_1.Model) {
                return item.getAttribute(this.relatedKey);
            }
            return item;
        });
    }
    /**
     * Charger la relation pour une collection de modèles
     */
    async loadForCollection(collection, relationName) {
        if (collection.isEmpty()) {
            return;
        }
        // Obtenir toutes les clés parentes
        const parentKeys = collection.pluck(this.parentKey);
        // Créer une nouvelle requête sans les contraintes précédentes
        const query = new this.query.constructor(this.relatedModel, this.relatedModel.getTable());
        // Effectuer la jointure avec la table pivot
        query.join(this.pivotTable, `${this.relatedModel.getTable()}.${this.relatedKey}`, '=', `${this.pivotTable}.${this.relatedPivotKey}`);
        // Ajouter la contrainte pour charger tous les modèles liés
        query.whereIn(`${this.pivotTable}.${this.foreignPivotKey}`, parentKeys);
        // Ajouter les colonnes pivot à la sélection
        query.select(`${this.relatedModel.getTable()}.*`);
        const pivotColumns = [
            this.foreignPivotKey,
            this.relatedPivotKey,
            ...this.pivotColumns
        ];
        pivotColumns.forEach(column => {
            query.select(`${this.pivotTable}.${column} as pivot_${column}`);
        });
        // Charger les relations imbriquées si nécessaire
        const nestedRelations = this.getNestedRelations(relationName);
        if (nestedRelations.length > 0) {
            query.with(...nestedRelations);
        }
        // Exécuter la requête
        const results = await query.get();
        // Grouper les résultats par clé étrangère pivot
        const dictionary = {};
        results.each(model => {
            const pivotForeignKey = model.getAttribute(`pivot_${this.foreignPivotKey}`);
            if (!dictionary[pivotForeignKey]) {
                dictionary[pivotForeignKey] = [];
            }
            // Extraire les attributs pivot
            const pivotAttributes = {};
            pivotColumns.forEach(column => {
                pivotAttributes[column] = model.getAttribute(`pivot_${column}`);
                // Supprimer l'attribut pivot du modèle
                delete model.attributes[`pivot_${column}`];
            });
            // Ajouter les attributs pivot au modèle
            model.pivot = pivotAttributes;
            dictionary[pivotForeignKey].push(model);
        });
        // Associer les résultats aux modèles parents
        collection.each(model => {
            const key = model.getAttribute(this.parentKey);
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
}
exports.BelongsToMany = BelongsToMany;
