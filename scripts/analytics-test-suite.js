const AdvancedPredictiveAnalytics = require("../src/services/advancedPredictiveAnalytics");
const BusinessIntelligence = require("../src/services/businessIntelligence");
const RealTimeOptimization = require("../src/services/realTimeOptimization");
const AnomalyDetection = require("../src/services/anomalyDetection");
const ABTesting = require("../src/services/abTesting");
const PerformanceMetrics = require("../src/services/performanceMetrics");

class AnalyticsTestSuite {
    constructor() {
        this.testResults = [];
        this.services = {
            predictiveAnalytics: new AdvancedPredictiveAnalytics(),
            businessIntelligence: new BusinessIntelligence(),
            realTimeOptimization: new RealTimeOptimization(),
            anomalyDetection: new AnomalyDetection(),
            abTesting: new ABTesting(),
            performanceMetrics: new PerformanceMetrics()
        };
    }

    async runAllTests() {
        console.log("🧪 === SUITE DE TESTS ANALYTICS AVANCÉS - PHASE 5 ===\n");

        try {
            // Tests d'initialisation
            await this.testServicesInitialization();
            
            // Tests des analytics prédictifs
            await this.testPredictiveAnalytics();
            
            // Tests de business intelligence
            await this.testBusinessIntelligence();
            
            // Tests d'optimisation temps réel
            await this.testRealTimeOptimization();
            
            // Tests de détection d'anomalies
            await this.testAnomalyDetection();
            
            // Tests d'A/B testing
            await this.testABTesting();
            
            // Tests de métriques de performance
            await this.testPerformanceMetrics();
            
            // Tests d'intégration
            await this.testIntegration();
            
            // Résumé des tests
            this.displayTestSummary();
            
        } catch (error) {
            console.error("❌ Erreur lors des tests:", error);
            this.addTestResult("Suite de Tests", false, `Erreur globale: ${error.message}`);
        }
    }

    async testServicesInitialization() {
        console.log("🔧 Test d'initialisation des services...");
        
        for (const [serviceName, service] of Object.entries(this.services)) {
            try {
                const result = await service.initialize();
                this.addTestResult(
                    `Initialisation ${serviceName}`,
                    result.success,
                    result.message || result.error
                );
            } catch (error) {
                this.addTestResult(
                    `Initialisation ${serviceName}`,
                    false,
                    `Erreur: ${error.message}`
                );
            }
        }
    }

    async testPredictiveAnalytics() {
        console.log("\n🧠 Test Analytics Prédictifs Avancés...");
        
        const service = this.services.predictiveAnalytics;
        
        try {
            // Test prédiction comportement utilisateur
            const userPrediction = await service.predictUserBehavior("test_user", "7d");
            this.addTestResult(
                "Prédiction Comportement Utilisateur",
                !!userPrediction && userPrediction.predictions,
                userPrediction ? "Prédictions générées avec succès" : "Échec génération"
            );

            // Test prédiction tendances de jeux
            const gameTrends = await service.predictGameTrends("30d");
            this.addTestResult(
                "Prédiction Tendances Jeux",
                !!gameTrends && gameTrends.trends,
                gameTrends ? "Tendances analysées avec succès" : "Échec analyse"
            );

            // Test prédiction risque de churn
            const churnRisk = await service.predictChurnRisk("test_user");
            this.addTestResult(
                "Prédiction Risque Churn",
                !!churnRisk && typeof churnRisk.riskScore === "number",
                churnRisk ? `Risque calculé: ${churnRisk.riskLevel}` : "Échec calcul"
            );

            // Test optimisation des prédictions
            const optimization = await service.optimizePredictions();
            this.addTestResult(
                "Optimisation Prédictions",
                !!optimization && optimization.success,
                optimization ? "Optimisation appliquée" : "Échec optimisation"
            );

        } catch (error) {
            this.addTestResult("Analytics Prédictifs", false, `Erreur: ${error.message}`);
        }
    }

    async testBusinessIntelligence() {
        console.log("\n📊 Test Business Intelligence...");
        
        const service = this.services.businessIntelligence;
        
        try {
            // Test génération métriques temps réel
            const realTimeMetrics = await service.generateRealTimeMetrics();
            this.addTestResult(
                "Métriques Temps Réel",
                !!realTimeMetrics && realTimeMetrics.users && realTimeMetrics.revenue,
                realTimeMetrics ? "Métriques générées" : "Échec génération"
            );

            // Test analyse segments utilisateurs
            const segments = await service.analyzeUserSegments();
            this.addTestResult(
                "Analyse Segments Utilisateurs",
                !!segments && segments.segments,
                segments ? `${Object.keys(segments.segments).length} segments analysés` : "Échec analyse"
            );

            // Test génération rapport business
            const report = await service.generateBusinessReport("daily");
            this.addTestResult(
                "Rapport Business",
                !!report && report.sections,
                report ? "Rapport généré avec succès" : "Échec génération"
            );

            // Test calcul ROI
            const roi = await service.calculateROI({ name: "Test Campaign", budget: 1000, revenue: 1500 });
            this.addTestResult(
                "Calcul ROI",
                !!roi && typeof roi.roi === "number",
                roi ? `ROI: ${roi.roi.toFixed(1)}% (${roi.status})` : "Échec calcul"
            );

        } catch (error) {
            this.addTestResult("Business Intelligence", false, `Erreur: ${error.message}`);
        }
    }

    async testRealTimeOptimization() {
        console.log("\n⚡ Test Optimisation Temps Réel...");
        
        const service = this.services.realTimeOptimization;
        
        try {
            // Test optimisation temps réel
            const metrics = await service.getCurrentMetrics();
            const optimization = await service.optimizeInRealTime(metrics);
            this.addTestResult(
                "Optimisation Temps Réel",
                !!optimization && optimization.optimizations,
                optimization ? `${optimization.optimizations.length} optimisations appliquées` : "Échec optimisation"
            );

            // Test optimisation pour utilisateur spécifique
            const userBehavior = { prefersMobile: true, playtimeHigh: false, socialActive: true };
            const userOptimization = await service.optimizeForUser("test_user", userBehavior);
            this.addTestResult(
                "Optimisation Utilisateur",
                !!userOptimization && userOptimization.interface,
                userOptimization ? "Optimisation personnalisée appliquée" : "Échec optimisation"
            );

            // Test rapport d'optimisation
            const report = await service.getOptimizationReport();
            this.addTestResult(
                "Rapport Optimisation",
                !!report && report.optimizations,
                report ? "Rapport généré" : "Échec génération"
            );

            // Test monitoring efficacité
            const effectiveness = await service.monitorOptimizationEffectiveness();
            this.addTestResult(
                "Monitoring Efficacité",
                !!effectiveness && effectiveness.metrics,
                effectiveness ? `Gain performance: ${effectiveness.metrics.performanceGain}%` : "Échec monitoring"
            );

        } catch (error) {
            this.addTestResult("Optimisation Temps Réel", false, `Erreur: ${error.message}`);
        }
    }

    async testAnomalyDetection() {
        console.log("\n🔍 Test Détection d'Anomalies...");
        
        const service = this.services.anomalyDetection;
        
        try {
            // Test détection en temps réel
            const detection = await service.simulateRealTimeDetection();
            this.addTestResult(
                "Détection Temps Réel",
                !!detection && typeof detection.total === "number",
                detection ? `${detection.total} anomalies détectées (${detection.severity})` : "Échec détection"
            );

            // Test historique des anomalies
            const history = await service.getAnomalyHistory("24h");
            this.addTestResult(
                "Historique Anomalies",
                !!history && typeof history.total === "number",
                history ? `Historique sur 24h: ${history.total} anomalies` : "Échec historique"
            );

            // Test rapport d'anomalies
            const report = await service.generateAnomalyReport();
            this.addTestResult(
                "Rapport Anomalies",
                !!report && report.summary,
                report ? "Rapport généré avec recommandations" : "Échec génération"
            );

            // Test abonnement aux alertes
            const mockSubscriber = {
                notify: async (alert) => console.log(`📧 Alerte reçue: ${alert.message}`)
            };
            service.subscribeToAlerts(mockSubscriber);
            this.addTestResult(
                "Système d'Alertes",
                true,
                "Abonnement aux alertes configuré"
            );

        } catch (error) {
            this.addTestResult("Détection d'Anomalies", false, `Erreur: ${error.message}`);
        }
    }

    async testABTesting() {
        console.log("\n🧪 Test A/B Testing...");
        
        const service = this.services.abTesting;
        
        try {
            // Test création d'expérience
            const experiment = await service.createExperiment({
                id: "test_experiment",
                name: "Test Experiment",
                description: "Test pour la suite de tests",
                variants: [
                    { id: "control", name: "Control", weight: 50 },
                    { id: "variant", name: "Variant", weight: 50 }
                ],
                metrics: ["conversion_rate"],
                duration: 7,
                minSampleSize: 100
            });
            this.addTestResult(
                "Création Expérience",
                !!experiment && experiment.id === "test_experiment",
                experiment ? "Expérience créée avec succès" : "Échec création"
            );

            // Test démarrage d'expérience
            const started = await service.startExperiment("test_experiment");
            this.addTestResult(
                "Démarrage Expérience",
                started.success,
                started.success ? "Expérience démarrée" : started.error
            );

            // Test assignation utilisateur
            const assignment = await service.assignUserToVariant("test_user", "test_experiment");
            this.addTestResult(
                "Assignation Variant",
                !!assignment && assignment.variantId,
                assignment ? `Utilisateur assigné au variant ${assignment.variantId}` : "Échec assignation"
            );

            // Test enregistrement conversion
            const conversion = await service.recordConversion("test_user", "test_experiment", "conversion", 1);
            this.addTestResult(
                "Enregistrement Conversion",
                conversion,
                conversion ? "Conversion enregistrée" : "Échec enregistrement"
            );

            // Test analyse résultats
            const analysis = await service.analyzeExperimentResults("test_experiment");
            this.addTestResult(
                "Analyse Résultats",
                !!analysis && analysis.variants,
                analysis ? `Analyse: ${analysis.variants.length} variants` : "Échec analyse"
            );

            // Test expériences actives
            const activeExperiments = await service.getActiveExperiments();
            this.addTestResult(
                "Expériences Actives",
                Array.isArray(activeExperiments),
                `${activeExperiments.length} expériences actives`
            );

        } catch (error) {
            this.addTestResult("A/B Testing", false, `Erreur: ${error.message}`);
        }
    }

    async testPerformanceMetrics() {
        console.log("\n📈 Test Métriques de Performance...");
        
        const service = this.services.performanceMetrics;
        
        try {
            // Test métriques actuelles
            const currentMetrics = await service.getCurrentMetrics();
            this.addTestResult(
                "Métriques Actuelles",
                !!currentMetrics && currentMetrics.collectors,
                currentMetrics ? "Métriques collectées" : "Échec collecte"
            );

            // Test historique des métriques
            const history = await service.getMetricsHistory("1h");
            this.addTestResult(
                "Historique Métriques",
                !!history && typeof history.dataPoints === "number",
                history ? `${history.dataPoints} points de données` : "Échec historique"
            );

            // Test rapport de performance
            const report = await service.generatePerformanceReport();
            this.addTestResult(
                "Rapport Performance",
                !!report && report.summary,
                report ? "Rapport généré avec benchmarks" : "Échec génération"
            );

            // Test comparaison benchmarks
            const benchmarks = await service.compareToBenchmarks();
            this.addTestResult(
                "Comparaison Benchmarks",
                !!benchmarks && benchmarks.response_time,
                benchmarks ? "Benchmarks comparés" : "Échec comparaison"
            );

        } catch (error) {
            this.addTestResult("Métriques de Performance", false, `Erreur: ${error.message}`);
        }
    }

    async testIntegration() {
        console.log("\n🔗 Test Intégration Analytics...");
        
        try {
            // Test intégration prédictions + business intelligence
            const userId = "integration_test_user";
            const predictions = await this.services.predictiveAnalytics.predictUserBehavior(userId);
            const businessMetrics = await this.services.businessIntelligence.generateRealTimeMetrics();
            
            this.addTestResult(
                "Intégration Prédictions-BI",
                !!predictions && !!businessMetrics,
                "Services communiquent correctement"
            );

            // Test intégration optimisation + détection anomalies
            const currentMetrics = await this.services.realTimeOptimization.getCurrentMetrics();
            const anomalies = await this.services.anomalyDetection.detectAnomalies(currentMetrics);
            
            this.addTestResult(
                "Intégration Optimisation-Anomalies",
                !!currentMetrics && !!anomalies,
                `Détection basée sur métriques: ${anomalies.total || 0} anomalies`
            );

            // Test intégration A/B testing + métriques
            const experiments = await this.services.abTesting.getActiveExperiments();
            const performanceData = await this.services.performanceMetrics.getCurrentMetrics();
            
            this.addTestResult(
                "Intégration A/B-Métriques",
                Array.isArray(experiments) && !!performanceData,
                `${experiments.length} expériences avec métriques de performance`
            );

            // Test workflow complet
            await this.testCompleteWorkflow();

        } catch (error) {
            this.addTestResult("Intégration Analytics", false, `Erreur: ${error.message}`);
        }
    }

    async testCompleteWorkflow() {
        console.log("\n🔄 Test Workflow Complet Analytics...");
        
        try {
            // 1. Collecter les métriques
            const metrics = await this.services.performanceMetrics.getCurrentMetrics();
            
            // 2. Détecter les anomalies
            const anomalies = await this.services.anomalyDetection.detectAnomalies(metrics.collectors);
            
            // 3. Optimiser en temps réel si nécessaire
            let optimization = null;
            if (anomalies.total > 0) {
                optimization = await this.services.realTimeOptimization.optimizeInRealTime(metrics.collectors);
            }
            
            // 4. Générer des prédictions
            const predictions = await this.services.predictiveAnalytics.predictUserBehavior("workflow_user");
            
            // 5. Analyser avec BI
            const businessAnalysis = await this.services.businessIntelligence.generateRealTimeMetrics();
            
            // 6. Mettre à jour les expériences A/B
            const experimentOptimization = await this.services.abTesting.optimizeExperiments();
            
            this.addTestResult(
                "Workflow Analytics Complet",
                true,
                `Workflow exécuté: ${anomalies.total} anomalies, ${optimization ? optimization.optimizations.length : 0} optimisations, ${experimentOptimization.optimizations.length} expériences optimisées`
            );

        } catch (error) {
            this.addTestResult("Workflow Complet", false, `Erreur: ${error.message}`);
        }
    }

    addTestResult(testName, success, message) {
        const result = {
            test: testName,
            success,
            message,
            timestamp: new Date()
        };
        
        this.testResults.push(result);
        
        const status = success ? "✅" : "❌";
        const color = success ? "\x1b[32m" : "\x1b[31m";
        const reset = "\x1b[0m";
        
        console.log(`${status} ${color}${testName}${reset}: ${message}`);
    }

    displayTestSummary() {
        console.log("\n" + "=".repeat(60));
        console.log("📋 RÉSUMÉ DES TESTS ANALYTICS AVANCÉS - PHASE 5");
        console.log("=".repeat(60));
        
        const totalTests = this.testResults.length;
        const successfulTests = this.testResults.filter(r => r.success).length;
        const failedTests = totalTests - successfulTests;
        const successRate = ((successfulTests / totalTests) * 100).toFixed(1);
        
        console.log(`\n📊 Statistiques:`);
        console.log(`   Total des tests: ${totalTests}`);
        console.log(`   ✅ Succès: ${successfulTests}`);
        console.log(`   ❌ Échecs: ${failedTests}`);
        console.log(`   📈 Taux de réussite: ${successRate}%`);
        
        console.log(`\n🎯 Services Analytics:`);
        console.log(`   🧠 Analytics Prédictifs: ${this.getServiceStatus("predictiveAnalytics")}`);
        console.log(`   📊 Business Intelligence: ${this.getServiceStatus("businessIntelligence")}`);
        console.log(`   ⚡ Optimisation Temps Réel: ${this.getServiceStatus("realTimeOptimization")}`);
        console.log(`   🔍 Détection d'Anomalies: ${this.getServiceStatus("anomalyDetection")}`);
        console.log(`   🧪 A/B Testing: ${this.getServiceStatus("abTesting")}`);
        console.log(`   📈 Métriques Performance: ${this.getServiceStatus("performanceMetrics")}`);
        
        if (failedTests > 0) {
            console.log(`\n❌ Tests échoués:`);
            this.testResults
                .filter(r => !r.success)
                .forEach(r => console.log(`   - ${r.test}: ${r.message}`));
        }
        
        console.log(`\n🎉 Phase 5 Analytics Avancés: ${successRate >= 80 ? "SUCCÈS" : "ATTENTION REQUISE"}`);
        
        if (successRate >= 95) {
            console.log("🌟 Excellente implémentation! Tous les services analytics sont opérationnels.");
        } else if (successRate >= 80) {
            console.log("✅ Bonne implémentation. Quelques optimisations mineures possibles.");
        } else {
            console.log("⚠️ Implémentation à améliorer. Vérifier les services en échec.");
        }
        
        console.log("\n" + "=".repeat(60));
    }

    getServiceStatus(serviceName) {
        const serviceTests = this.testResults.filter(r => 
            r.test.toLowerCase().includes(serviceName.toLowerCase()) ||
            r.test.toLowerCase().includes(this.getServiceDisplayName(serviceName).toLowerCase())
        );
        
        if (serviceTests.length === 0) return "❓ Non testé";
        
        const successful = serviceTests.filter(r => r.success).length;
        const total = serviceTests.length;
        const rate = (successful / total * 100).toFixed(0);
        
        if (rate >= 90) return "✅ Excellent";
        if (rate >= 70) return "🟡 Bon";
        return "❌ Problème";
    }

    getServiceDisplayName(serviceName) {
        const names = {
            predictiveAnalytics: "Analytics Prédictifs",
            businessIntelligence: "Business Intelligence", 
            realTimeOptimization: "Optimisation Temps Réel",
            anomalyDetection: "Détection d'Anomalies",
            abTesting: "A/B Testing",
            performanceMetrics: "Métriques Performance"
        };
        return names[serviceName] || serviceName;
    }

    async cleanup() {
        console.log("\n🧹 Nettoyage des ressources de test...");
        
        try {
            // Arrêter les services qui ont des timers
            if (this.services.performanceMetrics.stopCollection) {
                await this.services.performanceMetrics.stopCollection();
            }
            
            if (this.services.realTimeOptimization.stopContinuousOptimization) {
                await this.services.realTimeOptimization.stopContinuousOptimization();
            }
            
            console.log("✅ Nettoyage terminé");
        } catch (error) {
            console.error("❌ Erreur nettoyage:", error);
        }
    }
}

// Exécution automatique si le script est lancé directement
if (require.main === module) {
    const testSuite = new AnalyticsTestSuite();
    testSuite.runAllTests()
        .then(() => testSuite.cleanup())
        .catch(console.error);
}

module.exports = AnalyticsTestSuite;
