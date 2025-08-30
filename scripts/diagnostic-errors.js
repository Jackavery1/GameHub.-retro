const fs = require("fs");
const path = require("path");

class DiagnosticErrors {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.fixes = [];
  }

  async runDiagnostic() {
    console.log("🔍 DIAGNOSTIC COMPLET DU PROJET");
    console.log("=".repeat(60));

    try {
      // Vérifier la structure du projet
      await this.checkProjectStructure();

      // Vérifier les fichiers de configuration
      await this.checkConfigurationFiles();

      // Vérifier les services
      await this.checkServices();

      // Vérifier les routes
      await this.checkRoutes();

      // Vérifier les vues
      await this.checkViews();

      // Vérifier les scripts
      await this.checkScripts();

      // Vérifier les dépendances
      await this.checkDependencies();

      // Générer le rapport
      this.generateReport();
    } catch (error) {
      console.error("❌ Erreur diagnostic:", error);
    }
  }

  async checkProjectStructure() {
    console.log("\n📁 Vérification de la structure du projet...");

    const requiredDirs = [
      "src",
      "src/services",
      "src/routes",
      "views",
      "views/partials",
      "public",
      "public/js",
      "scripts",
      "data",
    ];

    for (const dir of requiredDirs) {
      if (!fs.existsSync(dir)) {
        this.errors.push(`Répertoire manquant: ${dir}`);
        console.log(`❌ ${dir}: MANQUANT`);
      } else {
        console.log(`✅ ${dir}: Présent`);
      }
    }
  }

  async checkConfigurationFiles() {
    console.log("\n⚙️ Vérification des fichiers de configuration...");

    const configFiles = ["package.json", "src/server.js", "public/styles.css"];

    for (const file of configFiles) {
      try {
        if (!fs.existsSync(file)) {
          this.errors.push(`Fichier de configuration manquant: ${file}`);
          console.log(`❌ ${file}: MANQUANT`);
          continue;
        }

        const content = fs.readFileSync(file, "utf8");

        if (file === "package.json") {
          try {
            const packageData = JSON.parse(content);
            if (!packageData.scripts) {
              this.warnings.push(`package.json: Section scripts manquante`);
            }
            console.log(`✅ ${file}: JSON valide`);
          } catch (e) {
            this.errors.push(`package.json: JSON invalide - ${e.message}`);
            console.log(`❌ ${file}: JSON invalide`);
          }
        } else {
          console.log(`✅ ${file}: Présent`);
        }
      } catch (error) {
        this.errors.push(`Erreur lecture ${file}: ${error.message}`);
        console.log(`❌ ${file}: Erreur lecture`);
      }
    }
  }

  async checkServices() {
    console.log("\n🔧 Vérification des services...");

    const services = [
      "aiGenerative.js",
      "advancedML.js",
      "nlpProcessor.js",
      "computerVision.js",
      "ethicalAI.js",
      "aiOrchestrator.js",
      "advancedPredictiveAnalytics.js",
      "businessIntelligence.js",
      "realTimeOptimization.js",
      "anomalyDetection.js",
      "abTesting.js",
      "performanceMetrics.js",
    ];

    for (const service of services) {
      const servicePath = path.join("src/services", service);
      try {
        if (!fs.existsSync(servicePath)) {
          this.errors.push(`Service manquant: ${service}`);
          console.log(`❌ ${service}: MANQUANT`);
          continue;
        }

        const content = fs.readFileSync(servicePath, "utf8");

        // Vérifier la syntaxe de base
        if (!content.includes("class") || !content.includes("module.exports")) {
          this.warnings.push(
            `${service}: Structure de classe ou export manquant`
          );
        }

        // Vérifier les erreurs de syntaxe courantes
        if (
          content.includes("process(") &&
          !content.includes("generateContent") &&
          !content.includes("predictBehavior") &&
          !content.includes("analyzeSentiment") &&
          !content.includes("recognizeGame") &&
          !content.includes("detectBias")
        ) {
          this.errors.push(
            `${service}: Méthode process() non définie dans l'orchestrateur`
          );
        }

        console.log(`✅ ${service}: Présent`);
      } catch (error) {
        this.errors.push(`Erreur lecture ${service}: ${error.message}`);
        console.log(`❌ ${service}: Erreur lecture`);
      }
    }
  }

  async checkRoutes() {
    console.log("\n🛣️ Vérification des routes...");

    const routes = ["mcp.js", "analytics.js", "ai.js"];

    for (const route of routes) {
      const routePath = path.join("src/routes", route);
      try {
        if (!fs.existsSync(routePath)) {
          this.errors.push(`Route manquante: ${route}`);
          console.log(`❌ ${route}: MANQUANT`);
          continue;
        }

        const content = fs.readFileSync(routePath, "utf8");

        if (!content.includes("express") || !content.includes("router")) {
          this.warnings.push(`${route}: Structure Express manquante`);
        }

        console.log(`✅ ${route}: Présent`);
      } catch (error) {
        this.errors.push(`Erreur lecture ${route}: ${error.message}`);
        console.log(`❌ ${route}: Erreur lecture`);
      }
    }
  }

  async checkViews() {
    console.log("\n🎨 Vérification des vues...");

    const views = [
      "dashboard.ejs",
      "home.ejs",
      "layout.ejs",
      "partials/head.ejs",
      "partials/footer.ejs",
      "partials/mcp-widgets.ejs",
      "partials/analytics-widgets.ejs",
      "partials/ai-advanced-widgets.ejs",
    ];

    for (const view of views) {
      const viewPath = path.join("views", view);
      try {
        if (!fs.existsSync(viewPath)) {
          this.errors.push(`Vue manquante: ${view}`);
          console.log(`❌ ${view}: MANQUANT`);
          continue;
        }

        const content = fs.readFileSync(viewPath, "utf8");

        if (content.length < 50) {
          this.warnings.push(`${view}: Contenu très court`);
        }

        console.log(`✅ ${view}: Présent`);
      } catch (error) {
        this.errors.push(`Erreur lecture ${view}: ${error.message}`);
        console.log(`❌ ${view}: Erreur lecture`);
      }
    }
  }

  async checkScripts() {
    console.log("\n📜 Vérification des scripts...");

    const scripts = [
      "phase6-start.js",
      "ai-advanced-test-suite.js",
      "analytics-test-suite.js",
    ];

    for (const script of scripts) {
      const scriptPath = path.join("scripts", script);
      try {
        if (!fs.existsSync(scriptPath)) {
          this.errors.push(`Script manquant: ${script}`);
          console.log(`❌ ${script}: MANQUANT`);
          continue;
        }

        const content = fs.readFileSync(scriptPath, "utf8");

        // Vérifier les erreurs de syntaxe courantes
        if (
          content.includes("package =") &&
          !content.includes("packageData =")
        ) {
          this.errors.push(`${script}: Variable 'package' réservée utilisée`);
        }

        // Vérifier les backticks non fermés (mais pas les template literals échappés)
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (
            line.includes("module.exports =") &&
            line.includes("`;") &&
            !line.includes("\\`")
          ) {
            this.errors.push(
              `${script}: Backticks non fermés à la ligne ${i + 1}`
            );
            break;
          }
        }

        console.log(`✅ ${script}: Présent`);
      } catch (error) {
        this.errors.push(`Erreur lecture ${script}: ${error.message}`);
        console.log(`❌ ${script}: Erreur lecture`);
      }
    }
  }

  async checkDependencies() {
    console.log("\n📦 Vérification des dépendances...");

    try {
      const packagePath = path.join("package.json");
      if (fs.existsSync(packagePath)) {
        const content = fs.readFileSync(packagePath, "utf8");
        const packageData = JSON.parse(content);

        const requiredDeps = ["express", "ejs", "mongoose"];
        for (const dep of requiredDeps) {
          if (!packageData.dependencies || !packageData.dependencies[dep]) {
            this.warnings.push(`Dépendance manquante: ${dep}`);
            console.log(`⚠️ ${dep}: MANQUANTE`);
          } else {
            console.log(`✅ ${dep}: Installée`);
          }
        }
      }
    } catch (error) {
      this.errors.push(`Erreur vérification dépendances: ${error.message}`);
    }
  }

  generateReport() {
    console.log("\n📊 RAPPORT DE DIAGNOSTIC");
    console.log("=".repeat(60));

    console.log(`\n❌ ERREURS CRITIQUES (${this.errors.length}):`);
    if (this.errors.length === 0) {
      console.log("✅ Aucune erreur critique détectée");
    } else {
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    console.log(`\n⚠️ AVERTISSEMENTS (${this.warnings.length}):`);
    if (this.warnings.length === 0) {
      console.log("✅ Aucun avertissement");
    } else {
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }

    console.log(`\n🔧 CORRECTIONS SUGGÉRÉES:`);
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log("✅ Aucune correction nécessaire");
    } else {
      this.generateFixSuggestions();
    }

    const totalIssues = this.errors.length + this.warnings.length;
    if (totalIssues === 0) {
      console.log("\n🎉 PROJET EN BON ÉTAT !");
    } else {
      console.log(`\n📈 STATUT: ${totalIssues} problème(s) détecté(s)`);
    }
  }

  generateFixSuggestions() {
    // Corriger les erreurs de syntaxe dans les scripts
    if (this.errors.some((e) => e.includes("Variable 'package' réservée"))) {
      console.log("1. Remplacer 'package' par 'packageData' dans les scripts");
    }

    if (this.errors.some((e) => e.includes("Backticks non fermés"))) {
      console.log("2. Fermer les backticks à la fin des scripts");
    }

    if (this.errors.some((e) => e.includes("Méthode process() non définie"))) {
      console.log("3. Corriger les appels de méthodes dans aiOrchestrator.js");
    }

    if (this.errors.some((e) => e.includes("Répertoire manquant"))) {
      console.log("4. Créer les répertoires manquants");
    }

    if (this.errors.some((e) => e.includes("Fichier manquant"))) {
      console.log("5. Recréer les fichiers manquants");
    }
  }
}

// Exécution automatique
if (require.main === module) {
  const diagnostic = new DiagnosticErrors();
  diagnostic.runDiagnostic().catch(console.error);
}

module.exports = DiagnosticErrors;
