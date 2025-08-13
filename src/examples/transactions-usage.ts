/**
 * Exemple d'utilisation des transactions dans Teloquent
 */
import { Teloquent, Model, DB } from '../index';
import * as SQLite from 'expo-sqlite';

// Initialisation de la connexion
Teloquent.initialize({
  driver: 'expo',
  database: SQLite.openDatabase('transactions_example.db')
});

// Définition des modèles
class Account extends Model {
  declare id: number;
  declare user_id: number;
  declare balance: number;
  declare currency: string;
  
  user() {
    return this.belongsTo(User);
  }
  
  transactions() {
    return this.hasMany(Transaction);
  }
}

class User extends Model {
  declare id: number;
  declare name: string;
  declare email: string;
  
  accounts() {
    return this.hasMany(Account);
  }
}

class Transaction extends Model {
  declare id: number;
  declare account_id: number;
  declare amount: number;
  declare type: 'deposit' | 'withdrawal' | 'transfer';
  declare reference: string;
  declare created_at: string;
  
  account() {
    return this.belongsTo(Account);
  }
}

// Fonction pour effectuer un transfert entre deux comptes
async function transferFunds(
  fromAccountId: number, 
  toAccountId: number, 
  amount: number,
  reference: string
): Promise<boolean> {
  // Utiliser une transaction pour garantir l'atomicité
  return await DB.transaction(async (trx) => {
    try {
      // Récupérer les comptes avec verrouillage pour éviter les conditions de concurrence
      const fromAccount = await Account.query()
        .where('id', '=', fromAccountId)
        .first();
      
      const toAccount = await Account.query()
        .where('id', '=', toAccountId)
        .first();
      
      // Vérifier que les comptes existent
      if (!fromAccount || !toAccount) {
        throw new Error('Un ou plusieurs comptes n\'existent pas');
      }
      
      // Vérifier que le compte source a suffisamment de fonds
      if (fromAccount.balance < amount) {
        throw new Error('Solde insuffisant');
      }
      
      // Vérifier que les devises sont compatibles
      if (fromAccount.currency !== toAccount.currency) {
        throw new Error('Les devises ne correspondent pas');
      }
      
      // Mettre à jour le solde du compte source
      fromAccount.balance -= amount;
      await fromAccount.save();
      
      // Enregistrer la transaction de retrait
      const withdrawalTx = new Transaction();
      withdrawalTx.account_id = fromAccountId;
      withdrawalTx.amount = -amount;
      withdrawalTx.type = 'transfer';
      withdrawalTx.reference = reference;
      await withdrawalTx.save();
      
      // Mettre à jour le solde du compte destination
      toAccount.balance += amount;
      await toAccount.save();
      
      // Enregistrer la transaction de dépôt
      const depositTx = new Transaction();
      depositTx.account_id = toAccountId;
      depositTx.amount = amount;
      depositTx.type = 'transfer';
      depositTx.reference = reference;
      await depositTx.save();
      
      // La transaction est automatiquement validée si aucune erreur n'est levée
      return true;
    } catch (error) {
      // En cas d'erreur, la transaction est automatiquement annulée
      console.error('Erreur lors du transfert:', error);
      throw error; // Propager l'erreur pour que la transaction soit annulée
    }
  });
}

// Exemple d'utilisation des transactions
async function runExample() {
  try {
    // Créer les tables
    await Teloquent.schema.createTable('users', (table) => {
      table.increments('id');
      table.string('name');
      table.string('email').unique();
      table.timestamps();
    });
    
    await Teloquent.schema.createTable('accounts', (table) => {
      table.increments('id');
      table.integer('user_id').unsigned();
      table.decimal('balance', 10, 2).defaultTo(0);
      table.string('currency', 3).defaultTo('EUR');
      table.foreign('user_id').references('id').on('users');
      table.timestamps();
    });
    
    await Teloquent.schema.createTable('transactions', (table) => {
      table.increments('id');
      table.integer('account_id').unsigned();
      table.decimal('amount', 10, 2);
      table.enum('type', ['deposit', 'withdrawal', 'transfer']);
      table.string('reference');
      table.foreign('account_id').references('id').on('accounts');
      table.timestamps();
    });
    
    // Créer un utilisateur
    const user = new User();
    user.name = 'Jean Dupont';
    user.email = 'jean@example.com';
    await user.save();
    
    // Créer deux comptes pour l'utilisateur
    const account1 = new Account();
    account1.user_id = user.id;
    account1.balance = 1000;
    account1.currency = 'EUR';
    await account1.save();
    
    const account2 = new Account();
    account2.user_id = user.id;
    account2.balance = 500;
    account2.currency = 'EUR';
    await account2.save();
    
    console.log(`Solde initial du compte 1: ${account1.balance} ${account1.currency}`);
    console.log(`Solde initial du compte 2: ${account2.balance} ${account2.currency}`);
    
    // Effectuer un transfert entre les comptes
    await transferFunds(
      account1.id, 
      account2.id, 
      300, 
      'Transfert entre comptes'
    );
    
    // Recharger les comptes pour voir les soldes mis à jour
    const updatedAccount1 = await Account.find(account1.id);
    const updatedAccount2 = await Account.find(account2.id);
    
    console.log(`Nouveau solde du compte 1: ${updatedAccount1?.balance} ${updatedAccount1?.currency}`);
    console.log(`Nouveau solde du compte 2: ${updatedAccount2?.balance} ${updatedAccount2?.currency}`);
    
    // Afficher l'historique des transactions
    const transactions = await Transaction.query()
      .orderBy('created_at', 'desc')
      .get();
    
    console.log('Historique des transactions:');
    transactions.forEach(tx => {
      console.log(`- ${tx.type}: ${tx.amount} (Réf: ${tx.reference})`);
    });
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Exécuter l'exemple
runExample();
