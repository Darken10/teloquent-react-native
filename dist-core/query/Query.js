"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = void 0;
const Collection_1 = require("../core/Collection");
const query_builder_1 = require("./query-builder");
class Query extends query_builder_1.QueryBuilder {
    /**
     * Constructeur
     * @param modelClass Classe du modèle
     * @param table Nom de la table
     */
    constructor(modelClass, table) {
        super(table, modelClass);
        /**
         * Relations à charger avec eager loading
         */
        this.eagerLoad = [];
        this.modelClass = modelClass;
    }
    /**
     * Spécifier les relations à charger avec eager loading
     * @param relations Relations à charger
     */
    with(...relations) {
        this.eagerLoad = [...this.eagerLoad, ...relations];
        return this;
    }
    /**
     * Trouver un modèle par sa clé primaire
     * @param id Valeur de la clé primaire
     */
    async find(id) {
        return this.where(this.modelClass.primaryKey, id).first();
    }
    /**
     * Récupérer tous les résultats de la requête
     */
    async get() {
        // Exécuter la requête SQL et récupérer les résultats
        const results = await this.executeQuery();
        // Créer les instances de modèle
        const models = this.hydrateModels(results);
        // Charger les relations si nécessaire
        if (this.eagerLoad.length > 0) {
            await this.loadRelations(models);
        }
        return new Collection_1.Collection(models);
    }
    /**
     * Exécuter la requête SQL
     */
    async executeQuery() {
        // Cette méthode serait implémentée pour exécuter la requête SQL
        // et retourner les résultats bruts
        return [];
    }
    /**
     * Créer des instances de modèle à partir des résultats bruts
     * @param results Résultats bruts de la requête
     */
    hydrateModels(results) {
        return results.map(result => {
            const model = new this.modelClass();
            // Remplir le modèle avec les attributs
            Object.keys(result).forEach(key => {
                model.setAttribute(key, result[key]);
            });
            // Marquer le modèle comme existant
            model.exists = true;
            return model;
        });
    }
    /**
     * Charger les relations pour une collection de modèles
     * @param models Collection de modèles
     */
    async loadRelations(models) {
        // Cette méthode serait implémentée pour charger les relations
        // spécifiées dans this.eagerLoad pour tous les modèles
    }
}
exports.Query = Query;
