"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = void 0;
/**
 * Classe Model - La classe de base pour tous les modèles Teloquent
 */
const DB_1 = require("./DB");
const Query_1 = require("../query/Query");
const Collection_1 = require("./Collection");
const pluralize_1 = __importDefault(require("pluralize"));
const inflector_1 = require("../utils/inflector");
const HasOne_1 = require("../relations/HasOne");
const HasMany_1 = require("../relations/HasMany");
const BelongsTo_1 = require("../relations/BelongsTo");
const BelongsToMany_1 = require("../relations/BelongsToMany");
/**
 * Classe Model - La classe de base pour tous les modèles Teloquent
 */
class Model {
    /**
     * Constructeur du modèle
     */
    constructor(attributes = {}) {
        // Propriétés d'instance
        this.attributes = {};
        this.original = {};
        this.changes = {};
        this.relations = {};
        this.exists = false;
        this.primaryKey = 'id';
        this.casts = {};
        this.hidden = [];
        this.visible = [];
        this.appends = [];
        this.dates = [];
        this.fill(attributes);
    }
    /**
     * Obtenir le nom de la table pour ce modèle
     */
    static getTable() {
        if (this.table) {
            return this.table;
        }
        // Par défaut, utiliser le nom de la classe au pluriel et en minuscules
        return (0, pluralize_1.default)(this.name.toLowerCase());
    }
    /**
     * Obtenir la clé primaire pour ce modèle
     */
    static getPrimaryKey() {
        return this.primaryKey;
    }
    // La méthode getTable est déjà définie plus haut
    /**
     * Créer une nouvelle instance de Query pour ce modèle
     */
    static query() {
        const modelClass = this;
        const table = this.getTable();
        return new Query_1.Query(modelClass, table);
    }
    /**
     * Obtenir tous les enregistrements
     */
    static async all() {
        const query = this.query();
        return query.get();
    }
    /**
     * Trouver un enregistrement par son ID
     */
    static async find(id) {
        const query = this.query();
        return query.find(id);
    }
    /**
     * Trouver un enregistrement par sa clé primaire ou échouer
     */
    static async findOrFail(id) {
        const model = await this.find(id);
        if (!model) {
            throw new Error(`Modèle ${this.name} non trouvé avec l'ID ${id}`);
        }
        return model;
    }
    /**
     * Créer un nouveau modèle et le sauvegarder dans la base de données
     */
    static async create(attributes) {
        const model = new this();
        model.fill(attributes);
        await model.save();
        return model;
    }
    /**
     * Mettre à jour ou créer un modèle
     */
    static async updateOrCreate(attributes, values) {
        const query = this.query();
        // Ajouter les conditions de recherche
        Object.entries(attributes).forEach(([key, value]) => {
            // S'assurer que la valeur est compatible avec le type attendu par where
            query.where(key, value);
        });
        // Chercher le modèle existant
        const model = await query.first();
        if (model) {
            // Mettre à jour le modèle existant
            model.fill(values);
            await model.save();
            return model;
        }
        else {
            // Créer un nouveau modèle
            return this.create({ ...attributes, ...values });
        }
    }
    /**
     * Ajouter une clause where à la requête
     */
    static where(column, operator, value) {
        const query = this.query();
        return query.where(column, operator, value);
    }
    /**
     * Spécifier les relations à charger avec eager loading
     */
    static with(...relations) {
        const query = this.query();
        return query.with(...relations);
    }
    /**
     * Remplir le modèle avec des attributs
     */
    fill(attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
            this.setAttribute(key, value);
        });
        return this;
    }
    /**
     * Définir un attribut
     */
    setAttribute(key, value) {
        // Appliquer les conversions de type si nécessaire
        if (this.casts[key]) {
            value = this.castAttribute(key, value);
        }
        this.attributes[key] = value;
        this.changes[key] = value;
        return this;
    }
    /**
     * Obtenir un attribut
     */
    getAttribute(key) {
        // Vérifier si l'attribut existe
        if (this.attributes[key] !== undefined) {
            return this.attributes[key];
        }
        // Vérifier si c'est une relation chargée
        if (this.relations[key] !== undefined) {
            return this.relations[key];
        }
        // Vérifier s'il y a un accesseur pour cet attribut
        const accessor = `get${key.charAt(0).toUpperCase() + key.slice(1)}Attribute`;
        if (typeof this[accessor] === 'function') {
            return this[accessor]();
        }
        return undefined;
    }
    /**
     * Convertir un attribut selon son type défini
     */
    castAttribute(key, value) {
        const type = this.casts[key];
        if (value === null) {
            return null;
        }
        switch (type) {
            case 'int':
            case 'integer':
                return typeof value === 'string' || typeof value === 'number' ? parseInt(String(value), 10) : 0;
            case 'float':
            case 'double':
                return typeof value === 'string' || typeof value === 'number' ? parseFloat(String(value)) : 0;
            case 'bool':
            case 'boolean':
                return Boolean(value);
            case 'string':
                return String(value);
            case 'array':
                if (Array.isArray(value))
                    return value;
                return typeof value === 'string' ? JSON.parse(value) : [];
            case 'object':
                if (value !== null && typeof value === 'object' && !Array.isArray(value))
                    return value;
                return typeof value === 'string' ? JSON.parse(value) : {};
            case 'date':
                if (value instanceof Date)
                    return value;
                return typeof value === 'string' || typeof value === 'number' ? new Date(value) : new Date();
            default:
                return value;
        }
    }
    /**
     * Obtenir la valeur de la clé primaire
     */
    getKey() {
        const key = this.constructor.getPrimaryKey();
        return this.getAttribute(key);
    }
    /**
     * Vérifier si le modèle est nouveau (pas encore sauvegardé)
     */
    isNew() {
        return !this.exists;
    }
    /**
     * Vérifier si le modèle a été modifié
     */
    isDirty() {
        return Object.keys(this.changes).length > 0;
    }
    /**
     * Sauvegarder le modèle dans la base de données
     */
    async save() {
        // Déclencher l'événement saving
        await this.fireEvent('saving');
        // Si le modèle existe déjà, mettre à jour, sinon insérer
        const result = this.exists ? await this.performUpdate() : await this.performInsert();
        // Réinitialiser les changements
        this.changes = {};
        // Déclencher l'événement saved
        await this.fireEvent('saved');
        return result;
    }
    /**
     * Effectuer une insertion dans la base de données
     */
    async performInsert() {
        const modelClass = this.constructor;
        const table = modelClass.getTable();
        // Ajouter les timestamps si nécessaire
        if (modelClass.timestamps) {
            const now = new Date().toISOString();
            this.setAttribute('created_at', now);
            this.setAttribute('updated_at', now);
        }
        // Déclencher l'événement creating
        await this.fireEvent('creating');
        // Insérer dans la base de données
        const insertId = await DB_1.DB.insert(table, this.attributes);
        // Définir la clé primaire et marquer comme existant
        const primaryKey = modelClass.getPrimaryKey();
        if (!this.getAttribute(primaryKey)) {
            this.setAttribute(primaryKey, insertId);
        }
        this.exists = true;
        // Mettre à jour les attributs originaux
        this.original = { ...this.attributes };
        // Déclencher l'événement created
        await this.fireEvent('created');
        return true;
    }
    /**
     * Effectuer une mise à jour dans la base de données
     */
    async performUpdate() {
        // Si rien n'a changé, retourner true sans rien faire
        if (!this.isDirty()) {
            return true;
        }
        const modelClass = this.constructor;
        const table = modelClass.getTable();
        const primaryKey = modelClass.getPrimaryKey();
        // Ajouter le timestamp de mise à jour si nécessaire
        if (modelClass.timestamps) {
            this.setAttribute('updated_at', new Date().toISOString());
        }
        // Déclencher l'événement updating
        await this.fireEvent('updating');
        // Mettre à jour dans la base de données
        const rowsAffected = await DB_1.DB.update(table, this.changes, `${primaryKey} = ?`, [this.getKey()]);
        // Mettre à jour les attributs originaux
        this.original = { ...this.attributes };
        // Déclencher l'événement updated
        await this.fireEvent('updated');
        return rowsAffected > 0;
    }
    /**
     * Supprimer le modèle de la base de données
     */
    async delete() {
        if (!this.exists) {
            return false;
        }
        const modelClass = this.constructor;
        const table = modelClass.getTable();
        const primaryKey = modelClass.getPrimaryKey();
        // Déclencher l'événement deleting
        await this.fireEvent('deleting');
        // Supprimer de la base de données
        const rowsAffected = await DB_1.DB.delete(table, `${primaryKey} = ?`, [this.getKey()]);
        if (rowsAffected > 0) {
            this.exists = false;
            // Déclencher l'événement deleted
            await this.fireEvent('deleted');
            return true;
        }
        return false;
    }
    /**
     * Rafraîchir le modèle depuis la base de données
     */
    async refresh() {
        if (!this.exists) {
            return this;
        }
        const modelClass = this.constructor;
        const key = this.getKey();
        // Vérifier que la clé est bien une chaîne ou un nombre
        const validKey = typeof key === 'string' || typeof key === 'number' ? key : null;
        const freshModel = validKey !== null ? await modelClass.find(validKey) : null;
        if (freshModel) {
            this.attributes = { ...freshModel.attributes };
            this.original = { ...freshModel.attributes };
            this.changes = {};
            this.relations = {};
        }
        return this;
    }
    /**
     * Convertir le modèle en objet JSON
     */
    toJson() {
        const json = {};
        // Déterminer quels attributs inclure
        const attributes = this.visible.length > 0
            ? this.visible
            : Object.keys(this.attributes).filter(key => !this.hidden.includes(key));
        // Ajouter les attributs
        attributes.forEach(key => {
            json[key] = this.getAttribute(key);
        });
        // Ajouter les attributs calculés
        this.appends.forEach(key => {
            json[key] = this.getAttribute(key);
        });
        // Ajouter les relations
        Object.entries(this.relations).forEach(([key, relation]) => {
            if (relation instanceof Model) {
                json[key] = relation.toJson();
            }
            else if (relation instanceof Collection_1.Collection) {
                json[key] = relation.toJson();
            }
        });
        return json;
    }
    /**
     * Définir une relation hasOne
     */
    hasOne(relatedModel, foreignKey, localKey) {
        const modelClass = this.constructor;
        // Déterminer les clés par défaut si non spécifiées
        if (!foreignKey) {
            foreignKey = `${(0, inflector_1.singularize)(modelClass.name.toLowerCase())}_id`;
        }
        if (!localKey) {
            localKey = modelClass.getPrimaryKey();
        }
        return new HasOne_1.HasOne(relatedModel, this, foreignKey, localKey);
    }
    /**
     * Définir une relation hasMany
     */
    hasMany(relatedModel, foreignKey, localKey) {
        const modelClass = this.constructor;
        // Déterminer les clés par défaut si non spécifiées
        if (!foreignKey) {
            foreignKey = `${(0, inflector_1.singularize)(modelClass.name.toLowerCase())}_id`;
        }
        if (!localKey) {
            localKey = modelClass.getPrimaryKey();
        }
        return new HasMany_1.HasMany(relatedModel, this, foreignKey, localKey);
    }
    /**
     * Définir une relation belongsTo
     */
    belongsTo(relatedModel, foreignKey, ownerKey) {
        // Déterminer les clés par défaut si non spécifiées
        if (!foreignKey) {
            foreignKey = `${(0, inflector_1.singularize)(relatedModel.name.toLowerCase())}_id`;
        }
        if (!ownerKey) {
            ownerKey = relatedModel.getPrimaryKey();
        }
        return new BelongsTo_1.BelongsTo(relatedModel, this, foreignKey, ownerKey);
    }
    /**
     * Définir une relation belongsToMany
     */
    belongsToMany(relatedModel, pivotTable, foreignPivotKey, relatedPivotKey, parentKey, relatedKey) {
        const modelClass = this.constructor;
        // Déterminer les noms par défaut si non spécifiés
        if (!pivotTable) {
            const models = [
                (0, inflector_1.singularize)(modelClass.name.toLowerCase()),
                (0, inflector_1.singularize)(relatedModel.name.toLowerCase())
            ].sort();
            pivotTable = `${models[0]}_${models[1]}`;
        }
        if (!foreignPivotKey) {
            foreignPivotKey = `${(0, inflector_1.singularize)(modelClass.name.toLowerCase())}_id`;
        }
        if (!relatedPivotKey) {
            relatedPivotKey = `${(0, inflector_1.singularize)(relatedModel.name.toLowerCase())}_id`;
        }
        if (!parentKey) {
            parentKey = modelClass.getPrimaryKey();
        }
        if (!relatedKey) {
            relatedKey = relatedModel.getPrimaryKey();
        }
        return new BelongsToMany_1.BelongsToMany(relatedModel, this, pivotTable, foreignPivotKey, relatedPivotKey, parentKey, relatedKey);
    }
    /**
     * Déclencher un événement de modèle
     */
    async fireEvent(event) {
        const handlers = this.constructor.globalEventHandlers[event] || [];
        for (const handler of handlers) {
            await handler(this);
        }
    }
    /**
     * Enregistrer un gestionnaire d'événements global
     */
    static registerGlobalEvent(event, handler) {
        if (!this.globalEventHandlers[event]) {
            this.globalEventHandlers[event] = [];
        }
        this.globalEventHandlers[event].push(handler);
    }
    /**
     * Accesseur magique pour les attributs
     */
    get(key) {
        return this.getAttribute(key);
    }
    /**
     * Mutateur magique pour les attributs
     */
    set(key, value) {
        this.setAttribute(key, value);
    }
}
exports.Model = Model;
Model.primaryKey = 'id';
Model.timestamps = true;
Model.dateFormat = 'YYYY-MM-DD HH:mm:ss';
// Hooks d'événements
Model.globalEventHandlers = {
    creating: [],
    created: [],
    updating: [],
    updated: [],
    saving: [],
    saved: [],
    deleting: [],
    deleted: []
};
