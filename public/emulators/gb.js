class GameBoyEmulator {
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
    this.loadGBJS();
    this.setupControls();
    this.updateUI();
  }

  setupCanvas() {
    this.canvas = document.getElementById("gbCanvas");
    if (!this.canvas) {
      console.error("Canvas Game Boy non trouvé");
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

  loadGBJS() {
    console.log("🎮 Chargement de GB.js...");
    setTimeout(() => {
      this.initializeGB();
    }, 1000);
  }

  initializeGB() {
    console.log("✅ GB.js initialisé");
    this.updateUI();
  }

  loadGame(gameId) {
    console.log(`🎮 Chargement du jeu Game Boy: ${gameId}`);
    this.currentGame = gameId;

    const romData = this.getROMData(gameId);
    if (romData) {
      this.start();
    }
  }

  getAvailableGames() {
    return [
      { id: "tetris", name: "Tetris", year: 1989 },
      { id: "pokemon", name: "Pokemon Red", year: 1996 },
      { id: "mario", name: "Super Mario Land", year: 1989 },
      { id: "zelda", name: "Link's Awakening", year: 1993 },
      { id: "kirby", name: "Kirby's Dream Land", year: 1992 },
      { id: "wario", name: "Wario Land", year: 1994 },
    ];
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.isPaused = false;
      this.lastFrameTime = performance.now();
      this.gameLoop();
      console.log("▶️ Jeu Game Boy démarré");
    }
  }

  pause() {
    this.isPaused = true;
    console.log("⏸️ Jeu Game Boy en pause");
  }

  resume() {
    this.isPaused = false;
    this.lastFrameTime = performance.now();
    console.log("▶️ Jeu Game Boy repris");
  }

  reset() {
    this.frameCount = 0;
    this.isPaused = false;
    console.log("🔄 Jeu Game Boy reset");
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

    const colors = ["#0f380f", "#306230", "#8bac0f", "#9bbc0f"];
    const color = colors[this.frameCount % colors.length];

    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "#9bbc0f";
    this.ctx.font = "16px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      `GB: ${this.currentGame || "Aucun jeu"}`,
      this.canvas.width / 2,
      this.canvas.height / 2
    );
    this.ctx.fillText(
      `Frame: ${this.frameCount}`,
      this.canvas.width / 2,
      this.canvas.height / 2 + 20
    );
  }

  updateUI() {
    console.log("🎮 Interface Game Boy mise à jour");
  }

  getROMData(gameId) {
    const roms = {
      tetris: this.getTetrisROM(),
      pokemon: this.getPokemonROM(),
      mario: this.getMarioROM(),
      zelda: this.getZeldaROM(),
      kirby: this.getKirbyROM(),
      wario: this.getWarioROM(),
    };
    return roms[gameId];
  }

  getTetrisROM() {
    return { name: "Tetris", size: "32KB", checksum: "tetris_1989" };
  }

  getPokemonROM() {
    return { name: "Pokemon Red", size: "1MB", checksum: "pokemon_red_1996" };
  }

  getMarioROM() {
    return {
      name: "Super Mario Land",
      size: "64KB",
      checksum: "mario_land_1989",
    };
  }

  getZeldaROM() {
    return {
      name: "Link's Awakening",
      size: "1MB",
      checksum: "zelda_awakening_1993",
    };
  }

  getKirbyROM() {
    return { name: "Kirby's Dream Land", size: "64KB", checksum: "kirby_1992" };
  }

  getWarioROM() {
    return { name: "Wario Land", size: "1MB", checksum: "wario_land_1994" };
  }
}

window.GameBoyEmulator = GameBoyEmulator;



