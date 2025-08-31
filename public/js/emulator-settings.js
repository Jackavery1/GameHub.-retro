// Interface de configuration des émulateurs
class EmulatorSettings {
  constructor() {
    this.settings = {
      useOpenSource: true,
      preferredEmulator: "emulatorjs",
      autoSave: true,
      fullscreen: false,
      quality: "high",
      audioEnabled: true,
      controllerSupport: true,
    };

    this.availableEmulators = {
      nes: ["emulatorjs", "retroarch", "custom"],
      snes: ["emulatorjs", "retroarch", "custom"],
      gb: ["emulatorjs", "retroarch", "custom"],
      genesis: ["emulatorjs", "retroarch", "custom"],
      n64: ["emulatorjs", "retroarch"],
      ps1: ["emulatorjs", "retroarch"],
      ps2: ["retroarch"],
      gamecube: ["retroarch"],
    };
  }

  // Afficher l'interface de configuration
  showSettings() {
    const modal = this.createSettingsModal();
    document.body.appendChild(modal);

    // Animation d'entrée
    setTimeout(() => {
      modal.classList.add("show");
    }, 10);
  }

  // Créer le modal de configuration
  createSettingsModal() {
    const modal = document.createElement("div");
    modal.className = "emulator-settings-modal";
    modal.innerHTML = `
      <div class="settings-overlay"></div>
      <div class="settings-content">
        <div class="settings-header">
          <h2>⚙️ Configuration des Émulateurs</h2>
          <button class="close-btn" onclick="this.closest('.emulator-settings-modal').remove()">×</button>
        </div>
        
        <div class="settings-body">
          <div class="settings-section">
            <h3>🎮 Type d'Émulateur</h3>
            <div class="setting-item">
              <label>
                <input type="checkbox" id="useOpenSource" ${
                  this.settings.useOpenSource ? "checked" : ""
                }>
                Utiliser les émulateurs open-source (recommandé)
              </label>
              <p class="setting-description">
                Active les émulateurs professionnels comme EmulatorJS et RetroArch pour une meilleure compatibilité et performance.
              </p>
            </div>
          </div>

          <div class="settings-section">
            <h3>🚀 Émulateur Préféré</h3>
            <div class="setting-item">
              <select id="preferredEmulator">
                <option value="emulatorjs" ${
                  this.settings.preferredEmulator === "emulatorjs"
                    ? "selected"
                    : ""
                }>
                  EmulatorJS (Recommandé)
                </option>
                <option value="retroarch" ${
                  this.settings.preferredEmulator === "retroarch"
                    ? "selected"
                    : ""
                }>
                  RetroArch (Avancé)
                </option>
                <option value="custom" ${
                  this.settings.preferredEmulator === "custom" ? "selected" : ""
                }>
                  Émulateurs personnalisés
                </option>
              </select>
              <p class="setting-description">
                EmulatorJS offre une compatibilité maximale, RetroArch une performance optimale, et les émulateurs personnalisés une expérience unique.
              </p>
            </div>
          </div>

          <div class="settings-section">
            <h3>💾 Sauvegarde</h3>
            <div class="setting-item">
              <label>
                <input type="checkbox" id="autoSave" ${
                  this.settings.autoSave ? "checked" : ""
                }>
                Sauvegarde automatique
              </label>
              <p class="setting-description">
                Sauvegarde automatiquement votre progression toutes les 5 minutes.
              </p>
            </div>
          </div>

          <div class="settings-section">
            <h3>🎵 Audio</h3>
            <div class="setting-item">
              <label>
                <input type="checkbox" id="audioEnabled" ${
                  this.settings.audioEnabled ? "checked" : ""
                }>
                Activer l'audio
              </label>
              <p class="setting-description">
                Active le son des jeux (peut affecter les performances sur certains appareils).
              </p>
            </div>
          </div>

          <div class="settings-section">
            <h3>🎮 Manette</h3>
            <div class="setting-item">
              <label>
                <input type="checkbox" id="controllerSupport" ${
                  this.settings.controllerSupport ? "checked" : ""
                }>
                Support des manettes
              </label>
              <p class="setting-description">
                Active le support des manettes USB et Bluetooth (Gamepad API).
              </p>
            </div>
          </div>

          <div class="settings-section">
            <h3>📊 Qualité</h3>
            <div class="setting-item">
              <select id="quality">
                <option value="low" ${
                  this.settings.quality === "low" ? "selected" : ""
                }>Faible (Performance)</option>
                <option value="medium" ${
                  this.settings.quality === "medium" ? "selected" : ""
                }>Moyenne (Équilibré)</option>
                <option value="high" ${
                  this.settings.quality === "high" ? "selected" : ""
                }>Haute (Qualité)</option>
              </select>
              <p class="setting-description">
                Ajuste la qualité graphique et audio selon vos préférences de performance.
              </p>
            </div>
          </div>

          <div class="settings-section">
            <h3>📱 Affichage</h3>
            <div class="setting-item">
              <label>
                <input type="checkbox" id="fullscreen" ${
                  this.settings.fullscreen ? "checked" : ""
                }>
                Mode plein écran par défaut
              </label>
              <p class="setting-description">
                Lance automatiquement les jeux en mode plein écran.
              </p>
            </div>
          </div>
        </div>

        <div class="settings-footer">
          <button class="btn-secondary" onclick="this.closest('.emulator-settings-modal').remove()">Annuler</button>
          <button class="btn-primary" onclick="emulatorSettings.saveSettings()">Sauvegarder</button>
        </div>
      </div>
    `;

    return modal;
  }

  // Sauvegarder les paramètres
  saveSettings() {
    const newSettings = {
      useOpenSource: document.getElementById("useOpenSource").checked,
      preferredEmulator: document.getElementById("preferredEmulator").value,
      autoSave: document.getElementById("autoSave").checked,
      audioEnabled: document.getElementById("audioEnabled").checked,
      controllerSupport: document.getElementById("controllerSupport").checked,
      quality: document.getElementById("quality").value,
      fullscreen: document.getElementById("fullscreen").checked,
    };

    // Sauvegarder dans localStorage
    localStorage.setItem("emulator_settings", JSON.stringify(newSettings));

    // Mettre à jour la configuration globale
    this.settings = { ...this.settings, ...newSettings };

    // Mettre à jour l'intégration émulateur si disponible
    if (window.EmulatorIntegration) {
      window.EmulatorIntegration.updateConfig(newSettings);
    }

    // Fermer le modal
    document.querySelector(".emulator-settings-modal").remove();

    // Afficher une notification
    this.showNotification("✅ Configuration sauvegardée", "success");
  }

  // Charger les paramètres
  loadSettings() {
    const savedSettings = localStorage.getItem("emulator_settings");
    if (savedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
    }
  }

  // Obtenir les paramètres
  getSettings() {
    return this.settings;
  }

  // Obtenir l'émulateur recommandé pour un système
  getRecommendedEmulator(system) {
    if (!this.settings.useOpenSource) {
      return "custom";
    }

    const available = this.availableEmulators[system] || ["custom"];
    const preferred = this.settings.preferredEmulator;

    // Vérifier si l'émulateur préféré est disponible pour ce système
    if (available.includes(preferred)) {
      return preferred;
    }

    // Sinon, retourner le premier disponible
    return available[0];
  }

  // Afficher une notification
  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `emulator-notification emulator-notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
    }, 100);

    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // Créer un bouton de configuration
  createSettingsButton() {
    const button = document.createElement("button");
    button.className = "emulator-settings-btn";
    button.innerHTML = "⚙️";
    button.title = "Configuration des émulateurs";
    button.onclick = () => this.showSettings();

    return button;
  }

  // Initialiser
  init() {
    this.loadSettings();

    // Ajouter le bouton de configuration dans les pages d'émulateurs
    this.addSettingsButtonToPages();

    console.log("⚙️ Configuration des émulateurs initialisée");
  }

  // Ajouter le bouton de configuration aux pages
  addSettingsButtonToPages() {
    // Vérifier si nous sommes sur une page d'émulateur
    if (window.location.pathname.includes("/arcade/")) {
      const header = document.querySelector(".hero-title");
      if (header) {
        const settingsBtn = this.createSettingsButton();
        header.parentNode.insertBefore(settingsBtn, header.nextSibling);
      }
    }
  }
}

// Styles CSS pour l'interface
const emulatorSettingsStyles = `
  .emulator-settings-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .emulator-settings-modal.show {
    opacity: 1;
  }

  .settings-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
  }

  .settings-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--bg1);
    border: 2px solid var(--neon);
    border-radius: 12px;
    padding: 0;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 0 30px rgba(0, 247, 255, 0.3);
  }

  .settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid var(--neon);
    background: linear-gradient(45deg, var(--bg2), var(--bg1));
  }

  .settings-header h2 {
    margin: 0;
    color: var(--neon);
    font-size: 1.5em;
  }

  .close-btn {
    background: none;
    border: none;
    color: var(--neon);
    font-size: 2em;
    cursor: pointer;
    padding: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  .close-btn:hover {
    background: var(--neon);
    color: var(--bg1);
  }

  .settings-body {
    padding: 20px;
  }

  .settings-section {
    margin-bottom: 25px;
  }

  .settings-section h3 {
    color: var(--yellow);
    margin-bottom: 10px;
    font-size: 1.2em;
  }

  .setting-item {
    margin-bottom: 15px;
  }

  .setting-item label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-weight: bold;
  }

  .setting-item input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: var(--neon);
  }

  .setting-item select {
    width: 100%;
    padding: 10px;
    background: var(--bg2);
    border: 1px solid var(--neon);
    color: var(--text);
    border-radius: 6px;
    font-size: 14px;
  }

  .setting-description {
    margin-top: 5px;
    font-size: 0.9em;
    color: var(--text-secondary);
    font-style: italic;
  }

  .settings-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 20px;
    border-top: 1px solid var(--neon);
    background: var(--bg2);
  }

  .emulator-settings-btn {
    background: var(--neon);
    color: var(--bg1);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 1.2em;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-left: 10px;
  }

  .emulator-settings-btn:hover {
    background: var(--yellow);
    transform: scale(1.1);
  }

  .emulator-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    z-index: 10001;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  }

  .emulator-notification.show {
    transform: translateX(0);
  }

  .emulator-notification-success {
    background: #27ae60;
  }

  .emulator-notification-error {
    background: #e74c3c;
  }

  .emulator-notification-info {
    background: #3498db;
  }
`;

// Ajouter les styles au document
const styleSheet = document.createElement("style");
styleSheet.textContent = emulatorSettingsStyles;
document.head.appendChild(styleSheet);

// Instance globale
window.emulatorSettings = new EmulatorSettings();

// Initialisation automatique
document.addEventListener("DOMContentLoaded", () => {
  window.emulatorSettings.init();
});
