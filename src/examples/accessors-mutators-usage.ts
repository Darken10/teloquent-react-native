/**
 * Exemple d'utilisation des accesseurs et mutateurs dans Teloquent
 */
import { Teloquent, Model } from '../index';
import * as SQLite from 'expo-sqlite';

// Initialisation de la connexion
Teloquent.initialize({
  driver: 'expo',
  database: SQLite.openDatabase('accessors_mutators_example.db')
});

// Définition du modèle User avec accesseurs et mutateurs
class User extends Model {
  declare id: number;
  declare first_name: string;
  declare last_name: string;
  declare email: string;
  declare birth_date: string;
  declare preferences: string; // Stocké en JSON
  
  // Accesseur pour obtenir le nom complet
  get fullName(): string {
    return `${this.first_name} ${this.last_name}`;
  }
  
  // Mutateur pour définir le nom complet
  set fullName(value: string) {
    const parts = value.split(' ');
    this.first_name = parts[0] || '';
    this.last_name = parts.slice(1).join(' ') || '';
  }
  
  // Accesseur pour transformer la date de naissance en objet Date
  get birthDate(): Date {
    return new Date(this.birth_date);
  }
  
  // Mutateur pour transformer l'objet Date en chaîne
  set birthDate(value: Date) {
    this.birth_date = value.toISOString().split('T')[0];
  }
  
  // Accesseur pour transformer les préférences JSON en objet
  get userPreferences(): Record<string, any> {
    try {
      return JSON.parse(this.preferences || '{}');
    } catch (e) {
      return {};
    }
  }
  
  // Mutateur pour transformer l'objet de préférences en JSON
  set userPreferences(value: Record<string, any>) {
    this.preferences = JSON.stringify(value);
  }
  
  // Accesseur pour calculer l'âge à partir de la date de naissance
  get age(): number {
    const today = new Date();
    const birthDate = new Date(this.birth_date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
  
  // Méthode pour formater l'email en majuscules (accesseur personnalisé)
  getEmailAttribute(value: string): string {
    return value.toLowerCase();
  }
  
  // Méthode pour formater le nom en majuscules (mutateur personnalisé)
  setFirstNameAttribute(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
  
  // Méthode pour formater le nom de famille en majuscules (mutateur personnalisé)
  setLastNameAttribute(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
}

// Exemple d'utilisation
async function runExample() {
  try {
    // Créer la table users
    await Teloquent.schema.createTable('users', (table) => {
      table.increments('id');
      table.string('first_name');
      table.string('last_name');
      table.string('email');
      table.date('birth_date');
      table.text('preferences');
      table.timestamps();
    });
    
    // Créer un utilisateur avec des accesseurs et mutateurs
    const user = new User();
    user.first_name = 'jean'; // Sera transformé en 'Jean'
    user.last_name = 'DUPONT'; // Sera transformé en 'Dupont'
    user.email = 'JEAN.DUPONT@EXAMPLE.COM'; // Sera transformé en minuscules
    user.birth_date = '1990-05-15';
    user.userPreferences = {
      theme: 'dark',
      notifications: true,
      language: 'fr'
    };
    await user.save();
    
    console.log(`Utilisateur créé: ${user.fullName}`);
    console.log(`Email: ${user.email}`);
    console.log(`Date de naissance: ${user.birth_date}`);
    console.log(`Âge: ${user.age} ans`);
    console.log(`Préférences: ${JSON.stringify(user.userPreferences, null, 2)}`);
    
    // Utiliser le mutateur de nom complet
    user.fullName = 'Marie Martin';
    console.log(`Nouveau nom: ${user.fullName}`);
    console.log(`Prénom: ${user.first_name}`);
    console.log(`Nom: ${user.last_name}`);
    
    // Utiliser le mutateur de date de naissance
    user.birthDate = new Date('1985-10-20');
    console.log(`Nouvelle date de naissance: ${user.birth_date}`);
    console.log(`Nouvel âge: ${user.age} ans`);
    
    // Mettre à jour les préférences
    const prefs = user.userPreferences;
    prefs.theme = 'light';
    prefs.notifications = false;
    user.userPreferences = prefs;
    
    await user.save();
    console.log(`Préférences mises à jour: ${JSON.stringify(user.userPreferences, null, 2)}`);
    
    // Récupérer l'utilisateur depuis la base de données
    const savedUser = await User.find(user.id);
    if (savedUser) {
      console.log(`Utilisateur récupéré: ${savedUser.fullName}`);
      console.log(`Préférences récupérées: ${JSON.stringify(savedUser.userPreferences, null, 2)}`);
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Exécuter l'exemple
runExample();
