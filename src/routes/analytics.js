const express = require("express");
const router = express.Router();

// Import des services analytics
const AdvancedPredictiveAnalytics = require("../services/advancedPredictiveAnalytics");
const BusinessIntelligence = require("../services/businessIntelligence");
const RealTimeOptimization = require("../services/realTimeOptimization");
const AnomalyDetection = require("../services/anomalyDetection");
const ABTesting = require("../services/abTesting");
const PerformanceMetrics = require("../services/performanceMetrics");

// Initialisation des services
const predictiveAnalytics = new AdvancedPredictiveAnalytics();
const businessIntelligence = new BusinessIntelligence();
const realTimeOptimization = new RealTimeOptimization();
const anomalyDetection = new AnomalyDetection();
const abTesting = new ABTesting();
const performanceMetrics = new PerformanceMetrics();

// Initialiser tous les services au démarrage
Promise.all([
    predictiveAnalytics.initialize(),
    businessIntelligence.initialize(),
    realTimeOptimization.initialize(),
    anomalyDetection.initialize(),
    abTesting.initialize(),
    performanceMetrics.initialize()
]).then(() => {
    console.log("✅ Tous les services analytics initialisés");
}).catch(error => {
    console.error("❌ Erreur initialisation services analytics:", error);
});

// Routes Analytics Temps Réel
router.get("/real-time", async (req, res) => {
    try {
        const metrics = await businessIntelligence.generateRealTimeMetrics();
        res.json({
            success: true,
            data: metrics,
            timestamp: new Date()
        });
    } catch (error) {
        console.error("❌ Erreur métriques temps réel:", error);
        res.status(500).json({
            success: false,
            error: error.message,
            fallback: true
        });
    }
});

// Routes Prédictions Avancées
router.get("/predictions", async (req, res) => {
    try {
        const userId = req.query.userId || "demo_user";
        const timeframe = req.query.timeframe || "7d";
        
        const predictions = await predictiveAnalytics.predictUserBehavior(userId, timeframe);
        const trends = await predictiveAnalytics.predictGameTrends();
        const churnRisk = await predictiveAnalytics.predictChurnRisk(userId);
        
        res.json({
            success: true,
            data: {
                userBehavior: predictions,
                gameTrends: trends,
                churnRisk: churnRisk,
                optimizations: await predictiveAnalytics.optimizePredictions()
            }
        });
    } catch (error) {
        console.error("❌ Erreur prédictions:", error);
        res.status(500).json({
            success: false,
            error: error.message,
            fallback: predictiveAnalytics.getFallbackPrediction(req.query.userId || "demo")
        });
    }
});

// Routes Business Intelligence
router.get("/business", async (req, res) => {
    try {
        const metrics = await businessIntelligence.generateRealTimeMetrics();
        const segments = await businessIntelligence.analyzeUserSegments();
        const report = await businessIntelligence.generateBusinessReport("daily");
        
        res.json({
            success: true,
            data: {
                realTimeMetrics: metrics,
                userSegments: segments,
                dailyReport: report,
                kpis: Array.from(businessIntelligence.kpis.entries())
            }
        });
    } catch (error) {
        console.error("❌ Erreur business intelligence:", error);
        res.status(500).json({
            success: false,
            error: error.message,
            fallback: businessIntelligence.getFallbackMetrics()
        });
    }
});

// Routes A/B Testing
router.get("/experiments", async (req, res) => {
    try {
        const activeExperiments = await abTesting.getActiveExperiments();
        
        res.json({
            success: true,
            data: {
                experiments: activeExperiments,
                total: activeExperiments.length,
                summary: {
                    running: activeExperiments.filter(e => e.status === "running").length,
                    completed: activeExperiments.filter(e => e.status === "completed").length
                }
            }
        });
    } catch (error) {
        console.error("❌ Erreur expériences A/B:", error);
        res.status(500).json({
            success: false,
            error: error.message,
            fallback: { experiments: [] }
        });
    }
});

// Routes Optimisation Temps Réel
router.get("/optimizations", async (req, res) => {
    try {
        const currentMetrics = await realTimeOptimization.getCurrentMetrics();
        const optimizationReport = await realTimeOptimization.getOptimizationReport();
        const effectiveness = await realTimeOptimization.monitorOptimizationEffectiveness();
        
        res.json({
            success: true,
            data: {
                currentMetrics,
                optimizations: optimizationReport,
                effectiveness,
                status: "active"
            }
        });
    } catch (error) {
        console.error("❌ Erreur optimisations:", error);
        res.status(500).json({
            success: false,
            error: error.message,
            fallback: realTimeOptimization.getFallbackReport()
        });
    }
});

// Routes Détection d'Anomalies
router.get("/anomalies", async (req, res) => {
    try {
        const timeframe = req.query.timeframe || "24h";
        
        const detection = await anomalyDetection.simulateRealTimeDetection();
        const history = await anomalyDetection.getAnomalyHistory(timeframe);
        const report = await anomalyDetection.generateAnomalyReport();
        
        res.json({
            success: true,
            data: {
                current: detection,
                history,
                report,
                status: detection.severity
            }
        });
    } catch (error) {
        console.error("❌ Erreur détection anomalies:", error);
        res.status(500).json({
            success: false,
            error: error.message,
            fallback: anomalyDetection.getFallbackHistory()
        });
    }
});

// Routes Métriques de Performance
router.get("/performance", async (req, res) => {
    try {
        const currentMetrics = await performanceMetrics.getCurrentMetrics();
        const history = await performanceMetrics.getMetricsHistory("1h");
        const report = await performanceMetrics.generatePerformanceReport();
        
        res.json({
            success: true,
            data: {
                current: currentMetrics,
                history,
                report,
                benchmarks: await performanceMetrics.compareToBenchmarks()
            }
        });
    } catch (error) {
        console.error("❌ Erreur métriques performance:", error);
        res.status(500).json({
            success: false,
            error: error.message,
            fallback: performanceMetrics.getFallbackCurrentMetrics()
        });
    }
});

// Routes Actions (POST)
router.post("/optimize", async (req, res) => {
    try {
        const { type, parameters } = req.body;
        let result;
        
        switch (type) {
            case "real_time":
                result = await realTimeOptimization.optimizeInRealTime(parameters);
                break;
            case "predictions":
                result = await predictiveAnalytics.optimizePredictions();
                break;
            case "experiments":
                result = await abTesting.optimizeExperiments();
                break;
            default:
                throw new Error(`Type d'optimisation inconnu: ${type}`);
        }
        
        res.json({
            success: true,
            data: result,
            message: `Optimisation ${type} appliquée avec succès`
        });
    } catch (error) {
        console.error("❌ Erreur optimisation:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Route pour démarrer une expérience A/B
router.post("/experiments/:id/start", async (req, res) => {
    try {
        const experimentId = req.params.id;
        const result = await abTesting.startExperiment(experimentId);
        
        res.json({
            success: result.success,
            data: result.experiment,
            message: result.success ? "Expérience démarrée" : "Erreur démarrage"
        });
    } catch (error) {
        console.error("❌ Erreur démarrage expérience:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Route pour arrêter une expérience A/B
router.post("/experiments/:id/stop", async (req, res) => {
    try {
        const experimentId = req.params.id;
        const reason = req.body.reason || "manual";
        
        const result = await abTesting.stopExperiment(experimentId, reason);
        
        res.json({
            success: result.success,
            data: result.finalAnalysis,
            message: result.success ? "Expérience arrêtée" : "Erreur arrêt"
        });
    } catch (error) {
        console.error("❌ Erreur arrêt expérience:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Route pour assigner un utilisateur à un variant
router.post("/experiments/:id/assign", async (req, res) => {
    try {
        const experimentId = req.params.id;
        const userId = req.body.userId || req.session?.userId || "anonymous";
        
        const assignment = await abTesting.assignUserToVariant(userId, experimentId);
        
        res.json({
            success: !!assignment,
            data: assignment,
            message: assignment ? "Utilisateur assigné" : "Expérience non active"
        });
    } catch (error) {
        console.error("❌ Erreur assignation:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Route pour enregistrer une conversion
router.post("/experiments/:id/convert", async (req, res) => {
    try {
        const experimentId = req.params.id;
        const userId = req.body.userId || req.session?.userId || "anonymous";
        const metric = req.body.metric || "conversion";
        const value = req.body.value || 1;
        
        const recorded = await abTesting.recordConversion(userId, experimentId, metric, value);
        
        res.json({
            success: recorded,
            message: recorded ? "Conversion enregistrée" : "Utilisateur non assigné"
        });
    } catch (error) {
        console.error("❌ Erreur conversion:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Route Dashboard Analytics Complet
router.get("/dashboard", async (req, res) => {
    try {
        const [
            realTimeMetrics,
            predictions,
            businessMetrics,
            experiments,
            optimizations,
            anomalies,
            performance
        ] = await Promise.all([
            businessIntelligence.generateRealTimeMetrics(),
            predictiveAnalytics.predictUserBehavior("demo_user"),
            businessIntelligence.analyzeUserSegments(),
            abTesting.getActiveExperiments(),
            realTimeOptimization.getOptimizationReport(),
            anomalyDetection.simulateRealTimeDetection(),
            performanceMetrics.getCurrentMetrics()
        ]);

        res.json({
            success: true,
            dashboard: {
                realTime: realTimeMetrics,
                predictions,
                business: businessMetrics,
                experiments,
                optimizations,
                anomalies,
                performance
            },
            lastUpdate: new Date()
        });
    } catch (error) {
        console.error("❌ Erreur dashboard analytics:", error);
        res.status(500).json({
            success: false,
            error: error.message,
            fallback: {
                realTime: { users: { activeNow: 200 }, revenue: { today: 1000 } },
                predictions: { churnRisk: 0.3 },
                business: { segments: {} },
                experiments: [],
                optimizations: [],
                anomalies: { total: 0 },
                performance: { health: "good" }
            }
        });
    }
});

// Route de santé des services analytics
router.get("/health", async (req, res) => {
    try {
        const healthChecks = {
            predictiveAnalytics: await this.checkServiceHealth(predictiveAnalytics),
            businessIntelligence: await this.checkServiceHealth(businessIntelligence),
            realTimeOptimization: await this.checkServiceHealth(realTimeOptimization),
            anomalyDetection: await this.checkServiceHealth(anomalyDetection),
            abTesting: await this.checkServiceHealth(abTesting),
            performanceMetrics: await this.checkServiceHealth(performanceMetrics)
        };

        const allHealthy = Object.values(healthChecks).every(check => check.status === "healthy");

        res.json({
            success: true,
            status: allHealthy ? "healthy" : "degraded",
            services: healthChecks,
            timestamp: new Date()
        });
    } catch (error) {
        console.error("❌ Erreur health check:", error);
        res.status(500).json({
            success: false,
            status: "error",
            error: error.message
        });
    }
});

// Méthode utilitaire pour vérifier la santé des services
async function checkServiceHealth(service) {
    try {
        if (typeof service.initialize === "function") {
            const result = await service.initialize();
            return {
                status: result.success ? "healthy" : "degraded",
                message: result.message || result.error,
                lastCheck: new Date()
            };
        }
        return { status: "unknown", message: "Service non vérifiable" };
    } catch (error) {
        return { status: "error", message: error.message };
    }
}

module.exports = router;
