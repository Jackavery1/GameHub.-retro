# Guide d'Intégration des Émulateurs Open-Source

## Vue d'ensemble

Ce guide explique comment intégrer des émulateurs open-source dans GameHub Retro pour améliorer la compatibilité et les performances.

## Émulateurs Supportés

### 1. **EmulatorJS** (Recommandé)

- **Avantages** : Facile à intégrer, support étendu, interface moderne
- **Systèmes** : NES, SNES, N64, PS1, GameCube, etc.
- **Performance** : Excellente
- **Complexité** : Faible

### 2. **RetroArch Web**

- **Avantages** : Cores natifs, performance optimale, compatibilité maximale
- **Systèmes** : Tous les systèmes supportés par libretro
- **Performance** : Optimale
- **Complexité** : Moyenne

### 3. **Émulateurs Personnalisés** (Actuels)

- **Avantages** : Contrôle total, expérience unique
- **Systèmes** : NES, SNES, Game Boy
- **Performance** : Variable
- **Complexité** : Élevée

## Installation

### Option 1 : EmulatorJS (Recommandé)

#### Étape 1 : Télécharger EmulatorJS

```bash
# Cloner le repository
git clone https://github.com/EmulatorJS/EmulatorJS.git
cd EmulatorJS

# Ou télécharger depuis le site officiel
# https://emulatorjs.org/
```

#### Étape 2 : Configurer l'hébergement

```bash
# Copier les fichiers dans votre dossier public
cp -r EmulatorJS/dist/* public/emulatorjs/

# Ou utiliser un CDN (plus simple)
# https://emulatorjs.org/
```

#### Étape 3 : Configurer les ROMs

```bash
# Créer la structure des dossiers
mkdir -p public/roms/nes
mkdir -p public/roms/snes
mkdir -p public/roms/gb
mkdir -p public/roms/genesis
mkdir -p public/roms/n64
mkdir -p public/roms/ps1

# Ajouter vos ROMs dans les dossiers correspondants
# Format recommandé : .zip pour EmulatorJS
```

### Option 2 : RetroArch Web

#### Étape 1 : Télécharger les cores

```bash
# Télécharger depuis le buildbot libretro
# https://buildbot.libretro.com/stable/1.10.0/emscripten/

# Cores recommandés :
# - fceumm_libretro.js (NES)
# - snes9x_libretro.js (SNES)
# - gambatte_libretro.js (Game Boy)
# - genesis_plus_gx_libretro.js (Genesis)
```

#### Étape 2 : Configurer l'intégration

```bash
# Copier les cores dans votre dossier public
mkdir -p public/cores
cp *.js public/cores/
```

## Configuration

### Interface de Configuration

L'interface de configuration permet de choisir entre les différents émulateurs :

1. **Type d'Émulateur** : Active/désactive les émulateurs open-source
2. **Émulateur Préféré** : Choisit entre EmulatorJS, RetroArch ou les émulateurs personnalisés
3. **Sauvegarde** : Configure la sauvegarde automatique
4. **Audio** : Active/désactive le son
5. **Manette** : Active le support des manettes
6. **Qualité** : Ajuste la qualité graphique et audio
7. **Affichage** : Configure le mode plein écran

### Configuration Avancée

#### EmulatorJS

```javascript
// Configuration EmulatorJS
const emulatorConfig = {
  system: "nes",
  rom: "/roms/nes/super-mario-bros.zip",
  bios: "/bios/nes/",
  fullscreen: true,
  quality: "high",
  audio: true,
};
```

#### RetroArch

```javascript
// Configuration RetroArch
const retroArchConfig = {
  core: "fceumm",
  rom: "/roms/nes/super-mario-bros.nes",
  quality: "high",
  audio: true,
  saveStates: true,
};
```

## Utilisation

### Chargement d'un Émulateur

```javascript
// Charger un émulateur avec l'intégration
await window.EmulatorIntegration.loadEmulator("nes", "/roms/nes/game.nes", {
  fullscreen: true,
  quality: "high",
});
```

### Sauvegarde/Chargement

```javascript
// Sauvegarder l'état
await window.EmulatorIntegration.saveState(0);

// Charger l'état
await window.EmulatorIntegration.loadState(0);
```

### Configuration

```javascript
// Ouvrir l'interface de configuration
window.emulatorSettings.showSettings();

// Obtenir la configuration actuelle
const settings = window.emulatorSettings.getSettings();
```

## Systèmes Supportés

| Système  | EmulatorJS | RetroArch | Personnalisé |
| -------- | ---------- | --------- | ------------ |
| NES      | ✅         | ✅        | ✅           |
| SNES     | ✅         | ✅        | ✅           |
| Game Boy | ✅         | ✅        | ✅           |
| Genesis  | ✅         | ✅        | ❌           |
| N64      | ✅         | ✅        | ❌           |
| PS1      | ✅         | ✅        | ❌           |
| PS2      | ❌         | ✅        | ❌           |
| GameCube | ❌         | ✅        | ❌           |

## Performance

### Recommandations par Appareil

#### Ordinateurs Puissants

- **Émulateur** : RetroArch
- **Qualité** : Haute
- **Audio** : Activé
- **Manette** : Activé

#### Ordinateurs Moyens

- **Émulateur** : EmulatorJS
- **Qualité** : Moyenne
- **Audio** : Activé
- **Manette** : Activé

#### Appareils Mobiles

- **Émulateur** : EmulatorJS
- **Qualité** : Faible
- **Audio** : Désactivé
- **Manette** : Désactivé

## Dépannage

### Problèmes Courants

#### EmulatorJS ne se charge pas

```javascript
// Vérifier la console pour les erreurs
console.log("Capacités détectées:", window.EmulatorIntegration.capabilities);

// Vérifier que WebAssembly est supporté
if (typeof WebAssembly === "undefined") {
  console.error("WebAssembly non supporté");
}
```

#### RetroArch ne fonctionne pas

```javascript
// Vérifier que les cores sont chargés
if (!window.RetroArch) {
  console.error("RetroArch non chargé");
}

// Vérifier la compatibilité du navigateur
if (!window.EmulatorIntegration.capabilities.webAssembly) {
  console.error("WebAssembly requis pour RetroArch");
}
```

#### Sauvegardes perdues

```javascript
// Vérifier le stockage local
console.log("Sauvegardes disponibles:", localStorage.getItem("emulator_saves"));

// Vérifier IndexedDB
if ("indexedDB" in window) {
  console.log("IndexedDB disponible");
}
```

### Optimisation des Performances

#### Réduction de la Latence

```javascript
// Configuration pour réduire la latence
const lowLatencyConfig = {
  quality: "low",
  audio: false,
  fullscreen: false,
  vsync: false,
};
```

#### Amélioration de la Qualité

```javascript
// Configuration pour la meilleure qualité
const highQualityConfig = {
  quality: "high",
  audio: true,
  fullscreen: true,
  vsync: true,
  shaders: true,
};
```

## Sécurité

### Validation des ROMs

- Toutes les ROMs sont validées avant chargement
- Formats supportés vérifiés
- Tailles maximales respectées
- Contenu vérifié pour la sécurité

### Stockage Sécurisé

- Sauvegardes chiffrées
- Accès restreint aux utilisateurs connectés
- Nettoyage automatique des données temporaires

## Support

### Ressources Utiles

- [Documentation EmulatorJS](https://emulatorjs.org/docs/)
- [Documentation RetroArch](https://docs.libretro.com/)
- [Buildbot Libretro](https://buildbot.libretro.com/)

### Communauté

- [Forum EmulatorJS](https://github.com/EmulatorJS/EmulatorJS/discussions)
- [Discord RetroArch](https://discord.gg/retroarch)

## Conclusion

L'intégration des émulateurs open-source offre une expérience de jeu supérieure avec une compatibilité maximale et des performances optimales. L'interface de configuration permet aux utilisateurs de choisir l'émulateur qui convient le mieux à leurs besoins et à leur matériel.
