"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = void 0;
/**
 * Classe Query pour construire des requêtes SQL de manière fluide
 */
const DB_1 = require("./DB");
const Collection_1 = require("./Collection");
class Query {
    /**
     * Constructeur de Query
     */
    constructor(modelClass, table) {
        this._selects = ['*'];
        this._wheres = [];
        this._orders = [];
        this._limit = null;
        this._offset = null;
        this._joins = [];
        this._groups = [];
        this._havings = [];
        this._relations = [];
        this._modelClass = modelClass;
        this._table = table;
    }
    /**
     * Spécifier les colonnes à sélectionner
     */
    select(...columns) {
        this._selects = columns.length > 0 ? columns : ['*'];
        return this;
    }
    /**
     * Ajouter une clause WHERE
     */
    where(column, operator, value, boolean = 'and') {
        // Gérer le cas où l'opérateur est omis (where('column', value))
        if (value === undefined) {
            value = operator;
            operator = '=';
        }
        this._wheres.push({
            column,
            operator: operator,
            value,
            boolean
        });
        return this;
    }
    /**
     * Ajouter une clause WHERE avec OR
     */
    orWhere(column, operator, value) {
        return this.where(column, operator, value, 'or');
    }
    /**
     * Ajouter une clause WHERE IN
     */
    whereIn(column, values, boolean = 'and') {
        this._wheres.push({
            column,
            operator: 'IN',
            value: values,
            boolean
        });
        return this;
    }
    /**
     * Ajouter une clause WHERE NOT IN
     */
    whereNotIn(column, values, boolean = 'and') {
        this._wheres.push({
            column,
            operator: 'NOT IN',
            value: values,
            boolean
        });
        return this;
    }
    /**
     * Ajouter une clause WHERE NULL
     */
    whereNull(column, boolean = 'and') {
        this._wheres.push({
            column,
            operator: 'NULL',
            value: null,
            boolean
        });
        return this;
    }
    /**
     * Ajouter une clause WHERE NOT NULL
     */
    whereNotNull(column, boolean = 'and') {
        this._wheres.push({
            column,
            operator: 'NOT NULL',
            value: null,
            boolean
        });
        return this;
    }
    /**
     * Ajouter une clause ORDER BY
     */
    orderBy(column, direction = 'asc') {
        this._orders.push({
            column,
            direction
        });
        return this;
    }
    /**
     * Ajouter une clause LIMIT
     */
    limit(limit) {
        this._limit = limit;
        return this;
    }
    /**
     * Ajouter une clause OFFSET
     */
    offset(offset) {
        this._offset = offset;
        return this;
    }
    /**
     * Ajouter une clause JOIN
     */
    join(table, first, operator, second) {
        this._joins.push(`JOIN ${table} ON ${first} ${operator} ${second}`);
        return this;
    }
    /**
     * Ajouter une clause LEFT JOIN
     */
    leftJoin(table, first, operator, second) {
        this._joins.push(`LEFT JOIN ${table} ON ${first} ${operator} ${second}`);
        return this;
    }
    /**
     * Ajouter une clause GROUP BY
     */
    groupBy(...columns) {
        this._groups.push(...columns);
        return this;
    }
    /**
     * Ajouter une clause HAVING
     */
    having(column, operator, value, boolean = 'and') {
        // Gérer le cas où l'opérateur est omis
        if (value === undefined) {
            value = operator;
            operator = '=';
        }
        this._havings.push({
            column,
            operator: operator,
            value,
            boolean
        });
        return this;
    }
    /**
     * Spécifier les relations à charger avec eager loading
     */
    with(...relations) {
        this._relations.push(...relations);
        return this;
    }
    /**
     * Construire la requête SQL
     */
    buildQuery() {
        let sql = `SELECT ${this._selects.join(', ')} FROM ${this._table}`;
        const params = [];
        // Ajouter les JOINs
        if (this._joins.length > 0) {
            sql += ' ' + this._joins.join(' ');
        }
        // Ajouter les WHEREs
        if (this._wheres.length > 0) {
            sql += ' WHERE';
            this._wheres.forEach((where, index) => {
                const connector = index === 0 ? ' ' : ` ${where.boolean} `;
                if (where.operator === 'IN' || where.operator === 'NOT IN') {
                    const placeholders = Array(where.value.length).fill('?').join(', ');
                    sql += `${connector}${where.column} ${where.operator} (${placeholders})`;
                    params.push(...where.value);
                }
                else if (where.operator === 'NULL') {
                    sql += `${connector}${where.column} IS NULL`;
                }
                else if (where.operator === 'NOT NULL') {
                    sql += `${connector}${where.column} IS NOT NULL`;
                }
                else if (where.operator === 'BETWEEN') {
                    sql += `${connector}${where.column} BETWEEN ? AND ?`;
                    params.push(where.value[0], where.value[1]);
                }
                else if (where.operator === 'NOT BETWEEN') {
                    sql += `${connector}${where.column} NOT BETWEEN ? AND ?`;
                    params.push(where.value[0], where.value[1]);
                }
                else {
                    sql += `${connector}${where.column} ${where.operator} ?`;
                    params.push(where.value);
                }
            });
        }
        // Ajouter les GROUP BYs
        if (this._groups.length > 0) {
            sql += ` GROUP BY ${this._groups.join(', ')}`;
        }
        // Ajouter les HAVINGs
        if (this._havings.length > 0) {
            sql += ' HAVING';
            this._havings.forEach((having, index) => {
                const connector = index === 0 ? ' ' : ` ${having.boolean} `;
                sql += `${connector}${having.column} ${having.operator} ?`;
                params.push(having.value);
            });
        }
        // Ajouter les ORDER BYs
        if (this._orders.length > 0) {
            const orderClauses = this._orders.map(order => `${order.column} ${order.direction}`);
            sql += ` ORDER BY ${orderClauses.join(', ')}`;
        }
        // Ajouter LIMIT et OFFSET
        if (this._limit !== null) {
            sql += ` LIMIT ?`;
            params.push(this._limit);
            if (this._offset !== null) {
                sql += ` OFFSET ?`;
                params.push(this._offset);
            }
        }
        return { sql, params };
    }
    /**
     * Exécuter la requête et retourner tous les résultats
     */
    async get() {
        const { sql, params } = this.buildQuery();
        const results = await DB_1.DB.select(sql, params);
        // Créer des instances de modèle à partir des résultats
        const models = results.map(result => {
            const model = new this._modelClass();
            model.fill(result);
            model.exists = true; // Utilisation de cast pour accéder à la propriété protégée
            return model;
        });
        // Créer une collection
        const collection = new Collection_1.Collection(models);
        // Charger les relations si nécessaire
        if (this._relations.length > 0) {
            await this.loadRelations(collection);
        }
        return collection;
    }
    /**
     * Exécuter la requête et retourner le premier résultat
     */
    async first() {
        const original = this._limit;
        this.limit(1);
        const results = await this.get();
        this._limit = original;
        return results.first() || null;
    }
    /**
     * Trouver un modèle par sa clé primaire
     */
    async find(id) {
        return this.where('id', id).first();
    }
    /**
     * Compter le nombre de résultats
     */
    async count(column = '*') {
        const original = [...this._selects];
        this._selects = [`COUNT(${column}) as count`];
        const { sql, params } = this.buildQuery();
        const results = await DB_1.DB.select(sql, params);
        this._selects = original;
        return results[0]?.count || 0;
    }
    /**
     * Vérifier si des résultats existent
     */
    async exists() {
        return (await this.count()) > 0;
    }
    /**
     * Mettre à jour des enregistrements
     */
    async update(data) {
        const { sql: whereSql, params: whereParams } = this.buildWhereClause();
        return DB_1.DB.update(this._table, data, whereSql, whereParams);
    }
    /**
     * Supprimer des enregistrements
     */
    async delete() {
        const { sql: whereSql, params: whereParams } = this.buildWhereClause();
        return DB_1.DB.delete(this._table, whereSql, whereParams);
    }
    /**
     * Construire uniquement la clause WHERE
     */
    buildWhereClause() {
        let sql = '1=1'; // Clause par défaut pour éviter les erreurs si aucun WHERE
        const params = [];
        if (this._wheres.length > 0) {
            sql = '';
            this._wheres.forEach((where, index) => {
                const connector = index === 0 ? '' : ` ${where.boolean} `;
                if (where.operator === 'IN' || where.operator === 'NOT IN') {
                    const placeholders = Array(where.value.length).fill('?').join(', ');
                    sql += `${connector}${where.column} ${where.operator} (${placeholders})`;
                    params.push(...where.value);
                }
                else if (where.operator === 'NULL') {
                    sql += `${connector}${where.column} IS NULL`;
                }
                else if (where.operator === 'NOT NULL') {
                    sql += `${connector}${where.column} IS NOT NULL`;
                }
                else if (where.operator === 'BETWEEN') {
                    sql += `${connector}${where.column} BETWEEN ? AND ?`;
                    params.push(where.value[0], where.value[1]);
                }
                else if (where.operator === 'NOT BETWEEN') {
                    sql += `${connector}${where.column} NOT BETWEEN ? AND ?`;
                    params.push(where.value[0], where.value[1]);
                }
                else {
                    sql += `${connector}${where.column} ${where.operator} ?`;
                    params.push(where.value);
                }
            });
        }
        return { sql, params };
    }
    /**
     * Charger les relations pour une collection de modèles
     */
    async loadRelations(collection) {
        if (collection.isEmpty()) {
            return;
        }
        for (const relation of this._relations) {
            const relationName = relation.split('.')[0];
            // Vérifier si la collection n'est pas vide et si la méthode de relation existe
            const firstModel = collection.first();
            if (!firstModel || typeof firstModel[relationName] !== 'function') {
                console.warn(`La relation "${relationName}" n'existe pas sur le modèle ${this._modelClass.name}`);
                continue;
            }
            // Obtenir l'instance de relation
            const relationKey = relationName;
            // Utiliser une signature de fonction spécifique au lieu de Function
            const relationFunction = firstModel[relationKey];
            const relationInstance = relationFunction.call(firstModel);
            // Charger la relation pour tous les modèles de la collection
            await relationInstance.loadForCollection(collection, relation);
        }
    }
}
exports.Query = Query;
