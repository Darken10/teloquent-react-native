/**
 * Classe Migration pour gérer les migrations de base de données
 */
import { DB } from '../core/DB';
import { Schema } from './Schema';
import { MigrationOptions } from '../types';

export class Migration {
  protected static migrationsTable = 'migrations';
  protected static migrations: MigrationOptions[] = [];

  /**
   * Initialiser la table des migrations
   */
  public static async initialize(): Promise<void> {
    // Vérifier si la table des migrations existe
    const tableExists = await Schema.hasTable(this.migrationsTable);
    
    if (!tableExists) {
      // Créer la table des migrations
      await Schema.createTable(this.migrationsTable, (table) => {
        table.increments('id');
        table.string('name');
        table.integer('batch');
        table.timestamps();
      });
    }
  }

  /**
   * Enregistrer une migration
   */
  public static register(migration: MigrationOptions): void {
    this.migrations.push(migration);
  }

  /**
   * Exécuter les migrations
   */
  public static async migrate(): Promise<void> {
    await this.initialize();
    
    // Obtenir les migrations déjà exécutées
    const executedMigrations = await this.getExecutedMigrations();
    const executedNames = executedMigrations.map(m => m.name);
    
    // Filtrer les migrations non exécutées
    const pendingMigrations = this.migrations.filter(m => !executedNames.includes(m.name));
    
    if (pendingMigrations.length === 0) {
      console.log('Aucune migration en attente.');
      return;
    }
    
    // Obtenir le dernier numéro de batch
    const lastBatch = executedMigrations.length > 0
      ? Math.max(...executedMigrations.map(m => m.batch))
      : 0;
    
    const currentBatch = lastBatch + 1;
    
    // Exécuter les migrations en attente
    for (const migration of pendingMigrations) {
      try {
        console.log(`Migration: ${migration.name}`);
        
        // Exécuter la méthode up de la migration
        await migration.up(Schema);
        
        // Enregistrer la migration comme exécutée
        await this.logMigration(migration.name, currentBatch);
        
        console.log(`Migration terminée: ${migration.name}`);
      } catch (error) {
        console.error(`Erreur lors de la migration ${migration.name}:`, error);
        throw error;
      }
    }
    
    console.log(`${pendingMigrations.length} migrations exécutées.`);
  }

  /**
   * Annuler les migrations
   */
  public static async rollback(steps: number = 1): Promise<void> {
    await this.initialize();
    
    // Obtenir les migrations exécutées
    const executedMigrations = await this.getExecutedMigrations();
    
    if (executedMigrations.length === 0) {
      console.log('Aucune migration à annuler.');
      return;
    }
    
    // Obtenir les batchs à annuler
    const batches = [...new Set(executedMigrations.map(m => m.batch))].sort((a, b) => b - a);
    const batchesToRollback = batches.slice(0, steps);
    
    // Filtrer les migrations à annuler
    const migrationsToRollback = executedMigrations
      .filter(m => batchesToRollback.includes(m.batch))
      .sort((a, b) => b.id - a.id); // Annuler dans l'ordre inverse
    
    if (migrationsToRollback.length === 0) {
      console.log('Aucune migration à annuler.');
      return;
    }
    
    // Annuler les migrations
    for (const executedMigration of migrationsToRollback) {
      // Trouver la migration correspondante
      const migration = this.migrations.find(m => m.name === executedMigration.name);
      
      if (!migration) {
        console.warn(`Migration ${executedMigration.name} introuvable, ignorée.`);
        continue;
      }
      
      try {
        console.log(`Annulation de la migration: ${migration.name}`);
        
        // Exécuter la méthode down de la migration
        await migration.down(Schema);
        
        // Supprimer la migration de la table
        await this.removeMigration(executedMigration.name);
        
        console.log(`Annulation terminée: ${migration.name}`);
      } catch (error) {
        console.error(`Erreur lors de l'annulation de la migration ${migration.name}:`, error);
        throw error;
      }
    }
    
    console.log(`${migrationsToRollback.length} migrations annulées.`);
  }

  /**
   * Réinitialiser toutes les migrations
   */
  public static async reset(): Promise<void> {
    await this.initialize();
    
    // Obtenir les migrations exécutées
    const executedMigrations = await this.getExecutedMigrations();
    
    if (executedMigrations.length === 0) {
      console.log('Aucune migration à réinitialiser.');
      return;
    }
    
    // Calculer le nombre de batchs à annuler
    const batches = [...new Set(executedMigrations.map(m => m.batch))];
    
    // Annuler toutes les migrations
    await this.rollback(batches.length);
    
    console.log('Toutes les migrations ont été réinitialisées.');
  }

  /**
   * Rafraîchir les migrations (reset + migrate)
   */
  public static async refresh(): Promise<void> {
    await this.reset();
    await this.migrate();
    
    console.log('Migrations rafraîchies.');
  }

  /**
   * Obtenir les migrations exécutées
   */
  protected static async getExecutedMigrations(): Promise<Array<{ id: number; name: string; batch: number }>> {
    try {
      const results = await DB.select(`SELECT * FROM ${this.migrationsTable} ORDER BY id ASC`);
      return results;
    } catch (error) {
      console.error('Erreur lors de la récupération des migrations exécutées:', error);
      return [];
    }
  }

  /**
   * Enregistrer une migration comme exécutée
   */
  protected static async logMigration(name: string, batch: number): Promise<void> {
    await DB.insert(this.migrationsTable, {
      name,
      batch,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Supprimer une migration de la table
   */
  protected static async removeMigration(name: string): Promise<void> {
    await DB.delete(this.migrationsTable, 'name = ?', [name]);
  }
}
