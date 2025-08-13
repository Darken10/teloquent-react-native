/**
 * Déclarations de types pour Jest dans l'environnement global
 */
import '@types/jest';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInstanceOf(expected: any): R;
      toHaveProperty(property: string, value?: any): R;
    }
  }
}
