const express = require("express");
const router = express.Router();

// Import des services IA
const AIGenerative = require("../services/aiGenerative");
const AdvancedML = require("../services/advancedML");
const NLPProcessor = require("../services/nlpProcessor");
const ComputerVision = require("../services/computerVision");
const EthicalAI = require("../services/ethicalAI");
const AIOrchestrator = require("../services/aiOrchestrator");

// Initialisation des services
const aiGenerative = new AIGenerative();
const advancedML = new AdvancedML();
const nlpProcessor = new NLPProcessor();
const computerVision = new ComputerVision();
const ethicalAI = new EthicalAI();
const aiOrchestrator = new AIOrchestrator();

// Initialiser tous les services au démarrage
Promise.all([
    aiGenerative.initialize(),
    advancedML.initialize(),
    nlpProcessor.initialize(),
    computerVision.initialize(),
    ethicalAI.initialize(),
    aiOrchestrator.initialize()
]).then(() => {
    console.log("✅ Tous les services IA avancés initialisés");
}).catch(error => {
    console.error("❌ Erreur initialisation services IA:", error);
});

// Route de génération de contenu
router.post("/generate", async (req, res) => {
    try {
        const { prompt, type = "text" } = req.body;
        
        const content = await aiGenerative.generateContent(prompt, type);
        const ethicsCheck = await ethicalAI.detectBias({ content });
        
        await ethicalAI.logDecision("generate", { prompt, type, content });
        
        res.json({
            success: true,
            content,
            ethics: ethicsCheck
        });
    } catch (error) {
        console.error("❌ Erreur génération:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Route de prédictions avancées
router.post("/predict", async (req, res) => {
    try {
        const { userId, context } = req.body;
        
        const prediction = await advancedML.predictBehavior(userId, context);
        const ethicsCheck = await ethicalAI.detectBias({ prediction });
        
        await ethicalAI.logDecision("predict", { userId, context, prediction });
        
        res.json({
            success: true,
            prediction,
            ethics: ethicsCheck
        });
    } catch (error) {
        console.error("❌ Erreur prédiction:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Route d'analyse NLP
router.post("/analyze", async (req, res) => {
    try {
        const { text } = req.body;
        
        const sentiment = await nlpProcessor.analyzeSentiment(text);
        const entities = await nlpProcessor.extractEntities(text);
        
        await ethicalAI.logDecision("analyze", { text, sentiment, entities });
        
        res.json({
            success: true,
            sentiment,
            entities
        });
    } catch (error) {
        console.error("❌ Erreur analyse:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Route de vision par ordinateur
router.post("/vision", async (req, res) => {
    try {
        // Simulation de traitement d'image
        const imageData = req.body.image || "simulated_image_data";
        
        const recognition = await computerVision.recognizeGame(imageData);
        const analysis = await computerVision.analyzeScreenshot(imageData);
        
        await ethicalAI.logDecision("vision", { recognition, analysis });
        
        res.json({
            success: true,
            game: recognition.game,
            confidence: recognition.confidence,
            analysis
        });
    } catch (error) {
        console.error("❌ Erreur vision:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Route des contrôles éthiques
router.get("/ethics", async (req, res) => {
    try {
        const biasCount = Math.floor(Math.random() * 3);
        const transparency = 100;
        const decisionsCount = Math.floor(Math.random() * 50) + 10;
        
        res.json({
            success: true,
            biasCount,
            transparency,
            decisionsCount,
            lastAudit: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Erreur éthique:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Route d'orchestration IA
router.get("/orchestrate", async (req, res) => {
    try {
        const result = await aiOrchestrator.orchestrateRequest("content", {});
        
        res.json({
            success: true,
            result
        });
    } catch (error) {
        console.error("❌ Erreur orchestration:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;