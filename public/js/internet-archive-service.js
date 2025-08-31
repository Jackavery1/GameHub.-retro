// Service pour intégrer Internet Archive
class InternetArchiveService {
  constructor() {
    this.baseUrl = "https://archive.org";
    this.searchUrl = "https://archive.org/advancedsearch.php";
    this.embedUrl = "https://archive.org/embed";
    this.gameCollections = {
      nes: "nintendo_entertainment_system_library",
      snes: "super_nintendo_entertainment_system_library",
      gb: "game_boy_library",
      genesis: "sega_genesis_library",
      arcade: "internetarcade",
      dos: "softwarelibrary_msdos_games",
    };
  }

  // Rechercher des jeux par console
  async searchGames(console, limit = 20) {
    const collection = this.gameCollections[console];
    if (!collection) {
      throw new Error(`Console non supportée: ${console}`);
    }

    try {
      const query = `collection:${collection}`;
      const params = new URLSearchParams({
        q: query,
        fl: "identifier,title,description,date,creator",
        sort: "downloads desc",
        rows: limit,
        output: "json",
      });

      const response = await fetch(`${this.searchUrl}?${params}`);
      const data = await response.json();

      return this.formatGameResults(data.response.docs, console);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      return [];
    }
  }

  // Formater les résultats de recherche
  formatGameResults(docs, console) {
    return docs.map((doc) => ({
      id: doc.identifier,
      title: this.cleanTitle(doc.title),
      description: doc.description || "",
      date: doc.date,
      creator: doc.creator,
      console: console,
      playUrl: `${this.embedUrl}/${doc.identifier}`,
      icon: this.getGameIcon(doc.title, console),
      category: this.getGameCategory(doc.title),
    }));
  }

  // Nettoyer le titre du jeu
  cleanTitle(title) {
    if (!title) return "Jeu Inconnu";

    // Supprimer les préfixes communs
    return title
      .replace(/^\w+_/, "") // Préfixes avec underscore
      .replace(/\(.*?\)/g, "") // Parenthèses
      .replace(/\[.*?\]/g, "") // Crochets
      .replace(/_/g, " ") // Underscores
      .replace(/\s+/g, " ") // Espaces multiples
      .trim()
      .substring(0, 20); // Limiter la longueur
  }

  // Obtenir une icône pour le jeu
  getGameIcon(title, console) {
    const titleLower = title.toLowerCase();

    // Icônes spécifiques par jeu
    const gameIcons = {
      mario: "🍄",
      sonic: "💙",
      zelda: "⚔️",
      pokemon: "⚡",
      tetris: "🧩",
      pacman: "👻",
      donkey: "🦍",
      metroid: "🚀",
      street: "👊",
      mortal: "⚡",
      final: "⚔️",
      dragon: "🐉",
      mega: "🤖",
      castlevania: "🧛",
      contra: "🔫",
      gradius: "🚀",
      galaga: "🚀",
      frogger: "🐸",
      centipede: "🐛",
      asteroids: "🪨",
      invaders: "👾",
    };

    // Chercher une correspondance
    for (const [keyword, icon] of Object.entries(gameIcons)) {
      if (titleLower.includes(keyword)) {
        return icon;
      }
    }

    // Icônes par défaut par console
    const consoleIcons = {
      nes: "🎮",
      snes: "🎮",
      gb: "📱",
      genesis: "🎮",
      arcade: "🕹️",
      dos: "💻",
    };

    return consoleIcons[console] || "🎮";
  }

  // Obtenir la catégorie du jeu
  getGameCategory(title) {
    const titleLower = title.toLowerCase();

    const categories = {
      action: ["mario", "sonic", "mega", "contra", "ninja"],
      adventure: ["zelda", "metroid", "castlevania"],
      rpg: ["final", "dragon", "phantasy", "pokemon"],
      fighting: ["street", "mortal", "tekken", "king"],
      puzzle: ["tetris", "puyo", "puzzle"],
      arcade: ["pacman", "galaga", "frogger", "centipede"],
      shooter: ["gradius", "r-type", "thunder", "invaders"],
      racing: ["f-zero", "mario kart", "outrun"],
      sports: ["fifa", "nba", "nhl", "tennis"],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => titleLower.includes(keyword))) {
        return category;
      }
    }

    return "other";
  }

  // Créer une cartouche de jeu HTML
  createGameCartridge(game) {
    const cartridge = document.createElement("div");
    cartridge.className = `game-cartridge ${game.console}-cart`;
    cartridge.dataset.game = game.id;
    cartridge.dataset.url = game.playUrl;
    cartridge.dataset.category = game.category;

    cartridge.innerHTML = `
      <div class="cart-label">
        <div class="cart-icon">${game.icon}</div>
        <div class="cart-title">${game.title}</div>
      </div>
    `;

    // Ajouter l'événement de clic
    cartridge.addEventListener("click", () => {
      this.loadGame(game);
    });

    return cartridge;
  }

  // Charger un jeu
  loadGame(game) {
    const event = new CustomEvent("gameSelected", {
      detail: game,
    });
    document.dispatchEvent(event);
  }

  // Populer une bibliothèque de jeux
  async populateGameLibrary(console, containerId, limit = 12) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container non trouvé: ${containerId}`);
      return;
    }

    try {
      // Afficher un indicateur de chargement
      container.innerHTML =
        '<div class="loading-games">🎮 Chargement des jeux...</div>';

      const games = await this.searchGames(console, limit);

      // Vider le container
      container.innerHTML = "";

      if (games.length === 0) {
        container.innerHTML = '<div class="no-games">Aucun jeu trouvé</div>';
        return;
      }

      // Ajouter les jeux
      games.forEach((game) => {
        const cartridge = this.createGameCartridge(game);
        container.appendChild(cartridge);
      });

      console.log(`${games.length} jeux chargés pour ${console}`);
    } catch (error) {
      console.error("Erreur lors du chargement des jeux:", error);
      container.innerHTML =
        '<div class="error-games">❌ Erreur de chargement</div>';
    }
  }

  // Rechercher des jeux par mot-clé
  async searchGamesByKeyword(keyword, console = null, limit = 10) {
    try {
      let query = `title:(${keyword})`;

      if (console && this.gameCollections[console]) {
        query += ` AND collection:${this.gameCollections[console]}`;
      }

      const params = new URLSearchParams({
        q: query,
        fl: "identifier,title,description,date,creator,collection",
        sort: "downloads desc",
        rows: limit,
        output: "json",
      });

      const response = await fetch(`${this.searchUrl}?${params}`);
      const data = await response.json();

      return this.formatGameResults(data.response.docs, console || "mixed");
    } catch (error) {
      console.error("Erreur lors de la recherche par mot-clé:", error);
      return [];
    }
  }

  // Obtenir les jeux les plus populaires
  async getPopularGames(console, limit = 20) {
    const collection = this.gameCollections[console];
    if (!collection) {
      throw new Error(`Console non supportée: ${console}`);
    }

    try {
      const params = new URLSearchParams({
        q: `collection:${collection}`,
        fl: "identifier,title,description,date,creator,downloads",
        sort: "downloads desc",
        rows: limit,
        output: "json",
      });

      const response = await fetch(`${this.searchUrl}?${params}`);
      const data = await response.json();

      return this.formatGameResults(data.response.docs, console);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des jeux populaires:",
        error
      );
      return [];
    }
  }

  // Créer un filtre de jeux
  createGameFilter(games, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const categories = [...new Set(games.map((game) => game.category))];

    const filterHTML = `
      <div class="game-filter">
        <select id="categoryFilter">
          <option value="">Toutes catégories</option>
          ${categories
            .map((cat) => `<option value="${cat}">${cat}</option>`)
            .join("")}
        </select>
        <input type="text" id="gameSearch" placeholder="Rechercher un jeu...">
      </div>
    `;

    container.insertAdjacentHTML("beforebegin", filterHTML);

    // Ajouter les événements de filtrage
    document
      .getElementById("categoryFilter")
      .addEventListener("change", (e) => {
        this.filterGames(e.target.value, null, containerId);
      });

    document.getElementById("gameSearch").addEventListener("input", (e) => {
      this.filterGames(null, e.target.value, containerId);
    });
  }

  // Filtrer les jeux
  filterGames(category, searchTerm, containerId) {
    const container = document.getElementById(containerId);
    const cartridges = container.querySelectorAll(".game-cartridge");

    cartridges.forEach((cartridge) => {
      const gameCategory = cartridge.dataset.category;
      const gameTitle = cartridge
        .querySelector(".cart-title")
        .textContent.toLowerCase();

      let show = true;

      if (category && gameCategory !== category) {
        show = false;
      }

      if (searchTerm && !gameTitle.includes(searchTerm.toLowerCase())) {
        show = false;
      }

      cartridge.style.display = show ? "block" : "none";
    });
  }
}

// Instance globale
window.InternetArchiveService = new InternetArchiveService();

// Styles CSS pour les éléments de service
const serviceStyles = `
  .loading-games, .no-games, .error-games {
    text-align: center;
    padding: 40px;
    color: var(--text);
    font-size: 1.2em;
  }

  .loading-games {
    color: var(--neon);
  }

  .error-games {
    color: #e74c3c;
  }

  .game-filter {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
    justify-content: center;
  }

  .game-filter select,
  .game-filter input {
    padding: 8px 12px;
    border: 1px solid var(--neon);
    background: var(--bg2);
    color: var(--text);
    border-radius: 6px;
    font-size: 14px;
  }

  .game-filter select:focus,
  .game-filter input:focus {
    outline: none;
    box-shadow: 0 0 10px rgba(0, 247, 255, 0.3);
  }
`;

// Ajouter les styles au document
const serviceStyleSheet = document.createElement("style");
serviceStyleSheet.textContent = serviceStyles;
document.head.appendChild(serviceStyleSheet);

console.log("🎮 Internet Archive Service chargé");
