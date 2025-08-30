/**
 * PHASE 4: Outils Blockchain Gaming
 * GameHub Retro - Tokens de jeu et marché décentralisé
 */

const crypto = require("crypto");
const { User, Game, Tournament, Match } = require("../../models/index");

class BlockchainTools {
  constructor() {
    this.blockchain = new Blockchain();
    this.tokenManager = new TokenManager();
    this.marketplace = new GamingMarketplace();
    this.nftManager = new NFTManager();
    this.isBlockchainEnabled = this.checkBlockchainSupport();
  }

  // ===== VÉRIFICATION DU SUPPORT BLOCKCHAIN =====
  checkBlockchainSupport() {
    // Vérifier si Web3 est disponible
    return (
      typeof window !== "undefined" &&
      (window.ethereum ||
        window.web3 ||
        (typeof require !== "undefined" && require("web3")))
    );
  }

  // ===== GESTION DES TOKENS DE JEU =====
  async createGameToken(gameId, tokenData) {
    try {
      if (!this.isBlockchainEnabled) {
        throw new Error("Blockchain non supportée");
      }

      const game = await Game.findById(gameId);
      if (!game) throw new Error("Jeu non trouvé");

      const token = await this.tokenManager.createToken({
        gameId: game._id,
        name: `${game.name} Token`,
        symbol: game.name.substring(0, 3).toUpperCase(),
        totalSupply: tokenData.totalSupply || 1000000,
        decimals: 18,
        metadata: {
          gameName: game.name,
          platform: game.platform,
          genre: game.genre,
          releaseYear: game.releaseYear,
        },
      });

      return {
        success: true,
        token: {
          address: token.address,
          name: token.name,
          symbol: token.symbol,
          totalSupply: token.totalSupply,
          gameId: game._id,
        },
      };
    } catch (error) {
      console.error("❌ Erreur création token blockchain:", error);
      return {
        success: false,
        error: error.message,
        token: this.createMockToken(gameId),
      };
    }
  }

  async mintGameTokens(tokenAddress, userId, amount) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error("Utilisateur non trouvé");

      const mintResult = await this.tokenManager.mintTokens(
        tokenAddress,
        user.walletAddress || this.generateWalletAddress(),
        amount
      );

      // Enregistrer la transaction dans la base de données
      await this.recordTokenTransaction({
        type: "mint",
        tokenAddress,
        userId,
        amount,
        transactionHash: mintResult.hash,
      });

      return {
        success: true,
        transaction: mintResult,
        userBalance: await this.getUserTokenBalance(tokenAddress, userId),
      };
    } catch (error) {
      console.error("❌ Erreur mint tokens:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async transferGameTokens(tokenAddress, fromUserId, toUserId, amount) {
    try {
      const fromUser = await User.findById(fromUserId);
      const toUser = await User.findById(toUserId);

      if (!fromUser || !toUser) throw new Error("Utilisateurs non trouvés");

      const transferResult = await this.tokenManager.transferTokens(
        tokenAddress,
        fromUser.walletAddress,
        toUser.walletAddress,
        amount
      );

      // Enregistrer la transaction
      await this.recordTokenTransaction({
        type: "transfer",
        tokenAddress,
        fromUserId,
        toUserId,
        amount,
        transactionHash: transferResult.hash,
      });

      return {
        success: true,
        transaction: transferResult,
        fromBalance: await this.getUserTokenBalance(tokenAddress, fromUserId),
        toBalance: await this.getUserTokenBalance(tokenAddress, toUserId),
      };
    } catch (error) {
      console.error("❌ Erreur transfert tokens:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ===== GESTION DES NFT =====
  async createGameNFT(gameId, userId, nftData) {
    try {
      const game = await Game.findById(gameId);
      const user = await User.findById(userId);

      if (!game || !user) throw new Error("Données invalides");

      const nft = await this.nftManager.createNFT({
        gameId: game._id,
        ownerId: user._id,
        name: nftData.name || `${game.name} NFT`,
        description: nftData.description || `NFT unique pour ${game.name}`,
        image: nftData.image || game.image,
        attributes: {
          rarity: nftData.rarity || "common",
          level: nftData.level || 1,
          power: nftData.power || 50,
          game: game.name,
          platform: game.platform,
        },
        metadata: {
          creator: user.username,
          createdAt: new Date(),
          gameVersion: nftData.version || "1.0",
        },
      });

      return {
        success: true,
        nft: {
          id: nft.id,
          name: nft.name,
          description: nft.description,
          image: nft.image,
          attributes: nft.attributes,
          owner: user.username,
        },
      };
    } catch (error) {
      console.error("❌ Erreur création NFT:", error);
      return {
        success: false,
        error: error.message,
        nft: this.createMockNFT(gameId, userId),
      };
    }
  }

  async mintScoreNFT(userId, gameId, score, matchId) {
    try {
      const user = await User.findById(userId);
      const game = await Game.findById(gameId);
      const match = await Match.findById(matchId);

      if (!user || !game || !match) throw new Error("Données invalides");

      // Créer un NFT basé sur le score
      const nftData = {
        name: `${game.name} Score NFT`,
        description: `Score de ${score} points dans ${game.name}`,
        rarity: this.calculateScoreRarity(score),
        level: Math.floor(score / 10),
        power: score,
        version: "1.0",
      };

      const nft = await this.createGameNFT(gameId, userId, nftData);

      // Lier le NFT au match
      if (nft.success) {
        await this.linkNFTToMatch(nft.nft.id, matchId);
      }

      return nft;
    } catch (error) {
      console.error("❌ Erreur mint Score NFT:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ===== MARCHÉ DE JEUX DÉCENTRALISÉ =====
  async listGameForSale(gameId, sellerId, price, currency = "ETH") {
    try {
      const game = await Game.findById(gameId);
      const seller = await User.findById(sellerId);

      if (!game || !seller) throw new Error("Données invalides");

      const listing = await this.marketplace.createListing({
        gameId: game._id,
        sellerId: seller._id,
        price: this.convertToWei(price),
        currency,
        gameData: {
          name: game.name,
          platform: game.platform,
          genre: game.genre,
          image: game.image,
        },
        status: "active",
        createdAt: new Date(),
      });

      return {
        success: true,
        listing: {
          id: listing.id,
          game: game.name,
          seller: seller.username,
          price: price,
          currency: currency,
          status: "active",
        },
      };
    } catch (error) {
      console.error("❌ Erreur création listing:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async purchaseGame(listingId, buyerId, paymentAmount) {
    try {
      const listing = await this.marketplace.getListing(listingId);
      const buyer = await User.findById(buyerId);

      if (!listing || !buyer) throw new Error("Données invalides");

      // Vérifier le paiement
      const paymentResult = await this.marketplace.processPayment(
        listingId,
        buyer.walletAddress,
        paymentAmount
      );

      if (paymentResult.success) {
        // Transférer la propriété du jeu
        await this.transferGameOwnership(
          listing.gameId,
          listing.sellerId,
          buyerId
        );

        // Mettre à jour le listing
        await this.marketplace.updateListingStatus(listingId, "sold");

        // Créer un NFT de propriété
        await this.createOwnershipNFT(listing.gameId, buyerId, listing.price);
      }

      return paymentResult;
    } catch (error) {
      console.error("❌ Erreur achat jeu:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ===== UTILITAIRES BLOCKCHAIN =====
  async getUserTokenBalance(tokenAddress, userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.walletAddress) return 0;

      return await this.tokenManager.getBalance(
        tokenAddress,
        user.walletAddress
      );
    } catch (error) {
      console.error("❌ Erreur récupération balance:", error);
      return 0;
    }
  }

  async getBlockchainStats() {
    try {
      const stats = await this.blockchain.getStats();
      return {
        success: true,
        stats: {
          totalTransactions: stats.totalTransactions,
          totalTokens: stats.totalTokens,
          totalNFTs: stats.totalNFTs,
          marketVolume: stats.marketVolume,
          activeUsers: stats.activeUsers,
        },
      };
    } catch (error) {
      console.error("❌ Erreur récupération stats blockchain:", error);
      return {
        success: false,
        error: error.message,
        stats: this.getMockBlockchainStats(),
      };
    }
  }

  // ===== MÉTHODES UTILITAIRES =====
  generateWalletAddress() {
    return "0x" + crypto.randomBytes(20).toString("hex");
  }

  convertToWei(amount) {
    return Math.floor(amount * Math.pow(10, 18));
  }

  calculateScoreRarity(score) {
    if (score >= 90) return "legendary";
    if (score >= 80) return "epic";
    if (score >= 70) return "rare";
    if (score >= 60) return "uncommon";
    return "common";
  }

  async recordTokenTransaction(transactionData) {
    // Enregistrer la transaction dans la base de données
    // Ici on pourrait créer un modèle Transaction
    console.log("📝 Transaction enregistrée:", transactionData);
  }

  async linkNFTToMatch(nftId, matchId) {
    // Lier le NFT au match dans la base de données
    console.log("🔗 NFT lié au match:", { nftId, matchId });
  }

  async transferGameOwnership(gameId, fromUserId, toUserId) {
    // Transférer la propriété du jeu
    console.log("🔄 Propriété transférée:", { gameId, fromUserId, toUserId });
  }

  async createOwnershipNFT(gameId, ownerId, price) {
    // Créer un NFT de propriété
    console.log("🏆 NFT de propriété créé:", { gameId, ownerId, price });
  }

  // ===== MÉTHODES DE FALLBACK =====
  createMockToken(gameId) {
    return {
      address: "0x" + crypto.randomBytes(20).toString("hex"),
      name: "Mock Game Token",
      symbol: "MGT",
      totalSupply: 1000000,
      gameId: gameId,
    };
  }

  createMockNFT(gameId, userId) {
    return {
      id: crypto.randomUUID(),
      name: "Mock Game NFT",
      description: "NFT de test",
      image: "/public/images/dh.png",
      attributes: {
        rarity: "common",
        level: 1,
        power: 50,
      },
      owner: "MockUser",
    };
  }

  getMockBlockchainStats() {
    return {
      totalTransactions: 1250,
      totalTokens: 15,
      totalNFTs: 89,
      marketVolume: "2.5 ETH",
      activeUsers: 45,
    };
  }
}

// ===== CLASSE BLOCKCHAIN SIMULÉE =====
class Blockchain {
  constructor() {
    this.transactions = [];
    this.tokens = new Map();
    this.nfts = new Map();
    this.marketplace = new Map();
  }

  async getStats() {
    return {
      totalTransactions: this.transactions.length,
      totalTokens: this.tokens.size,
      totalNFTs: this.nfts.size,
      marketVolume: "2.5 ETH",
      activeUsers: 45,
    };
  }
}

// ===== GESTIONNAIRE DE TOKENS =====
class TokenManager {
  constructor() {
    this.tokens = new Map();
    this.balances = new Map();
  }

  async createToken(tokenData) {
    const token = {
      address: "0x" + crypto.randomBytes(20).toString("hex"),
      name: tokenData.name,
      symbol: tokenData.symbol,
      totalSupply: tokenData.totalSupply,
      decimals: tokenData.decimals,
      metadata: tokenData.metadata,
    };

    this.tokens.set(token.address, token);
    return token;
  }

  async mintTokens(tokenAddress, walletAddress, amount) {
    const currentBalance =
      this.balances.get(`${tokenAddress}-${walletAddress}`) || 0;
    this.balances.set(
      `${tokenAddress}-${walletAddress}`,
      currentBalance + amount
    );

    return {
      hash: "0x" + crypto.randomBytes(32).toString("hex"),
      success: true,
    };
  }

  async transferTokens(tokenAddress, fromAddress, toAddress, amount) {
    const fromBalance =
      this.balances.get(`${tokenAddress}-${fromAddress}`) || 0;
    const toBalance = this.balances.get(`${tokenAddress}-${toAddress}`) || 0;

    if (fromBalance < amount) {
      throw new Error("Balance insuffisante");
    }

    this.balances.set(`${tokenAddress}-${fromAddress}`, fromBalance - amount);
    this.balances.set(`${tokenAddress}-${toAddress}`, toBalance + amount);

    return {
      hash: "0x" + crypto.randomBytes(32).toString("hex"),
      success: true,
    };
  }

  async getBalance(tokenAddress, walletAddress) {
    return this.balances.get(`${tokenAddress}-${walletAddress}`) || 0;
  }
}

// ===== MARCHÉ DE JEUX =====
class GamingMarketplace {
  constructor() {
    this.listings = new Map();
    this.transactions = [];
  }

  async createListing(listingData) {
    const listing = {
      id: crypto.randomUUID(),
      ...listingData,
    };

    this.listings.set(listing.id, listing);
    return listing;
  }

  async getListing(listingId) {
    return this.listings.get(listingId);
  }

  async processPayment(listingId, buyerAddress, amount) {
    // Simuler le traitement du paiement
    const transaction = {
      id: crypto.randomUUID(),
      listingId,
      buyerAddress,
      amount,
      timestamp: new Date(),
      status: "completed",
    };

    this.transactions.push(transaction);

    return {
      success: true,
      transaction: transaction,
    };
  }

  async updateListingStatus(listingId, status) {
    const listing = this.listings.get(listingId);
    if (listing) {
      listing.status = status;
      this.listings.set(listingId, listing);
    }
  }
}

// ===== GESTIONNAIRE NFT =====
class NFTManager {
  constructor() {
    this.nfts = new Map();
  }

  async createNFT(nftData) {
    const nft = {
      id: crypto.randomUUID(),
      ...nftData,
      createdAt: new Date(),
    };

    this.nfts.set(nft.id, nft);
    return nft;
  }

  async getNFT(nftId) {
    return this.nfts.get(nftId);
  }

  async transferNFT(nftId, fromUserId, toUserId) {
    const nft = this.nfts.get(nftId);
    if (nft) {
      nft.ownerId = toUserId;
      nft.transferredAt = new Date();
      this.nfts.set(nftId, nft);
      return true;
    }
    return false;
  }
}

module.exports = { BlockchainTools };
