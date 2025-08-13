import { Model } from './Model';

export declare class Collection<T extends Model = Model> {
  items: T[];
  constructor(items?: T[]);
  toJson(): Record<string, unknown>[];
  // Ajoutez d'autres méthodes selon les besoins
}
