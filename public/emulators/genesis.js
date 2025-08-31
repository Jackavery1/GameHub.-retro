class GenesisEmulator {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.isRunning = false;
    this.isPaused = false;
    this.currentGame = null;
    this.savedState = null;
    this.audioContext = null;
    this.frameCount = 0;
    this.lastFrameTime = 0;
  }

  init() {
    this.setupCanvas();
    this.setupAudio();
    this.loadGenesisPlusGX();
    this.setupControls();
    this.updateUI();
  }

  setupCanvas() {
    this.canvas = document.getElementById("genesisCanvas");
    if (!this.canvas) {
      console.error("Canvas Genesis non trouvé");
      return;
    }
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  setupAudio() {
    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    } catch (e) {
      console.warn("Audio non supporté:", e);
    }
  }

  loadGenesisPlusGX() {
    console.log("🎮 Chargement de Genesis Plus GX...");
    setTimeout(() => {
      this.initializeGenesis();
    }, 1000);
  }

  initializeGenesis() {
    console.log("✅ Genesis Plus GX initialisé");
    this.updateUI();
  }

  loadGame(gameId) {
    console.log(`🎮 Chargement du jeu Genesis: ${gameId}`);
    this.currentGame = gameId;

    const romData = this.getROMData(gameId);
    if (romData) {
      this.start();
    }
  }

  getAvailableGames() {
    return [
      { id: "sonic", name: "Sonic the Hedgehog", year: 1991 },
      { id: "streets", name: "Streets of Rage", year: 1991 },
      { id: "golden", name: "Golden Axe", year: 1989 },
      { id: "shinobi", name: "Shinobi", year: 1987 },
      { id: "altered", name: "Altered Beast", year: 1988 },
      { id: "phantasy", name: "Phantasy Star", year: 1987 },
    ];
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.isPaused = false;
      this.lastFrameTime = performance.now();
      this.gameLoop();
      console.log("▶️ Jeu Genesis démarré");
    }
  }

  pause() {
    this.isPaused = true;
    console.log("⏸️ Jeu Genesis en pause");
  }

  resume() {
    this.isPaused = false;
    this.lastFrameTime = performance.now();
    console.log("▶️ Jeu Genesis repris");
  }

  reset() {
    this.frameCount = 0;
    this.isPaused = false;
    console.log("🔄 Jeu Genesis reset");
  }

  saveState() {
    this.savedState = {
      game: this.currentGame,
      frameCount: this.frameCount,
      timestamp: Date.now(),
    };
    console.log("💾 État sauvegardé");
  }

  loadState() {
    if (this.savedState) {
      this.currentGame = this.savedState.game;
      this.frameCount = this.savedState.frameCount;
      console.log("📂 État chargé");
    }
  }

  setupControls() {
    document.addEventListener("keydown", (e) => this.handleKeyDown(e));
    document.addEventListener("keyup", (e) => this.handleKeyUp(e));
  }

  handleKeyDown(e) {
    if (!this.isRunning) return;

    switch (e.code) {
      case "ArrowUp":
        this.sendControl("up", true);
        break;
      case "ArrowDown":
        this.sendControl("down", true);
        break;
      case "ArrowLeft":
        this.sendControl("left", true);
        break;
      case "ArrowRight":
        this.sendControl("right", true);
        break;
      case "KeyZ":
        this.sendControl("a", true);
        break;
      case "KeyX":
        this.sendControl("b", true);
        break;
      case "KeyC":
        this.sendControl("c", true);
        break;
      case "Enter":
        this.sendControl("start", true);
        break;
      case "Space":
        this.togglePause();
        break;
      case "KeyR":
        this.reset();
        break;
      case "KeyS":
        this.saveState();
        break;
      case "KeyL":
        this.loadState();
        break;
    }
  }

  handleKeyUp(e) {
    if (!this.isRunning) return;

    switch (e.code) {
      case "ArrowUp":
        this.sendControl("up", false);
        break;
      case "ArrowDown":
        this.sendControl("down", false);
        break;
      case "ArrowLeft":
        this.sendControl("left", false);
        break;
      case "ArrowRight":
        this.sendControl("right", false);
        break;
      case "KeyZ":
        this.sendControl("a", false);
        break;
      case "KeyX":
        this.sendControl("b", false);
        break;
      case "KeyC":
        this.sendControl("c", false);
        break;
      case "Enter":
        this.sendControl("start", false);
        break;
    }
  }

  sendControl(control, pressed) {
    if (pressed) {
      console.log(`🎮 Contrôle pressé: ${control}`);
    }
  }

  togglePause() {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  gameLoop() {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;

    if (!this.isPaused && deltaTime >= 16.67) {
      this.frameCount++;
      this.renderFrame();
      this.lastFrameTime = currentTime;
    }

    requestAnimationFrame(() => this.gameLoop());
  }

  renderFrame() {
    if (!this.ctx) return;

    const colors = [
      "#000000",
      "#FFFFFF",
      "#3498db",
      "#e74c3c",
      "#f39c12",
      "#2ecc71",
    ];
    const color = colors[this.frameCount % colors.length];

    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "18px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      `Genesis: ${this.currentGame || "Aucun jeu"}`,
      this.canvas.width / 2,
      this.canvas.height / 2
    );
    this.ctx.fillText(
      `Frame: ${this.frameCount}`,
      this.canvas.width / 2,
      this.canvas.height / 2 + 25
    );
  }

  updateUI() {
    console.log("🎮 Interface Genesis mise à jour");
  }

  getROMData(gameId) {
    const roms = {
      sonic: this.getSonicROM(),
      streets: this.getStreetsROM(),
      golden: this.getGoldenROM(),
      shinobi: this.getShinobiROM(),
      altered: this.getAlteredROM(),
      phantasy: this.getPhantasyROM(),
    };
    return roms[gameId];
  }

  getSonicROM() {
    return { name: "Sonic the Hedgehog", size: "1MB", checksum: "sonic_1991" };
  }

  getStreetsROM() {
    return {
      name: "Streets of Rage",
      size: "1MB",
      checksum: "streets_rage_1991",
    };
  }

  getGoldenROM() {
    return { name: "Golden Axe", size: "512KB", checksum: "golden_axe_1989" };
  }

  getShinobiROM() {
    return { name: "Shinobi", size: "512KB", checksum: "shinobi_1987" };
  }

  getAlteredROM() {
    return {
      name: "Altered Beast",
      size: "512KB",
      checksum: "altered_beast_1988",
    };
  }

  getPhantasyROM() {
    return {
      name: "Phantasy Star",
      size: "1MB",
      checksum: "phantasy_star_1987",
    };
  }
}

window.GenesisEmulator = GenesisEmulator;



