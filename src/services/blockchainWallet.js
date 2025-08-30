
/**
 * 💼 Portefeuille Blockchain
 * Gestion sécurisée des clés et transactions
 */

const crypto = require('crypto');

class BlockchainWallet {
  constructor() {
    this.wallets = new Map();
    this.transactions = new Map();
  }

  async createWallet(userId) {
    try {
      // Génération de clés sécurisées
      const privateKey = crypto.randomBytes(32).toString('hex');
      const publicKey = crypto.createHash('sha256').update(privateKey).digest('hex');
      const address = '0x' + publicKey.substring(0, 40);
      
      const wallet = {
        userId,
        address,
        publicKey,
        privateKey: this.encryptPrivateKey(privateKey),
        balance: 0,
        createdAt: new Date(),
        isActive: true
      };
      
      this.wallets.set(userId, wallet);
      console.log('✅ Portefeuille créé:', address);
      return wallet;
    } catch (error) {
      console.error('Erreur création portefeuille:', error);
      throw error;
    }
  }

  encryptPrivateKey(privateKey) {
    // Chiffrement simple (en production, utiliser une méthode plus sécurisée)
    return Buffer.from(privateKey).toString('base64');
  }

  decryptPrivateKey(encryptedKey) {
    return Buffer.from(encryptedKey, 'base64').toString();
  }

  async getWallet(userId) {
    return this.wallets.get(userId);
  }

  async sendTransaction(fromUserId, toAddress, amount, gasPrice = '0.0000001') {
    try {
      const fromWallet = this.wallets.get(fromUserId);
      if (!fromWallet || fromWallet.balance < amount) {
        throw new Error('Solde insuffisant');
      }
      
      const transaction = {
        id: Date.now(),
        from: fromWallet.address,
        to: toAddress,
        amount,
        gasPrice,
        timestamp: new Date(),
        status: 'pending'
      };
      
      // Simulation de transaction blockchain
      fromWallet.balance -= amount;
      transaction.status = 'completed';
      
      this.transactions.set(transaction.id, transaction);
      console.log('✅ Transaction envoyée:', amount, 'GHT');
      return transaction;
    } catch (error) {
      console.error('Erreur transaction:', error);
      throw error;
    }
  }

  async getTransactionHistory(userId) {
    const wallet = this.wallets.get(userId);
    if (!wallet) return [];
    
    return Array.from(this.transactions.values())
      .filter(tx => tx.from === wallet.address || tx.to === wallet.address)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  async getWalletBalance(userId) {
    const wallet = this.wallets.get(userId);
    return wallet ? wallet.balance : 0;
  }
}

module.exports = BlockchainWallet;
