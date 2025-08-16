"use strict";
/**
 * Teloquent React Native - Un ORM TypeScript pour React Native inspiré d'Eloquent de Laravel
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB = exports.pascalCase = exports.kebabCase = exports.snakeCase = exports.camelize = exports.singularize = exports.pluralize = exports.BelongsToMany = exports.BelongsTo = exports.HasMany = exports.HasOne = exports.Relation = exports.Blueprint = exports.Migration = exports.Schema = exports.Query = exports.Collection = exports.Model = exports.Teloquent = void 0;
// Configuration et initialisation
var Teloquent_1 = require("./core/Teloquent");
Object.defineProperty(exports, "Teloquent", { enumerable: true, get: function () { return Teloquent_1.Teloquent; } });
// Classes principales
var Model_1 = require("./core/Model");
Object.defineProperty(exports, "Model", { enumerable: true, get: function () { return Model_1.Model; } });
var Collection_1 = require("./core/Collection");
Object.defineProperty(exports, "Collection", { enumerable: true, get: function () { return Collection_1.Collection; } });
var Query_1 = require("./core/Query");
Object.defineProperty(exports, "Query", { enumerable: true, get: function () { return Query_1.Query; } });
var Schema_1 = require("./schema/Schema");
Object.defineProperty(exports, "Schema", { enumerable: true, get: function () { return Schema_1.Schema; } });
var Migration_1 = require("./schema/Migration");
Object.defineProperty(exports, "Migration", { enumerable: true, get: function () { return Migration_1.Migration; } });
var Blueprint_1 = require("./schema/Blueprint");
Object.defineProperty(exports, "Blueprint", { enumerable: true, get: function () { return Blueprint_1.Blueprint; } });
// Relations
var Relation_1 = require("./relations/Relation");
Object.defineProperty(exports, "Relation", { enumerable: true, get: function () { return Relation_1.Relation; } });
var HasOne_1 = require("./relations/HasOne");
Object.defineProperty(exports, "HasOne", { enumerable: true, get: function () { return HasOne_1.HasOne; } });
var HasMany_1 = require("./relations/HasMany");
Object.defineProperty(exports, "HasMany", { enumerable: true, get: function () { return HasMany_1.HasMany; } });
var BelongsTo_1 = require("./relations/BelongsTo");
Object.defineProperty(exports, "BelongsTo", { enumerable: true, get: function () { return BelongsTo_1.BelongsTo; } });
var BelongsToMany_1 = require("./relations/BelongsToMany");
Object.defineProperty(exports, "BelongsToMany", { enumerable: true, get: function () { return BelongsToMany_1.BelongsToMany; } });
// Types
__exportStar(require("./types"), exports);
__exportStar(require("./types/migration"), exports);
// Utilitaires
var inflector_1 = require("./utils/inflector");
Object.defineProperty(exports, "pluralize", { enumerable: true, get: function () { return inflector_1.pluralize; } });
Object.defineProperty(exports, "singularize", { enumerable: true, get: function () { return inflector_1.singularize; } });
Object.defineProperty(exports, "camelize", { enumerable: true, get: function () { return inflector_1.camelize; } });
Object.defineProperty(exports, "snakeCase", { enumerable: true, get: function () { return inflector_1.snakeCase; } });
Object.defineProperty(exports, "kebabCase", { enumerable: true, get: function () { return inflector_1.kebabCase; } });
Object.defineProperty(exports, "pascalCase", { enumerable: true, get: function () { return inflector_1.pascalCase; } });
var DB_1 = require("./core/DB");
Object.defineProperty(exports, "DB", { enumerable: true, get: function () { return DB_1.DB; } });
