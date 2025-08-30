class ABTesting {
    constructor() {
        this.name = "A/B Testing";
        this.version = "1.0.0";
        this.experiments = new Map();
        this.variants = new Map();
        this.results = new Map();
        this.userAssignments = new Map();
        this.statisticalSignificance = 0.95;
    }

    async initialize() {
        console.log("🧪 Initialisation A/B Testing...");
        
        try {
            await this.setupDefaultExperiments();
            await this.loadActiveExperiments();
            
            console.log("✅ A/B Testing initialisé");
            return { success: true, message: "A/B Testing opérationnel" };
        } catch (error) {
            console.error("❌ Erreur initialisation A/B Testing:", error);
            return { success: false, error: error.message };
        }
    }

    async setupDefaultExperiments() {
        // Expériences par défaut
        await this.createExperiment({
            id: "homepage_layout",
            name: "Optimisation Layout Homepage",
            description: "Test de différents layouts pour la page d'accueil",
            variants: [
                { id: "control", name: "Layout Actuel", weight: 50 },
                { id: "modern", name: "Layout Moderne", weight: 50 }
            ],
            metrics: ["bounce_rate", "time_on_page", "conversion_rate"],
            duration: 14, // jours
            minSampleSize: 1000
        });

        await this.createExperiment({
            id: "game_recommendations",
            name: "Algorithme Recommandations",
            description: "Test d'algorithmes de recommandation de jeux",
            variants: [
                { id: "collaborative", name: "Filtrage Collaboratif", weight: 33 },
                { id: "content_based", name: "Basé sur le Contenu", weight: 33 },
                { id: "hybrid", name: "Approche Hybride", weight: 34 }
            ],
            metrics: ["click_through_rate", "game_starts", "user_satisfaction"],
            duration: 21,
            minSampleSize: 500
        });

        await this.createExperiment({
            id: "pricing_strategy",
            name: "Stratégie de Prix",
            description: "Test de différentes stratégies de pricing",
            variants: [
                { id: "current", name: "Prix Actuels", weight: 40 },
                { id: "premium", name: "Prix Premium", weight: 30 },
                { id: "discount", name: "Prix Réduits", weight: 30 }
            ],
            metrics: ["conversion_rate", "revenue_per_user", "retention_rate"],
            duration: 30,
            minSampleSize: 2000
        });

        console.log("🧪 Expériences par défaut configurées");
    }

    async createExperiment(config) {
        try {
            const experiment = {
                id: config.id,
                name: config.name,
                description: config.description,
                status: "draft",
                variants: config.variants,
                metrics: config.metrics,
                duration: config.duration,
                minSampleSize: config.minSampleSize,
                startDate: null,
                endDate: null,
                createdAt: new Date(),
                results: {
                    participants: 0,
                    conversions: {},
                    metrics: {}
                }
            };

            this.experiments.set(config.id, experiment);
            
            // Initialiser les résultats pour chaque variant
            for (const variant of config.variants) {
                this.results.set(`${config.id}_${variant.id}`, {
                    experimentId: config.id,
                    variantId: variant.id,
                    participants: 0,
                    conversions: 0,
                    metrics: {},
                    samples: []
                });
            }

            console.log(`✅ Expérience créée: ${config.name}`);
            return experiment;
        } catch (error) {
            console.error("❌ Erreur création expérience:", error);
            throw error;
        }
    }

    async startExperiment(experimentId) {
        try {
            const experiment = this.experiments.get(experimentId);
            if (!experiment) {
                throw new Error(`Expérience non trouvée: ${experimentId}`);
            }

            experiment.status = "running";
            experiment.startDate = new Date();
            experiment.endDate = new Date(Date.now() + experiment.duration * 24 * 60 * 60 * 1000);

            console.log(`🚀 Expérience démarrée: ${experiment.name}`);
            return { success: true, experiment };
        } catch (error) {
            console.error("❌ Erreur démarrage expérience:", error);
            return { success: false, error: error.message };
        }
    }

    async assignUserToVariant(userId, experimentId) {
        try {
            const experiment = this.experiments.get(experimentId);
            if (!experiment || experiment.status !== "running") {
                return null;
            }

            // Vérifier si l'utilisateur est déjà assigné
            const existingAssignment = this.userAssignments.get(`${userId}_${experimentId}`);
            if (existingAssignment) {
                return existingAssignment;
            }

            // Assigner selon les poids des variants
            const variant = this.selectVariantByWeight(experiment.variants);
            const assignment = {
                userId,
                experimentId,
                variantId: variant.id,
                assignedAt: new Date()
            };

            this.userAssignments.set(`${userId}_${experimentId}`, assignment);
            
            // Incrémenter le compteur de participants
            const resultKey = `${experimentId}_${variant.id}`;
            const result = this.results.get(resultKey);
            if (result) {
                result.participants++;
            }

            return assignment;
        } catch (error) {
            console.error("❌ Erreur assignation variant:", error);
            return null;
        }
    }

    selectVariantByWeight(variants) {
        const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
        const random = Math.random() * totalWeight;
        
        let currentWeight = 0;
        for (const variant of variants) {
            currentWeight += variant.weight;
            if (random <= currentWeight) {
                return variant;
            }
        }
        
        return variants[0]; // Fallback
    }

    async recordConversion(userId, experimentId, metricName, value = 1) {
        try {
            const assignment = this.userAssignments.get(`${userId}_${experimentId}`);
            if (!assignment) {
                return false;
            }

            const resultKey = `${experimentId}_${assignment.variantId}`;
            const result = this.results.get(resultKey);
            
            if (result) {
                result.conversions += value;
                if (!result.metrics[metricName]) {
                    result.metrics[metricName] = { total: 0, count: 0, avg: 0 };
                }
                
                result.metrics[metricName].total += value;
                result.metrics[metricName].count++;
                result.metrics[metricName].avg = result.metrics[metricName].total / result.metrics[metricName].count;
                
                result.samples.push({
                    userId,
                    metric: metricName,
                    value,
                    timestamp: new Date()
                });
            }

            return true;
        } catch (error) {
            console.error("❌ Erreur enregistrement conversion:", error);
            return false;
        }
    }

    async analyzeExperimentResults(experimentId) {
        try {
            const experiment = this.experiments.get(experimentId);
            if (!experiment) {
                throw new Error(`Expérience non trouvée: ${experimentId}`);
            }

            const variantResults = [];
            let totalParticipants = 0;

            // Collecter les résultats de chaque variant
            for (const variant of experiment.variants) {
                const resultKey = `${experimentId}_${variant.id}`;
                const result = this.results.get(resultKey);
                
                if (result) {
                    totalParticipants += result.participants;
                    variantResults.push({
                        variant: variant.id,
                        name: variant.name,
                        participants: result.participants,
                        conversions: result.conversions,
                        conversionRate: result.participants > 0 ? result.conversions / result.participants : 0,
                        metrics: result.metrics
                    });
                }
            }

            // Analyser la significativité statistique
            const statisticalAnalysis = this.calculateStatisticalSignificance(variantResults);
            
            // Déterminer le variant gagnant
            const winner = this.determineWinner(variantResults, statisticalAnalysis);

            return {
                experimentId,
                experiment: experiment.name,
                status: experiment.status,
                totalParticipants,
                variants: variantResults,
                statistical: statisticalAnalysis,
                winner,
                confidence: statisticalAnalysis.confidence,
                recommendation: this.generateRecommendation(winner, statisticalAnalysis),
                analyzedAt: new Date()
            };
        } catch (error) {
            console.error("❌ Erreur analyse résultats:", error);
            return this.getFallbackAnalysis(experimentId);
        }
    }

    calculateStatisticalSignificance(variants) {
        if (variants.length < 2) {
            return { significant: false, confidence: 0, pValue: 1 };
        }

        // Simulation du calcul de significativité (Chi-carré simplifié)
        const control = variants[0];
        const treatment = variants[1];
        
        if (control.participants < 100 || treatment.participants < 100) {
            return { significant: false, confidence: 0, pValue: 1, reason: "Échantillon insuffisant" };
        }

        // Calcul simulé du p-value
        const conversionDiff = Math.abs(treatment.conversionRate - control.conversionRate);
        const pooledRate = (control.conversions + treatment.conversions) / (control.participants + treatment.participants);
        const standardError = Math.sqrt(pooledRate * (1 - pooledRate) * (1/control.participants + 1/treatment.participants));
        
        const zScore = conversionDiff / standardError;
        const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore))); // Approximation

        return {
            significant: pValue < 0.05,
            confidence: 1 - pValue,
            pValue,
            zScore,
            effect: conversionDiff,
            minDetectableEffect: standardError * 1.96
        };
    }

    normalCDF(x) {
        // Approximation de la fonction de répartition normale
        return 0.5 * (1 + Math.sign(x) * Math.sqrt(1 - Math.exp(-2 * x * x / Math.PI)));
    }

    determineWinner(variants, statistical) {
        if (!statistical.significant) {
            return { 
                hasWinner: false, 
                reason: "Pas de différence statistiquement significative" 
            };
        }

        // Trouver le variant avec le meilleur taux de conversion
        const bestVariant = variants.reduce((best, current) => 
            current.conversionRate > best.conversionRate ? current : best
        );

        return {
            hasWinner: true,
            variant: bestVariant.variant,
            name: bestVariant.name,
            conversionRate: bestVariant.conversionRate,
            improvement: this.calculateImprovement(variants, bestVariant),
            confidence: statistical.confidence
        };
    }

    calculateImprovement(variants, winner) {
        const control = variants.find(v => v.variant === "control") || variants[0];
        const improvement = ((winner.conversionRate - control.conversionRate) / control.conversionRate) * 100;
        return Math.round(improvement * 100) / 100;
    }

    generateRecommendation(winner, statistical) {
        if (!winner.hasWinner) {
            return {
                action: "continue",
                reason: "Continuer l'expérience pour obtenir plus de données",
                nextCheck: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            };
        }

        if (statistical.confidence > 0.95) {
            return {
                action: "implement",
                reason: `Implémenter le variant ${winner.name} (amélioration: ${winner.improvement}%)`,
                priority: "high"
            };
        }

        return {
            action: "monitor",
            reason: "Continuer le monitoring, résultats prometteurs mais pas encore définitifs",
            nextCheck: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        };
    }

    async getActiveExperiments() {
        const active = [];
        for (const [id, experiment] of this.experiments) {
            if (experiment.status === "running") {
                const analysis = await this.analyzeExperimentResults(id);
                active.push({
                    ...experiment,
                    analysis: analysis,
                    progress: this.calculateProgress(experiment)
                });
            }
        }
        return active;
    }

    calculateProgress(experiment) {
        if (!experiment.startDate || !experiment.endDate) {
            return 0;
        }

        const now = Date.now();
        const start = experiment.startDate.getTime();
        const end = experiment.endDate.getTime();
        
        const progress = (now - start) / (end - start);
        return Math.max(0, Math.min(1, progress));
    }

    async stopExperiment(experimentId, reason = "manual") {
        try {
            const experiment = this.experiments.get(experimentId);
            if (!experiment) {
                throw new Error(`Expérience non trouvée: ${experimentId}`);
            }

            experiment.status = "completed";
            experiment.endDate = new Date();
            experiment.stopReason = reason;

            const finalAnalysis = await this.analyzeExperimentResults(experimentId);
            
            console.log(`⏹️ Expérience arrêtée: ${experiment.name}`);
            return { success: true, finalAnalysis };
        } catch (error) {
            console.error("❌ Erreur arrêt expérience:", error);
            return { success: false, error: error.message };
        }
    }

    async getExperimentReport(experimentId) {
        try {
            const experiment = this.experiments.get(experimentId);
            if (!experiment) {
                throw new Error(`Expérience non trouvée: ${experimentId}`);
            }

            const analysis = await this.analyzeExperimentResults(experimentId);
            const timeline = await this.getExperimentTimeline(experimentId);
            
            return {
                experiment,
                analysis,
                timeline,
                recommendations: this.generateExperimentRecommendations(analysis),
                generatedAt: new Date()
            };
        } catch (error) {
            console.error("❌ Erreur rapport expérience:", error);
            return this.getFallbackReport(experimentId);
        }
    }

    async getExperimentTimeline(experimentId) {
        const timeline = [];
        const experiment = this.experiments.get(experimentId);
        
        if (experiment) {
            timeline.push({
                event: "created",
                timestamp: experiment.createdAt,
                description: "Expérience créée"
            });

            if (experiment.startDate) {
                timeline.push({
                    event: "started",
                    timestamp: experiment.startDate,
                    description: "Expérience démarrée"
                });
            }

            if (experiment.endDate && experiment.status === "completed") {
                timeline.push({
                    event: "completed",
                    timestamp: experiment.endDate,
                    description: `Expérience terminée (${experiment.stopReason})`
                });
            }
        }

        return timeline;
    }

    generateExperimentRecommendations(analysis) {
        const recommendations = [];

        if (analysis.winner.hasWinner) {
            recommendations.push({
                type: "implementation",
                priority: "high",
                action: `Implémenter le variant ${analysis.winner.name}`,
                expectedImpact: `+${analysis.winner.improvement}% amélioration`
            });
        } else if (analysis.totalParticipants < 500) {
            recommendations.push({
                type: "duration",
                priority: "medium",
                action: "Prolonger l'expérience",
                reason: "Échantillon insuffisant pour conclusions fiables"
            });
        } else {
            recommendations.push({
                type: "redesign",
                priority: "low",
                action: "Revoir les variants testés",
                reason: "Aucune différence significative détectée"
            });
        }

        return recommendations;
    }

    async optimizeExperiments() {
        console.log("🔧 Optimisation des expériences...");
        
        try {
            const optimizations = [];
            
            for (const [id, experiment] of this.experiments) {
                if (experiment.status === "running") {
                    const analysis = await this.analyzeExperimentResults(id);
                    
                    // Optimisation automatique des poids
                    if (analysis.statistical.significant) {
                        const optimization = await this.optimizeVariantWeights(id, analysis);
                        optimizations.push(optimization);
                    }
                    
                    // Arrêt automatique si significativité atteinte
                    if (analysis.confidence > 0.99 && analysis.totalParticipants > experiment.minSampleSize) {
                        await this.stopExperiment(id, "statistical_significance");
                        optimizations.push({
                            experimentId: id,
                            action: "stopped",
                            reason: "Significativité statistique atteinte"
                        });
                    }
                }
            }

            return { optimizations, timestamp: new Date() };
        } catch (error) {
            console.error("❌ Erreur optimisation expériences:", error);
            return { optimizations: [], error: error.message };
        }
    }

    async optimizeVariantWeights(experimentId, analysis) {
        const experiment = this.experiments.get(experimentId);
        const winner = analysis.winner;
        
        if (winner.hasWinner && analysis.confidence > 0.8) {
            // Augmenter le poids du variant gagnant
            for (const variant of experiment.variants) {
                if (variant.id === winner.variant) {
                    variant.weight = Math.min(80, variant.weight + 10);
                } else {
                    variant.weight = Math.max(10, variant.weight - 5);
                }
            }
            
            // Normaliser les poids
            const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0);
            experiment.variants.forEach(v => v.weight = (v.weight / totalWeight) * 100);
            
            return {
                experimentId,
                action: "weights_optimized",
                winnerWeight: experiment.variants.find(v => v.id === winner.variant).weight
            };
        }
        
        return { experimentId, action: "no_optimization", reason: "Pas de gagnant clair" };
    }

    async loadActiveExperiments() {
        // Simulation du chargement des expériences actives
        console.log("📂 Chargement des expériences actives...");
        
        // Démarrer quelques expériences par défaut
        await this.startExperiment("homepage_layout");
        await this.startExperiment("game_recommendations");
    }

    // Méthodes de simulation pour les tests
    async simulateUserInteraction(userId, experimentId, action) {
        const assignment = await this.assignUserToVariant(userId, experimentId);
        if (!assignment) return false;

        // Simuler différents types d'actions
        switch (action) {
            case "page_view":
                return await this.recordConversion(userId, experimentId, "page_views", 1);
            case "click":
                return await this.recordConversion(userId, experimentId, "clicks", 1);
            case "conversion":
                return await this.recordConversion(userId, experimentId, "conversions", 1);
            case "purchase":
                return await this.recordConversion(userId, experimentId, "revenue", Math.random() * 50 + 10);
            default:
                return false;
        }
    }

    getFallbackAnalysis(experimentId) {
        return {
            experimentId,
            experiment: "Expérience inconnue",
            totalParticipants: 0,
            variants: [],
            statistical: { significant: false, confidence: 0 },
            winner: { hasWinner: false },
            fallback: true
        };
    }

    getFallbackReport(experimentId) {
        return {
            experiment: { name: "Expérience inconnue", status: "unknown" },
            analysis: this.getFallbackAnalysis(experimentId),
            timeline: [],
            recommendations: [{ type: "general", action: "Vérifier la configuration" }],
            fallback: true
        };
    }
}

module.exports = ABTesting;
