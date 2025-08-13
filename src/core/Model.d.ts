import { Collection } from './Collection';
import { Query } from './Query';
import { ModelAttributes } from '../types/model';

export declare class Model {
  // Propriétés requises
  attributes: ModelAttributes;
  original: ModelAttributes;
  changes: ModelAttributes;
  relations: Record<string, Model | Collection<Model>>;
  exists: boolean;
  visible: string[];
  hidden: string[];
  appends: string[];
  primaryKey: string;
  casts: Record<string, string>;
  dates: string[];
  fillable: string[];
  guarded: string[];
  fill: string[];
  
  // Méthodes statiques
  static getTable(): string;
  static getPrimaryKey(): string;
  static query<T extends Model>(this: ModelClass<T>): Query<T>;
  static find<T extends Model>(this: ModelClass<T>, id: string | number): Promise<T | null>;
  static create<T extends Model>(this: ModelClass<T>, attributes: ModelAttributes): Promise<T>;
  static where<T extends Model>(
    this: ModelClass<T>,
    column: string,
    operator: string | number | boolean | null | undefined,
    value?: string | number | boolean | null | undefined
  ): Query<T>;
  static with<T extends Model>(this: ModelClass<T>, ...relations: string[]): Query<T>;
  
  // Méthodes d'instance
  constructor(attributes?: ModelAttributes);
  getAttribute(key: string): string | number | boolean | null | undefined | Date | object | (string | number | boolean | null | undefined | Date | object)[];
  setAttribute(key: string, value: string | number | boolean | null | undefined | Date | object | (string | number | boolean | null | undefined | Date | object)[]): void;
  castAttribute(key: string, value: string | number | boolean | null | undefined | Date | object | (string | number | boolean | null | undefined | Date | object)[]): string | number | boolean | null | undefined | Date | object | (string | number | boolean | null | undefined | Date | object)[];
  getKey(): string | number | boolean | null | undefined | Date | object | (string | number | boolean | null | undefined | Date | object)[];
  isNew(): boolean;
  isDirty(): boolean;
  performInsert(): Promise<boolean>;
  performUpdate(): Promise<boolean>;
  fireEvent(event: string): Promise<void>;
  save(): Promise<boolean>;
  delete(): Promise<boolean>;
  refresh(): Promise<this>;
  toJson(): Record<string, string | number | boolean | null | undefined | Date | object | (string | number | boolean | null | undefined | Date | object)[] | Record<string, unknown>>;
  get(key: string): string | number | boolean | null | undefined | Date | object | (string | number | boolean | null | undefined | Date | object)[];
  set(key: string, value: string | number | boolean | null | undefined | Date | object | (string | number | boolean | null | undefined | Date | object)[]): void;
  hasOne<T extends Model>(relatedModel: new () => T, foreignKey?: string, localKey?: string): any;
  hasMany<T extends Model>(relatedModel: new () => T, foreignKey?: string, localKey?: string): any;
  belongsTo<T extends Model>(relatedModel: new () => T, foreignKey?: string, ownerKey?: string): any;
  belongsToMany<T extends Model>(relatedModel: new () => T, pivotTable?: string, foreignPivotKey?: string, relatedPivotKey?: string, parentKey?: string, relatedKey?: string): any;
}

export type ModelClass<T extends Model> = {
  new(): T;
  getTable(): string;
  getPrimaryKey(): string;
  query<T extends Model>(this: ModelClass<T>): Query<T>;
  find<T extends Model>(this: ModelClass<T>, id: string | number): Promise<T | null>;
  create<T extends Model>(this: ModelClass<T>, attributes: ModelAttributes): Promise<T>;
};
