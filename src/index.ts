/**
 * Teloquent React Native - Un ORM TypeScript pour React Native inspiré d'Eloquent de Laravel
 */

// Configuration et initialisation
export { Teloquent } from './core/Teloquent';

// Classes principales
export { Model } from './core/Model';
export { Collection } from './core/Collection';
export { Query } from './core/Query';
export { Schema } from './schema/Schema';
export { Migration } from './schema/Migration';
export { Blueprint } from './schema/Blueprint';

// Relations
export { Relation } from './relations/Relation';
export { HasOne } from './relations/HasOne';
export { HasMany } from './relations/HasMany';
export { BelongsTo } from './relations/BelongsTo';
export { BelongsToMany } from './relations/BelongsToMany';

// Types
export * from './types';
export * from './types/migration';

// Utilitaires
export { pluralize, singularize, camelize, snakeCase, kebabCase, pascalCase } from './utils/inflector';
export { DB } from './core/DB';
