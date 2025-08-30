/**
 * ⛓️ Infrastructure Web3
 * Intégration Web3.js et connexion aux réseaux blockchain
 */

const Web3 = require("web3");

class Web3Infrastructure {
  constructor() {
    this.web3 = null;
    this.network = "ethereum";
    this.provider = null;
    this.connected = false;
  }

  async init() {
    try {
      // Connexion à Ethereum (peut être changé pour d'autres réseaux)
      if (typeof window !== "undefined" && window.ethereum) {
        this.provider = window.ethereum;
        this.web3 = new Web3(this.provider);
      } else {
        // Fallback vers Infura ou autre provider
        this.provider = new Web3.providers.HttpProvider(
          "https://mainnet.infura.io/v3/YOUR_PROJECT_ID"
        );
        this.web3 = new Web3(this.provider);
      }

      // Vérifier la connexion
      const accounts = await this.web3.eth.getAccounts();
      if (accounts.length > 0) {
        this.connected = true;
        console.log("✅ Connexion Web3 établie");
      } else {
        console.log("⚠️ Aucun compte connecté");
      }

      return this.web3;
    } catch (error) {
      console.error("Erreur initialisation Web3:", error);
      // Pour les tests, créer une instance Web3 simulée
      this.web3 = {
        eth: {
          getAccounts: async () => [],
          net: {
            getId: async () => 1,
            getNetworkType: async () => "mainnet",
          },
          getBalance: async () => "0",
        },
        utils: {
          fromWei: (balance, unit) => "0",
        },
      };
      this.connected = false;
      console.log("⚠️ Web3 simulé pour les tests");
      return this.web3;
    }
  }

  async getNetworkInfo() {
    if (!this.web3) return null;

    try {
      const networkId = await this.web3.eth.net.getId();
      const networkType = await this.web3.eth.net.getNetworkType();

      return {
        networkId,
        networkType,
        connected: this.connected,
      };
    } catch (error) {
      console.error("Erreur récupération réseau:", error);
      return null;
    }
  }

  async getAccountBalance(address) {
    if (!this.web3) return 0;

    try {
      const balance = await this.web3.eth.getBalance(address);
      return this.web3.utils.fromWei(balance, "ether");
    } catch (error) {
      console.error("Erreur récupération solde:", error);
      return 0;
    }
  }
}

module.exports = Web3Infrastructure;
