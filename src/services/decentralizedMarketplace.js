
/**
 * 🏪 Marketplace Décentralisé
 * Système de trading NFT avec smart contracts
 */

class DecentralizedMarketplace {
  constructor() {
    this.listings = new Map();
    this.orders = new Map();
    this.transactions = new Map();
    this.fees = {
      listing: 0.025, // 2.5%
      transaction: 0.025, // 2.5%
      royalty: 0.05 // 5%
    };
  }

  async createListing(sellerId, nftId, price, duration = 7) {
    try {
      const listingId = Date.now().toString();
      const listing = {
        id: listingId,
        sellerId,
        nftId,
        price,
        originalPrice: price,
        duration,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        views: 0
      };
      
      this.listings.set(listingId, listing);
      console.log('✅ Listing créé:', listingId, 'prix:', price, 'GHT');
      return listing;
    } catch (error) {
      console.error('Erreur création listing:', error);
      throw error;
    }
  }

  async placeBid(buyerId, listingId, bidAmount) {
    try {
      const listing = this.listings.get(listingId);
      if (!listing || listing.status !== 'active') {
        throw new Error('Listing non disponible');
      }
      
      if (bidAmount <= listing.price) {
        throw new Error('Enchère trop basse');
      }
      
      const bid = {
        id: Date.now().toString(),
        buyerId,
        listingId,
        amount: bidAmount,
        timestamp: new Date(),
        status: 'active'
      };
      
      listing.bids.push(bid);
      listing.price = bidAmount;
      
      console.log('✅ Enchère placée:', bidAmount, 'GHT');
      return bid;
    } catch (error) {
      console.error('Erreur placement enchère:', error);
      throw error;
    }
  }

  async executeTransaction(buyerId, listingId, transactionType = 'buy') {
    try {
      const listing = this.listings.get(listingId);
      if (!listing) {
        throw new Error('Listing non trouvé');
      }
      
      const transaction = {
        id: Date.now().toString(),
        buyerId,
        sellerId: listing.sellerId,
        nftId: listing.nftId,
        amount: listing.price,
        fees: listing.price * this.fees.transaction,
        type: transactionType,
        timestamp: new Date(),
        status: 'completed'
      };
      
      listing.status = 'sold';
      this.transactions.set(transaction.id, transaction);
      
      console.log('✅ Transaction exécutée:', transaction.amount, 'GHT');
      return transaction;
    } catch (error) {
      console.error('Erreur transaction:', error);
      throw error;
    }
  }

  async getActiveListings() {
    return Array.from(this.listings.values())
      .filter(listing => listing.status === 'active' && listing.expiresAt > new Date());
  }

  async getMarketplaceStats() {
    const activeListings = this.getActiveListings();
    const totalVolume = Array.from(this.transactions.values())
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    return {
      activeListings: activeListings.length,
      totalVolume,
      totalTransactions: this.transactions.size,
      averagePrice: activeListings.length > 0 ? 
        activeListings.reduce((sum, listing) => sum + listing.price, 0) / activeListings.length : 0
    };
  }
}

module.exports = DecentralizedMarketplace;
