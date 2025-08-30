class AIOrchestrator {
  constructor() {
    this.services = {};
    this.isInitialized = false;
  }

  async initialize() {
    console.log("🎼 Initialisation AI Orchestrator...");

    const AIGenerative = require("./aiGenerative");
    const AdvancedML = require("./advancedML");
    const NLPProcessor = require("./nlpProcessor");
    const ComputerVision = require("./computerVision");
    const EthicalAI = require("./ethicalAI");

    this.services = {
      generative: new AIGenerative(),
      ml: new AdvancedML(),
      nlp: new NLPProcessor(),
      vision: new ComputerVision(),
      ethics: new EthicalAI(),
    };

    await Promise.all(
      Object.values(this.services).map((service) => service.initialize())
    );

    this.isInitialized = true;
    return { success: true, message: "AI Orchestrator initialisé" };
  }

  async orchestrateRequest(type, data) {
    const workflow = {
      content: ["generative", "ethics"],
      prediction: ["ml", "ethics"],
      analysis: ["nlp", "ethics"],
      vision: ["vision", "ethics"],
    };

    const steps = workflow[type] || ["ethics"];
    const result = {};

    for (const step of steps) {
      if (step === "generative") {
        result[step] = await this.services[step].generateContent(
          data.prompt || "test",
          data.type || "text"
        );
      } else if (step === "ml") {
        result[step] = await this.services[step].predictBehavior(
          data.userId || "test",
          data.context || "gaming"
        );
      } else if (step === "nlp") {
        result[step] = await this.services[step].analyzeSentiment(
          data.text || "test text"
        );
      } else if (step === "vision") {
        result[step] = await this.services[step].recognizeGame(
          data.image || "test_image"
        );
      } else if (step === "ethics") {
        result[step] = await this.services[step].detectBias(data);
      }
    }

    return result;
  }
}

module.exports = AIOrchestrator;
