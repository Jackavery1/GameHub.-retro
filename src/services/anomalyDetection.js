class AnomalyDetection {
    constructor() {
        this.name = "Anomaly Detection";
        this.version = "1.0.0";
        this.detectors = new Map();
        this.anomalies = [];
        this.thresholds = new Map();
        this.patterns = new Map();
        this.alertSubscribers = [];
    }

    async initialize() {
        console.log("🔍 Initialisation Anomaly Detection...");
        
        try {
            await this.setupDetectors();
            await this.setupThresholds();
            await this.setupPatterns();
            
            console.log("✅ Anomaly Detection initialisé");
            return { success: true, message: "Détection d'anomalies opérationnelle" };
        } catch (error) {
            console.error("❌ Erreur initialisation Anomaly Detection:", error);
            return { success: false, error: error.message };
        }
    }

    async setupDetectors() {
        // Détecteurs d'anomalies
        this.detectors.set("traffic_anomaly", {
            name: "Anomalies de Trafic",
            type: "statistical",
            sensitivity: 0.95,
            window: "5m",
            metrics: ["requests_per_second", "concurrent_users", "bandwidth_usage"]
        });

        this.detectors.set("performance_anomaly", {
            name: "Anomalies de Performance",
            type: "threshold",
            sensitivity: 0.90,
            window: "1m",
            metrics: ["response_time", "error_rate", "resource_usage"]
        });

        this.detectors.set("user_behavior_anomaly", {
            name: "Anomalies Comportement Utilisateur",
            type: "pattern",
            sensitivity: 0.85,
            window: "15m",
            metrics: ["session_duration", "click_patterns", "navigation_flow"]
        });

        this.detectors.set("security_anomaly", {
            name: "Anomalies de Sécurité",
            type: "rule_based",
            sensitivity: 0.99,
            window: "real_time",
            metrics: ["failed_logins", "unusual_requests", "suspicious_patterns"]
        });

        this.detectors.set("business_anomaly", {
            name: "Anomalies Business",
            type: "trend",
            sensitivity: 0.88,
            window: "1h",
            metrics: ["revenue_deviation", "conversion_drops", "churn_spikes"]
        });

        console.log("🎯 Détecteurs d'anomalies configurés");
    }

    async setupThresholds() {
        // Seuils dynamiques d'anomalies
        this.thresholds.set("traffic", {
            requests_per_second: { min: 10, max: 1000, deviation: 3 },
            concurrent_users: { min: 5, max: 500, deviation: 2.5 },
            bandwidth_usage: { min: 100000, max: 10000000, deviation: 2 }
        });

        this.thresholds.set("performance", {
            response_time: { max: 2000, critical: 5000 },
            error_rate: { max: 0.05, critical: 0.1 },
            cpu_usage: { max: 0.8, critical: 0.95 },
            memory_usage: { max: 0.85, critical: 0.95 }
        });

        this.thresholds.set("security", {
            failed_logins: { max: 5, window: "5m" },
            request_rate: { max: 100, window: "1m" },
            unusual_patterns: { threshold: 0.8 }
        });

        console.log("⚖️ Seuils d'anomalies configurés");
    }

    async setupPatterns() {
        // Patterns normaux pour détection d'anomalies
        this.patterns.set("normal_traffic", {
            hourly: Array.from({length: 24}, (_, i) => 50 + Math.sin(i / 24 * 2 * Math.PI) * 30),
            daily: Array.from({length: 7}, () => Math.random() * 50 + 75),
            seasonal: { summer: 1.2, winter: 0.8, holidays: 1.5 }
        });

        this.patterns.set("normal_behavior", {
            session_duration: { mean: 420, std: 180 },
            pages_per_session: { mean: 3.2, std: 1.5 },
            bounce_rate: { mean: 0.25, std: 0.1 }
        });

        console.log("📊 Patterns de normalité établis");
    }

    async detectAnomalies(metrics) {
        try {
            const detectedAnomalies = [];
            
            // Analyser avec chaque détecteur
            for (const [detectorName, detector] of this.detectors) {
                const anomaly = await this.runDetector(detectorName, detector, metrics);
                if (anomaly.detected) {
                    detectedAnomalies.push(anomaly);
                }
            }

            // Filtrer et prioriser les anomalies
            const prioritizedAnomalies = this.prioritizeAnomalies(detectedAnomalies);
            
            // Stocker les anomalies détectées
            this.anomalies.push(...prioritizedAnomalies);
            
            // Déclencher les alertes si nécessaire
            if (prioritizedAnomalies.length > 0) {
                await this.triggerAlerts(prioritizedAnomalies);
            }

            return {
                timestamp: new Date(),
                anomalies: prioritizedAnomalies,
                total: prioritizedAnomalies.length,
                severity: this.calculateOverallSeverity(prioritizedAnomalies)
            };
        } catch (error) {
            console.error("❌ Erreur détection anomalies:", error);
            return { anomalies: [], error: error.message };
        }
    }

    async runDetector(name, detector, metrics) {
        const result = {
            detector: name,
            detected: false,
            severity: "low",
            confidence: 0,
            description: "",
            metrics: {},
            timestamp: new Date()
        };

        try {
            switch (detector.type) {
                case "statistical":
                    return await this.runStatisticalDetector(name, detector, metrics, result);
                case "threshold":
                    return await this.runThresholdDetector(name, detector, metrics, result);
                case "pattern":
                    return await this.runPatternDetector(name, detector, metrics, result);
                case "rule_based":
                    return await this.runRuleBasedDetector(name, detector, metrics, result);
                case "trend":
                    return await this.runTrendDetector(name, detector, metrics, result);
                default:
                    return result;
            }
        } catch (error) {
            console.error(`❌ Erreur détecteur ${name}:`, error);
            return result;
        }
    }

    async runStatisticalDetector(name, detector, metrics, result) {
        // Détection statistique (z-score)
        if (name === "traffic_anomaly") {
            const currentUsers = metrics.concurrentUsers || 0;
            const normalPattern = this.patterns.get("normal_traffic");
            const expectedUsers = normalPattern.hourly[new Date().getHours()];
            
            const zScore = Math.abs(currentUsers - expectedUsers) / (expectedUsers * 0.3);
            
            if (zScore > 2.5) {
                result.detected = true;
                result.severity = zScore > 4 ? "critical" : zScore > 3 ? "high" : "medium";
                result.confidence = Math.min(zScore / 4, 1);
                result.description = `Trafic inhabituel: ${currentUsers} utilisateurs (attendu: ~${expectedUsers})`;
                result.metrics = { currentUsers, expectedUsers, zScore };
            }
        }
        
        return result;
    }

    async runThresholdDetector(name, detector, metrics, result) {
        // Détection par seuils
        if (name === "performance_anomaly") {
            const thresholds = this.thresholds.get("performance");
            
            if (metrics.responseTime > thresholds.response_time.critical) {
                result.detected = true;
                result.severity = "critical";
                result.confidence = 0.95;
                result.description = `Temps de réponse critique: ${metrics.responseTime}ms`;
            } else if (metrics.responseTime > thresholds.response_time.max) {
                result.detected = true;
                result.severity = "high";
                result.confidence = 0.85;
                result.description = `Temps de réponse élevé: ${metrics.responseTime}ms`;
            }
            
            if (metrics.errorRate > thresholds.error_rate.critical) {
                result.detected = true;
                result.severity = "critical";
                result.confidence = 0.98;
                result.description = `Taux d'erreur critique: ${(metrics.errorRate * 100).toFixed(2)}%`;
            }
        }
        
        return result;
    }

    async runPatternDetector(name, detector, metrics, result) {
        // Détection par patterns
        if (name === "user_behavior_anomaly") {
            const normalBehavior = this.patterns.get("normal_behavior");
            const sessionDuration = metrics.sessionDuration || 300;
            
            const deviationScore = Math.abs(sessionDuration - normalBehavior.session_duration.mean) / 
                                 normalBehavior.session_duration.std;
            
            if (deviationScore > 3) {
                result.detected = true;
                result.severity = "medium";
                result.confidence = Math.min(deviationScore / 5, 1);
                result.description = `Comportement utilisateur inhabituel: session ${sessionDuration}s`;
                result.metrics = { sessionDuration, deviation: deviationScore };
            }
        }
        
        return result;
    }

    async runRuleBasedDetector(name, detector, metrics, result) {
        // Détection basée sur des règles
        if (name === "security_anomaly") {
            const securityThresholds = this.thresholds.get("security");
            
            if (metrics.failedLogins > securityThresholds.failed_logins.max) {
                result.detected = true;
                result.severity = "high";
                result.confidence = 0.92;
                result.description = `Tentatives de connexion suspectes: ${metrics.failedLogins} échecs`;
            }
            
            if (metrics.requestRate > securityThresholds.request_rate.max) {
                result.detected = true;
                result.severity = "medium";
                result.confidence = 0.88;
                result.description = `Taux de requêtes suspect: ${metrics.requestRate}/min`;
            }
        }
        
        return result;
    }

    async runTrendDetector(name, detector, metrics, result) {
        // Détection de tendances
        if (name === "business_anomaly") {
            const revenueDeviation = metrics.revenueDeviation || 0;
            
            if (Math.abs(revenueDeviation) > 0.3) {
                result.detected = true;
                result.severity = revenueDeviation < -0.5 ? "critical" : "medium";
                result.confidence = Math.min(Math.abs(revenueDeviation), 1);
                result.description = `Déviation revenus: ${(revenueDeviation * 100).toFixed(1)}%`;
                result.metrics = { revenueDeviation };
            }
        }
        
        return result;
    }

    prioritizeAnomalies(anomalies) {
        return anomalies
            .filter(a => a.detected)
            .sort((a, b) => {
                const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
            });
    }

    calculateOverallSeverity(anomalies) {
        if (anomalies.some(a => a.severity === "critical")) return "critical";
        if (anomalies.some(a => a.severity === "high")) return "high";
        if (anomalies.some(a => a.severity === "medium")) return "medium";
        return "low";
    }

    async triggerAlerts(anomalies) {
        for (const anomaly of anomalies) {
            if (anomaly.severity === "critical" || anomaly.severity === "high") {
                await this.sendAlert(anomaly);
            }
        }
    }

    async sendAlert(anomaly) {
        const alert = {
            type: "anomaly",
            severity: anomaly.severity,
            title: `Anomalie détectée: ${anomaly.detector}`,
            message: anomaly.description,
            timestamp: anomaly.timestamp,
            metrics: anomaly.metrics,
            confidence: anomaly.confidence
        };

        console.log(`🚨 ALERTE ${anomaly.severity.toUpperCase()}: ${alert.message}`);
        
        // Notifier les abonnés
        for (const subscriber of this.alertSubscribers) {
            try {
                await subscriber.notify(alert);
            } catch (error) {
                console.error("❌ Erreur notification abonné:", error);
            }
        }

        return alert;
    }

    async getAnomalyHistory(timeframe = "24h") {
        try {
            const now = new Date();
            const timeframeMs = this.parseTimeframe(timeframe);
            const cutoff = new Date(now - timeframeMs);
            
            const recentAnomalies = this.anomalies.filter(a => a.timestamp > cutoff);
            
            return {
                timeframe,
                total: recentAnomalies.length,
                byDetector: this.groupAnomaliesByDetector(recentAnomalies),
                bySeverity: this.groupAnomaliesBySeverity(recentAnomalies),
                timeline: this.createAnomalyTimeline(recentAnomalies),
                trends: this.analyzeAnomalyTrends(recentAnomalies)
            };
        } catch (error) {
            console.error("❌ Erreur historique anomalies:", error);
            return this.getFallbackHistory();
        }
    }

    parseTimeframe(timeframe) {
        const units = { h: 3600000, m: 60000, d: 86400000 };
        const match = timeframe.match(/(\d+)([hmd])/);
        if (match) {
            return parseInt(match[1]) * (units[match[2]] || 3600000);
        }
        return 86400000; // 24h par défaut
    }

    groupAnomaliesByDetector(anomalies) {
        const grouped = {};
        for (const anomaly of anomalies) {
            if (!grouped[anomaly.detector]) {
                grouped[anomaly.detector] = [];
            }
            grouped[anomaly.detector].push(anomaly);
        }
        return grouped;
    }

    groupAnomaliesBySeverity(anomalies) {
        const grouped = { critical: 0, high: 0, medium: 0, low: 0 };
        for (const anomaly of anomalies) {
            grouped[anomaly.severity] = (grouped[anomaly.severity] || 0) + 1;
        }
        return grouped;
    }

    createAnomalyTimeline(anomalies) {
        return anomalies
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 20)
            .map(a => ({
                time: a.timestamp,
                detector: a.detector,
                severity: a.severity,
                description: a.description
            }));
    }

    analyzeAnomalyTrends(anomalies) {
        const hourlyCount = {};
        for (const anomaly of anomalies) {
            const hour = anomaly.timestamp.getHours();
            hourlyCount[hour] = (hourlyCount[hour] || 0) + 1;
        }

        return {
            peakHours: Object.entries(hourlyCount)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([hour, count]) => ({ hour: parseInt(hour), count })),
            frequency: anomalies.length / 24, // par heure
            trend: this.calculateTrend(anomalies)
        };
    }

    calculateTrend(anomalies) {
        if (anomalies.length < 2) return "insufficient_data";
        
        const recent = anomalies.filter(a => a.timestamp > new Date(Date.now() - 6 * 3600000));
        const older = anomalies.filter(a => a.timestamp <= new Date(Date.now() - 6 * 3600000));
        
        if (recent.length > older.length * 1.5) return "increasing";
        if (recent.length < older.length * 0.5) return "decreasing";
        return "stable";
    }

    async generateAnomalyReport() {
        try {
            const report = {
                period: "last_24h",
                summary: await this.getAnomalyHistory("24h"),
                criticalAnomalies: this.anomalies.filter(a => a.severity === "critical"),
                recommendations: await this.generateRecommendations(),
                preventiveMeasures: await this.suggestPreventiveMeasures(),
                generatedAt: new Date()
            };

            return report;
        } catch (error) {
            console.error("❌ Erreur rapport anomalies:", error);
            return this.getFallbackReport();
        }
    }

    async generateRecommendations() {
        const recentAnomalies = this.anomalies.slice(-10);
        const recommendations = [];

        // Analyser les patterns d'anomalies récentes
        const detectorCounts = {};
        for (const anomaly of recentAnomalies) {
            detectorCounts[anomaly.detector] = (detectorCounts[anomaly.detector] || 0) + 1;
        }

        // Générer des recommandations basées sur les patterns
        if (detectorCounts.performance_anomaly > 3) {
            recommendations.push({
                type: "infrastructure",
                priority: "high",
                action: "Augmenter les ressources serveur",
                reason: "Anomalies de performance récurrentes"
            });
        }

        if (detectorCounts.security_anomaly > 2) {
            recommendations.push({
                type: "security",
                priority: "critical",
                action: "Renforcer les mesures de sécurité",
                reason: "Activité suspecte détectée"
            });
        }

        if (detectorCounts.traffic_anomaly > 4) {
            recommendations.push({
                type: "scaling",
                priority: "medium",
                action: "Implémenter auto-scaling",
                reason: "Variations de trafic importantes"
            });
        }

        return recommendations;
    }

    async suggestPreventiveMeasures() {
        return [
            {
                measure: "Monitoring proactif",
                description: "Surveillance continue des métriques clés",
                implementation: "Augmenter la fréquence de collecte des métriques"
            },
            {
                measure: "Seuils adaptatifs",
                description: "Ajustement automatique des seuils d'alerte",
                implementation: "Machine learning pour optimiser les seuils"
            },
            {
                measure: "Réponse automatique",
                description: "Actions automatiques pour anomalies courantes",
                implementation: "Scripts d'auto-remediation"
            }
        ];
    }

    subscribeToAlerts(subscriber) {
        this.alertSubscribers.push(subscriber);
        console.log("📧 Nouvel abonné aux alertes d'anomalies");
    }

    async simulateRealTimeDetection() {
        // Simulation pour les tests
        const simulatedMetrics = {
            concurrentUsers: Math.floor(Math.random() * 400) + 50,
            responseTime: Math.random() * 1000 + 100,
            errorRate: Math.random() * 0.1,
            cpuUsage: Math.random() * 0.9 + 0.1,
            sessionDuration: Math.random() * 600 + 180,
            failedLogins: Math.floor(Math.random() * 10),
            requestRate: Math.floor(Math.random() * 150) + 20,
            revenueDeviation: (Math.random() - 0.5) * 0.8
        };

        return await this.detectAnomalies(simulatedMetrics);
    }

    getFallbackHistory() {
        return {
            timeframe: "24h",
            total: 0,
            byDetector: {},
            bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
            timeline: [],
            trends: { frequency: 0, trend: "stable" },
            fallback: true
        };
    }

    getFallbackReport() {
        return {
            period: "last_24h",
            summary: this.getFallbackHistory(),
            criticalAnomalies: [],
            recommendations: [{ type: "general", action: "Monitoring de base", priority: "low" }],
            preventiveMeasures: [{ measure: "Surveillance basique", description: "Monitoring standard" }],
            fallback: true
        };
    }
}

module.exports = AnomalyDetection;
