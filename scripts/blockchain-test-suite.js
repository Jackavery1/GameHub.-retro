
/**
 * 🧪 Tests des Fonctionnalités Blockchain - Phase 4
 */

const Web3Infrastructure = require('../src/services/web3Infrastructure');
const GamingTokenSystem = require('../src/services/gamingTokens');
const BlockchainWallet = require('../src/services/blockchainWallet');
const NFTGamingSystem = require('../src/services/nftGaming');
const DecentralizedMarketplace = require('../src/services/decentralizedMarketplace');
const DecentralizedTournaments = require('../src/services/decentralizedTournaments');

class BlockchainTestSuite {
  constructor() {
    this.web3 = new Web3Infrastructure();
    this.tokens = new GamingTokenSystem();
    this.wallet = new BlockchainWallet();
    this.nfts = new NFTGamingSystem();
    this.marketplace = new DecentralizedMarketplace();
    this.tournaments = new DecentralizedTournaments();
    this.results = { passed: 0, failed: 0, errors: [] };
  }

  async runAllTests() {
    console.log('🧪 Tests des fonctionnalités blockchain...');
    
    await this.testWeb3Infrastructure();
    await this.testGamingTokens();
    await this.testBlockchainWallet();
    await this.testNFTGaming();
    await this.testDecentralizedMarketplace();
    await this.testDecentralizedTournaments();
    
    this.displayResults();
  }

  async testWeb3Infrastructure() {
    try {
      await this.web3.init();
      
      if (this.web3.web3) {
        console.log('✅ Infrastructure Web3: Fonctionnel');
        this.results.passed++;
      } else {
        throw new Error('Web3 non initialisé');
      }
    } catch (error) {
      console.log('❌ Infrastructure Web3:', error.message);
      this.results.failed++;
      this.results.errors.push('Web3: ' + error.message);
    }
  }

  async testGamingTokens() {
    try {
      const reward = this.tokens.calculateReward('gameVictory', 1.5);
      
      if (reward > 0) {
        console.log('✅ Système de tokens gaming: Fonctionnel');
        console.log('   💰 Récompense calculée:', reward, 'GHT');
        this.results.passed++;
      } else {
        throw new Error('Calcul de récompense invalide');
      }
    } catch (error) {
      console.log('❌ Système de tokens gaming:', error.message);
      this.results.failed++;
      this.results.errors.push('Tokens: ' + error.message);
    }
  }

  async testBlockchainWallet() {
    try {
      const wallet = await this.wallet.createWallet('test-user');
      
      if (wallet && wallet.address) {
        console.log('✅ Portefeuille blockchain: Fonctionnel');
        console.log('   💼 Adresse créée:', wallet.address);
        this.results.passed++;
      } else {
        throw new Error('Portefeuille non créé');
      }
    } catch (error) {
      console.log('❌ Portefeuille blockchain:', error.message);
      this.results.failed++;
      this.results.errors.push('Wallet: ' + error.message);
    }
  }

  async testNFTGaming() {
    try {
      const nft = await this.nfts.createNFT('test-user', 'mario-bros', 'game', {
        name: 'Super Mario Bros',
        description: 'Jeu classique rétro',
        popularity: 95
      });
      
      if (nft && nft.tokenId) {
        console.log('✅ Système NFT gaming: Fonctionnel');
        console.log('   🎨 NFT créé:', nft.tokenId);
        this.results.passed++;
      } else {
        throw new Error('NFT non créé');
      }
    } catch (error) {
      console.log('❌ Système NFT gaming:', error.message);
      this.results.failed++;
      this.results.errors.push('NFT: ' + error.message);
    }
  }

  async testDecentralizedMarketplace() {
    try {
      const listing = await this.marketplace.createListing('test-seller', 'nft-123', 100);
      
      if (listing && listing.id) {
        console.log('✅ Marketplace décentralisé: Fonctionnel');
        console.log('   🏪 Listing créé:', listing.id);
        this.results.passed++;
      } else {
        throw new Error('Listing non créé');
      }
    } catch (error) {
      console.log('❌ Marketplace décentralisé:', error.message);
      this.results.failed++;
      this.results.errors.push('Marketplace: ' + error.message);
    }
  }

  async testDecentralizedTournaments() {
    try {
      const tournament = await this.tournaments.createTournament('test-creator', 'mario-bros', 10, 1000);
      
      if (tournament && tournament.id) {
        console.log('✅ Tournois décentralisés: Fonctionnel');
        console.log('   🏆 Tournoi créé:', tournament.id);
        this.results.passed++;
      } else {
        throw new Error('Tournoi non créé');
      }
    } catch (error) {
      console.log('❌ Tournois décentralisés:', error.message);
      this.results.failed++;
      this.results.errors.push('Tournaments: ' + error.message);
    }
  }

  displayResults() {
    const total = this.results.passed + this.results.failed;
    const successRate = total > 0 ? Math.round((this.results.passed / total) * 100) : 0;
    
    console.log('\n📊 Résultats des tests blockchain:');
    console.log('✅ Tests réussis:', this.results.passed);
    console.log('❌ Tests échoués:', this.results.failed);
    console.log('📈 Taux de réussite:', successRate + '%');
    
    if (successRate >= 80) {
      console.log('🎉 Phase 4 Blockchain validée avec succès !');
    } else {
      console.log('⚠️ Corrections nécessaires');
    }
  }
}

module.exports = BlockchainTestSuite;

// Exécution automatique des tests si le fichier est lancé directement
if (require.main === module) {
  const blockchainTestSuite = new BlockchainTestSuite();
  blockchainTestSuite.runAllTests().catch(console.error);
}
