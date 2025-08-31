const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");

const emulatorTools = [
  {
    name: "load_emulator",
    description: "Charge un émulateur spécifique avec ses configurations",
    inputSchema: {
      type: "object",
      properties: {
        emulatorType: {
          type: "string",
          enum: ["nes", "snes", "gb", "genesis", "arcade", "dos", "flash"],
          description: "Type d'émulateur à charger",
        },
        romPath: {
          type: "string",
          description: "Chemin vers le fichier ROM (optionnel)",
        },
        config: {
          type: "object",
          description: "Configuration spécifique de l'émulateur",
        },
      },
      required: ["emulatorType"],
    },
    handler: async ({ emulatorType, romPath, config }) => {
      try {
        const emulatorConfig = getEmulatorConfig(emulatorType);

        if (romPath) {
          const romValidation = await validateROM(romPath, emulatorType);
          if (!romValidation.valid) {
            return { error: `ROM invalide: ${romValidation.error}` };
          }
        }

        const sessionId = generateSessionId();
        const emulatorSession = {
          id: sessionId,
          type: emulatorType,
          config: { ...emulatorConfig, ...config },
          romPath,
          startedAt: new Date(),
          status: "loading",
        };

        // Simuler le chargement de l'émulateur
        await simulateEmulatorLoad(emulatorType);

        emulatorSession.status = "ready";

        return {
          sessionId,
          emulator: emulatorSession,
          message: `Émulateur ${emulatorType.toUpperCase()} chargé avec succès`,
        };
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  {
    name: "upload_rom",
    description: "Upload et valide un fichier ROM pour un émulateur spécifique",
    inputSchema: {
      type: "object",
      properties: {
        emulatorType: {
          type: "string",
          enum: ["nes", "snes", "gb", "genesis", "arcade", "dos", "flash"],
          description: "Type d'émulateur cible",
        },
        fileName: { type: "string", description: "Nom du fichier ROM" },
        fileData: {
          type: "string",
          description: "Données du fichier en base64",
        },
        fileSize: { type: "number", description: "Taille du fichier en bytes" },
      },
      required: ["emulatorType", "fileName", "fileData", "fileSize"],
    },
    handler: async ({ emulatorType, fileName, fileData, fileSize }) => {
      try {
        // Validation de la taille
        const maxSize = getMaxROMSize(emulatorType);
        if (fileSize > maxSize) {
          return {
            error: `Fichier trop volumineux. Maximum: ${maxSize} bytes`,
          };
        }

        // Validation du format
        const fileExtension = path.extname(fileName).toLowerCase();
        const validExtensions = getValidExtensions(emulatorType);

        if (!validExtensions.includes(fileExtension)) {
          return {
            error: `Format non supporté. Extensions valides: ${validExtensions.join(
              ", "
            )}`,
          };
        }

        // Génération d'un nom de fichier sécurisé
        const secureFileName = generateSecureFileName(fileName);
        const uploadPath = path.join(
          process.cwd(),
          "uploads",
          "roms",
          emulatorType,
          secureFileName
        );

        // Création du dossier si nécessaire
        await fs.mkdir(path.dirname(uploadPath), { recursive: true });

        // Décodage et sauvegarde du fichier
        const buffer = Buffer.from(fileData, "base64");
        await fs.writeFile(uploadPath, buffer);

        // Validation du contenu ROM
        const romValidation = await validateROMContent(
          uploadPath,
          emulatorType
        );
        if (!romValidation.valid) {
          await fs.unlink(uploadPath); // Suppression si invalide
          return { error: `ROM invalide: ${romValidation.error}` };
        }

        return {
          romPath: uploadPath,
          fileName: secureFileName,
          size: fileSize,
          validation: romValidation,
          message: "ROM uploadée et validée avec succès",
        };
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  {
    name: "save_game_state",
    description: "Sauvegarde l'état actuel d'un jeu en cours",
    inputSchema: {
      type: "object",
      properties: {
        sessionId: {
          type: "string",
          description: "ID de session de l'émulateur",
        },
        gameName: { type: "string", description: "Nom du jeu" },
        stateData: { type: "object", description: "Données d'état du jeu" },
        slot: { type: "number", description: "Slot de sauvegarde (1-10)" },
      },
      required: ["sessionId", "gameName", "stateData", "slot"],
    },
    handler: async ({ sessionId, gameName, stateData, slot }) => {
      try {
        if (slot < 1 || slot > 10) {
          return { error: "Slot de sauvegarde invalide (1-10)" };
        }

        const saveFileName = `${gameName}_slot${slot}.json`;
        const savePath = path.join(
          process.cwd(),
          "uploads",
          "saves",
          sessionId,
          saveFileName
        );

        // Création du dossier si nécessaire
        await fs.mkdir(path.dirname(savePath), { recursive: true });

        const saveData = {
          gameName,
          sessionId,
          slot,
          stateData,
          savedAt: new Date().toISOString(),
          version: "1.0",
        };

        await fs.writeFile(savePath, JSON.stringify(saveData, null, 2));

        return {
          savePath,
          slot,
          savedAt: saveData.savedAt,
          message: `État sauvegardé dans le slot ${slot}`,
        };
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  {
    name: "load_game_state",
    description: "Charge un état de jeu sauvegardé",
    inputSchema: {
      type: "object",
      properties: {
        sessionId: {
          type: "string",
          description: "ID de session de l'émulateur",
        },
        gameName: { type: "string", description: "Nom du jeu" },
        slot: { type: "number", description: "Slot de sauvegarde (1-10)" },
      },
      required: ["sessionId", "gameName", "slot"],
    },
    handler: async ({ sessionId, gameName, slot }) => {
      try {
        const saveFileName = `${gameName}_slot${slot}.json`;
        const savePath = path.join(
          process.cwd(),
          "uploads",
          "saves",
          sessionId,
          saveFileName
        );

        const saveData = await fs.readFile(savePath, "utf8");
        const parsedData = JSON.parse(saveData);

        return {
          stateData: parsedData.stateData,
          slot,
          savedAt: parsedData.savedAt,
          message: `État chargé depuis le slot ${slot}`,
        };
      } catch (error) {
        return { error: "Sauvegarde non trouvée ou corrompue" };
      }
    },
  },

  {
    name: "get_emulator_performance",
    description: "Récupère les métriques de performance d'un émulateur",
    inputSchema: {
      type: "object",
      properties: {
        sessionId: {
          type: "string",
          description: "ID de session de l'émulateur",
        },
        metrics: {
          type: "array",
          items: {
            type: "string",
            enum: ["fps", "memory", "cpu", "audio", "all"],
          },
          description: "Métriques à récupérer",
        },
      },
      required: ["sessionId"],
    },
    handler: async ({ sessionId, metrics = ["all"] }) => {
      try {
        const performanceData = await simulatePerformanceMetrics(
          sessionId,
          metrics
        );

        return {
          sessionId,
          metrics: performanceData,
          timestamp: new Date().toISOString(),
          message: "Métriques de performance récupérées",
        };
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  {
    name: "configure_emulator_controls",
    description: "Configure les contrôles personnalisés pour un émulateur",
    inputSchema: {
      type: "object",
      properties: {
        emulatorType: {
          type: "string",
          enum: ["nes", "snes", "gb", "genesis", "arcade", "dos", "flash"],
          description: "Type d'émulateur",
        },
        controls: {
          type: "object",
          description: "Mapping des contrôles personnalisés",
        },
        profile: { type: "string", description: "Nom du profil de contrôles" },
      },
      required: ["emulatorType", "controls"],
    },
    handler: async ({ emulatorType, controls, profile = "default" }) => {
      try {
        const configPath = path.join(
          process.cwd(),
          "config",
          "emulators",
          `${emulatorType}_controls.json`
        );

        const controlConfig = {
          emulatorType,
          profile,
          controls,
          updatedAt: new Date().toISOString(),
          version: "1.0",
        };

        await fs.mkdir(path.dirname(configPath), { recursive: true });
        await fs.writeFile(configPath, JSON.stringify(controlConfig, null, 2));

        return {
          configPath,
          profile,
          controls,
          message: "Configuration des contrôles sauvegardée",
        };
      } catch (error) {
        return { error: error.message };
      }
    },
  },

  {
    name: "list_available_roms",
    description: "Liste les ROMs disponibles pour un émulateur",
    inputSchema: {
      type: "object",
      properties: {
        emulatorType: {
          type: "string",
          enum: ["nes", "snes", "gb", "genesis", "arcade", "dos", "flash"],
          description: "Type d'émulateur",
        },
        includeBuiltin: {
          type: "boolean",
          description: "Inclure les ROMs intégrées",
        },
      },
      required: ["emulatorType"],
    },
    handler: async ({ emulatorType, includeBuiltin = true }) => {
      try {
        const roms = [];

        if (includeBuiltin) {
          const builtinRoms = getBuiltinROMs(emulatorType);
          roms.push(...builtinRoms);
        }

        const customRomsPath = path.join(
          process.cwd(),
          "uploads",
          "roms",
          emulatorType
        );

        try {
          const files = await fs.readdir(customRomsPath);
          for (const file of files) {
            const filePath = path.join(customRomsPath, file);
            const stats = await fs.stat(filePath);

            roms.push({
              name: file,
              path: filePath,
              size: stats.size,
              type: "custom",
              uploadedAt: stats.mtime,
            });
          }
        } catch (error) {
          // Dossier n'existe pas encore
        }

        return {
          emulatorType,
          roms,
          count: roms.length,
          message: `${roms.length} ROMs trouvées pour ${emulatorType}`,
        };
      } catch (error) {
        return { error: error.message };
      }
    },
  },
];

// Fonctions utilitaires
function getEmulatorConfig(emulatorType) {
  const configs = {
    nes: {
      core: "jsnes",
      resolution: { width: 256, height: 240 },
      audio: { sampleRate: 44100, channels: 1 },
      controls: {
        up: "ArrowUp",
        down: "ArrowDown",
        left: "ArrowLeft",
        right: "ArrowRight",
        a: "KeyZ",
        b: "KeyX",
        start: "Enter",
        select: "Shift",
      },
    },
    snes: {
      core: "snes9x",
      resolution: { width: 256, height: 224 },
      audio: { sampleRate: 32000, channels: 2 },
      controls: {
        up: "ArrowUp",
        down: "ArrowDown",
        left: "ArrowLeft",
        right: "ArrowRight",
        a: "KeyZ",
        b: "KeyX",
        x: "KeyA",
        y: "KeyS",
        l: "KeyQ",
        r: "KeyW",
        start: "Enter",
        select: "Shift",
      },
    },
    gb: {
      core: "gbjs",
      resolution: { width: 160, height: 144 },
      audio: { sampleRate: 44100, channels: 1 },
      controls: {
        up: "ArrowUp",
        down: "ArrowDown",
        left: "ArrowLeft",
        right: "ArrowRight",
        a: "KeyZ",
        b: "KeyX",
        start: "Enter",
        select: "Shift",
      },
    },
    genesis: {
      core: "genesis-plus-gx",
      resolution: { width: 320, height: 224 },
      audio: { sampleRate: 44100, channels: 2 },
      controls: {
        up: "ArrowUp",
        down: "ArrowDown",
        left: "ArrowLeft",
        right: "ArrowRight",
        a: "KeyZ",
        b: "KeyX",
        c: "KeyC",
        start: "Enter",
      },
    },
    arcade: {
      core: "mame",
      resolution: { width: 320, height: 240 },
      audio: { sampleRate: 44100, channels: 2 },
      controls: {
        up: "ArrowUp",
        down: "ArrowDown",
        left: "ArrowLeft",
        right: "ArrowRight",
        button1: "KeyZ",
        button2: "KeyX",
        button3: "KeyC",
        button4: "KeyV",
      },
    },
    dos: {
      core: "em-dosbox",
      resolution: { width: 320, height: 200 },
      audio: { sampleRate: 22050, channels: 1 },
      controls: { mouse: true, keyboard: true },
    },
    flash: {
      core: "ruffle",
      resolution: { width: 800, height: 600 },
      audio: { sampleRate: 44100, channels: 2 },
      controls: { mouse: true, keyboard: true },
    },
  };

  return configs[emulatorType] || configs.nes;
}

function getMaxROMSize(emulatorType) {
  const maxSizes = {
    nes: 512 * 1024, // 512KB
    snes: 4 * 1024 * 1024, // 4MB
    gb: 1 * 1024 * 1024, // 1MB
    genesis: 4 * 1024 * 1024, // 4MB
    arcade: 10 * 1024 * 1024, // 10MB
    dos: 50 * 1024 * 1024, // 50MB
    flash: 20 * 1024 * 1024, // 20MB
  };

  return maxSizes[emulatorType] || 1024 * 1024;
}

function getValidExtensions(emulatorType) {
  const extensions = {
    nes: [".nes", ".fds"],
    snes: [".smc", ".sfc", ".fig"],
    gb: [".gb", ".gbc"],
    genesis: [".md", ".gen", ".smd"],
    arcade: [".zip", ".7z"],
    dos: [".exe", ".com", ".bat"],
    flash: [".swf"],
  };

  return extensions[emulatorType] || [".bin"];
}

function generateSessionId() {
  return crypto.randomBytes(16).toString("hex");
}

function generateSecureFileName(originalName) {
  const timestamp = Date.now();
  const hash = crypto
    .createHash("md5")
    .update(originalName + timestamp)
    .digest("hex");
  const extension = path.extname(originalName);
  return `${hash}${extension}`;
}

async function validateROM(romPath, emulatorType) {
  try {
    const stats = await fs.stat(romPath);
    const maxSize = getMaxROMSize(emulatorType);

    if (stats.size > maxSize) {
      return {
        valid: false,
        error: `Taille dépassée: ${stats.size} > ${maxSize}`,
      };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: "Fichier non trouvé" };
  }
}

async function validateROMContent(romPath, emulatorType) {
  try {
    const buffer = await fs.readFile(romPath);

    // Validation basique des headers selon le type
    const validations = {
      nes: () =>
        buffer.length >= 16 &&
        buffer[0] === 0x4e &&
        buffer[1] === 0x45 &&
        buffer[2] === 0x53 &&
        buffer[3] === 0x1a,
      snes: () =>
        buffer.length >= 512 &&
        (buffer[0x7fc0] === 0xaa || buffer[0x7fc0] === 0x55),
      gb: () => buffer.length >= 256 && buffer[0x100] === 0xc3,
      genesis: () =>
        buffer.length >= 512 &&
        buffer[0x100] === 0x20 &&
        buffer[0x101] === 0x00,
      arcade: () => true, // Validation ZIP
      dos: () => buffer.length >= 2 && buffer[0] === 0x4d && buffer[1] === 0x5a,
      flash: () =>
        buffer.length >= 3 &&
        buffer[0] === 0x46 &&
        buffer[1] === 0x57 &&
        buffer[2] === 0x53,
    };

    const validator = validations[emulatorType];
    if (!validator || !validator()) {
      return { valid: false, error: "Format de ROM invalide" };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: "Erreur de lecture du fichier" };
  }
}

async function simulateEmulatorLoad(emulatorType) {
  // Simulation du temps de chargement
  const loadTimes = {
    nes: 500,
    snes: 1000,
    gb: 300,
    genesis: 800,
    arcade: 1500,
    dos: 2000,
    flash: 600,
  };

  await new Promise((resolve) =>
    setTimeout(resolve, loadTimes[emulatorType] || 500)
  );
}

async function simulatePerformanceMetrics(sessionId, metrics) {
  const data = {
    fps: Math.floor(Math.random() * 20) + 50, // 50-70 FPS
    memory: Math.floor(Math.random() * 50) + 100, // 100-150 MB
    cpu: Math.floor(Math.random() * 30) + 20, // 20-50%
    audio: Math.floor(Math.random() * 10) + 90, // 90-100%
    timestamp: new Date().toISOString(),
  };

  if (metrics.includes("all")) {
    return data;
  }

  const filtered = {};
  metrics.forEach((metric) => {
    if (data[metric] !== undefined) {
      filtered[metric] = data[metric];
    }
  });

  return filtered;
}

function getBuiltinROMs(emulatorType) {
  const builtin = {
    nes: [
      { name: "Tetris", type: "builtin", size: 40960 },
      { name: "Super Mario Bros", type: "builtin", size: 40960 },
      { name: "Duck Hunt", type: "builtin", size: 24576 },
    ],
    snes: [
      { name: "Super Mario World", type: "builtin", size: 524288 },
      { name: "A Link to the Past", type: "builtin", size: 1048576 },
    ],
    gb: [
      { name: "Tetris", type: "builtin", size: 32768 },
      { name: "Pokemon Red", type: "builtin", size: 1048576 },
    ],
    genesis: [
      { name: "Sonic the Hedgehog", type: "builtin", size: 524288 },
      { name: "Streets of Rage", type: "builtin", size: 1048576 },
    ],
    arcade: [
      { name: "Pac-Man", type: "builtin", size: 16384 },
      { name: "Space Invaders", type: "builtin", size: 8192 },
    ],
    dos: [
      { name: "DOOM", type: "builtin", size: 2097152 },
      { name: "Wolfenstein 3D", type: "builtin", size: 1048576 },
    ],
    flash: [{ name: "Sample Game", type: "builtin", size: 102400 }],
  };

  return builtin[emulatorType] || [];
}

module.exports = emulatorTools;
