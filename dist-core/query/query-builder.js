"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = void 0;
/**
 * Interface pour le constructeur de requêtes
 */
class QueryBuilder {
    /**
     * Constructeur
     * @param table Nom de la table
     * @param model Classe du modèle associé
     */
    constructor(table, model) {
        /**
         * Conditions WHERE de la requête
         */
        this.wheres = [];
        /**
         * Clauses ORDER BY de la requête
         */
        this.orders = [];
        /**
         * Limite de résultats
         */
        this.limitValue = null;
        /**
         * Décalage des résultats
         */
        this.offsetValue = null;
        /**
         * Colonnes à sélectionner
         */
        this.columns = ['*'];
        /**
         * Jointures de la requête
         */
        this.joins = [];
        /**
         * Groupements de la requête
         */
        this.groups = [];
        /**
         * Conditions HAVING de la requête
         */
        this.havings = [];
        this.table = table;
        this.model = model;
    }
    /**
     * Ajoute une condition WHERE à la requête
     * @param column Nom de la colonne
     * @param operator Opérateur de comparaison
     * @param value Valeur à comparer
     */
    where(column, operator, value) {
        // Si seulement 2 arguments sont fournis, utiliser '=' comme opérateur
        if (value === undefined) {
            value = operator;
            operator = '=';
        }
        this.wheres.push({
            column,
            operator,
            value,
            boolean: 'and'
        });
        return this;
    }
    /**
     * Ajoute une condition WHERE OR à la requête
     * @param column Nom de la colonne
     * @param operator Opérateur de comparaison
     * @param value Valeur à comparer
     */
    orWhere(column, operator, value) {
        // Si seulement 2 arguments sont fournis, utiliser '=' comme opérateur
        if (value === undefined) {
            value = operator;
            operator = '=';
        }
        this.wheres.push({
            column,
            operator,
            value,
            boolean: 'or'
        });
        return this;
    }
    /**
     * Ajoute une clause ORDER BY à la requête
     * @param column Nom de la colonne
     * @param direction Direction du tri (asc ou desc)
     */
    orderBy(column, direction = 'asc') {
        this.orders.push({
            column,
            direction
        });
        return this;
    }
    /**
     * Limite le nombre de résultats
     * @param limit Nombre maximum de résultats
     */
    limit(limit) {
        this.limitValue = limit;
        return this;
    }
    /**
     * Décale les résultats
     * @param offset Nombre de résultats à sauter
     */
    offset(offset) {
        this.offsetValue = offset;
        return this;
    }
    /**
     * Spécifie les colonnes à sélectionner
     * @param columns Colonnes à sélectionner
     */
    select(...columns) {
        this.columns = columns.length > 0 ? columns : ['*'];
        return this;
    }
    /**
     * Ajoute une jointure à la requête
     * @param table Table à joindre
     * @param first Première colonne de la condition de jointure
     * @param operator Opérateur de comparaison
     * @param second Seconde colonne de la condition de jointure
     * @param type Type de jointure (inner, left, right, etc.)
     */
    join(table, first, operator, second, type = 'inner') {
        this.joins.push({
            table,
            first,
            operator,
            second,
            type
        });
        return this;
    }
    /**
     * Ajoute une jointure LEFT à la requête
     * @param table Table à joindre
     * @param first Première colonne de la condition de jointure
     * @param operator Opérateur de comparaison
     * @param second Seconde colonne de la condition de jointure
     */
    leftJoin(table, first, operator, second) {
        return this.join(table, first, operator, second, 'left');
    }
    /**
     * Ajoute une clause GROUP BY à la requête
     * @param columns Colonnes pour le groupement
     */
    groupBy(...columns) {
        this.groups = [...this.groups, ...columns];
        return this;
    }
    /**
     * Ajoute une condition HAVING à la requête
     * @param column Nom de la colonne
     * @param operator Opérateur de comparaison
     * @param value Valeur à comparer
     */
    having(column, operator, value) {
        // Si seulement 2 arguments sont fournis, utiliser '=' comme opérateur
        if (value === undefined) {
            value = operator;
            operator = '=';
        }
        this.havings.push({
            column,
            operator,
            value,
            boolean: 'and'
        });
        return this;
    }
    /**
     * Récupère le premier résultat de la requête
     */
    async first() {
        const results = await this.limit(1).get();
        return results.length > 0 ? results[0] : null;
    }
    /**
     * Récupère le premier résultat de la requête ou lance une exception
     */
    async firstOrFail() {
        const model = await this.first();
        if (!model) {
            throw new Error('Model not found');
        }
        return model;
    }
    /**
     * Récupère tous les résultats de la requête
     */
    async get() {
        // Cette méthode serait implémentée dans la classe concrète
        // Ici, nous retournons juste un tableau vide pour la déclaration de type
        return [];
    }
    /**
     * Compte le nombre de résultats
     */
    async count() {
        // Cette méthode serait implémentée dans la classe concrète
        return 0;
    }
    /**
     * Insère un nouvel enregistrement
     * @param values Valeurs à insérer
     */
    async insert(values) {
        // Cette méthode serait implémentée dans la classe concrète
        return 0;
    }
    /**
     * Met à jour des enregistrements
     * @param values Valeurs à mettre à jour
     */
    async update(values) {
        // Cette méthode serait implémentée dans la classe concrète
        return 0;
    }
    /**
     * Supprime des enregistrements
     */
    async delete() {
        // Cette méthode serait implémentée dans la classe concrète
        return 0;
    }
    /**
     * Vérifie si des enregistrements existent
     */
    async exists() {
        // Cette méthode serait implémentée dans la classe concrète
        return (await this.count()) > 0;
    }
    /**
     * Génère la requête SQL
     */
    toSql() {
        // Cette méthode serait implémentée dans la classe concrète
        return '';
    }
    /**
     * Obtient les paramètres de la requête
     */
    getBindings() {
        // Cette méthode serait implémentée dans la classe concrète
        return [];
    }
}
exports.QueryBuilder = QueryBuilder;
