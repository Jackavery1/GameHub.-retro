
/**
 * 🎨 Système NFT Gaming
 * Création et gestion de NFTs de jeux rétro
 */

class NFTGamingSystem {
  constructor() {
    this.nfts = new Map();
    this.collections = new Map();
    this.metadata = new Map();
  }

  async createNFT(userId, gameId, type, metadata) {
    try {
      const nftId = Date.now().toString();
      const tokenId = this.generateTokenId();
      
      const nft = {
        id: nftId,
        tokenId,
        userId,
        gameId,
        type,
        metadata: {
          ...metadata,
          createdAt: new Date(),
          rarity: this.calculateRarity(metadata),
          edition: this.generateEdition(type)
        },
        ownership: {
          owner: userId,
          transferredAt: new Date(),
          previousOwners: []
        },
        status: 'minted'
      };
      
      this.nfts.set(nftId, nft);
      this.metadata.set(tokenId, nft.metadata);
      
      console.log('✅ NFT créé:', tokenId, 'pour', type);
      return nft;
    } catch (error) {
      console.error('Erreur création NFT:', error);
      throw error;
    }
  }

  generateTokenId() {
    return '0x' + Math.random().toString(16).substr(2, 40);
  }

  calculateRarity(metadata) {
    const rarityFactors = {
      gamePopularity: metadata.popularity || 50,
      editionSize: metadata.editionSize || 1000,
      specialFeatures: metadata.specialFeatures || 0
    };
    
    const rarityScore = (rarityFactors.gamePopularity * 0.4) + 
                       ((1000 - rarityFactors.editionSize) * 0.4) + 
                       (rarityFactors.specialFeatures * 0.2);
    
    if (rarityScore > 80) return 'legendary';
    if (rarityScore > 60) return 'epic';
    if (rarityScore > 40) return 'rare';
    return 'common';
  }

  generateEdition(type) {
    const editions = {
      'game': 'Classic Edition',
      'achievement': 'Achievement Badge',
      'record': 'Record Holder',
      'tournament': 'Tournament Winner'
    };
    
    return editions[type] || 'Standard Edition';
  }

  async transferNFT(nftId, fromUserId, toUserId) {
    try {
      const nft = this.nfts.get(nftId);
      if (!nft || nft.ownership.owner !== fromUserId) {
        throw new Error('NFT non trouvé ou propriétaire invalide');
      }
      
      nft.ownership.previousOwners.push({
        userId: nft.ownership.owner,
        transferredAt: nft.ownership.transferredAt
      });
      
      nft.ownership.owner = toUserId;
      nft.ownership.transferredAt = new Date();
      
      console.log('✅ NFT transféré:', nftId);
      return nft;
    } catch (error) {
      console.error('Erreur transfert NFT:', error);
      throw error;
    }
  }

  async getUserNFTs(userId) {
    return Array.from(this.nfts.values())
      .filter(nft => nft.ownership.owner === userId);
  }

  async getNFTMetadata(tokenId) {
    return this.metadata.get(tokenId);
  }

  async createCollection(name, description, creatorId) {
    try {
      const collectionId = Date.now().toString();
      const collection = {
        id: collectionId,
        name,
        description,
        creatorId,
        createdAt: new Date(),
        nftCount: 0,
        totalValue: 0
      };
      
      this.collections.set(collectionId, collection);
      console.log('✅ Collection créée:', name);
      return collection;
    } catch (error) {
      console.error('Erreur création collection:', error);
      throw error;
    }
  }
}

module.exports = NFTGamingSystem;
