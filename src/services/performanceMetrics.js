class PerformanceMetrics {
  constructor() {
    this.name = "Performance Metrics";
    this.version = "1.0.0";
    this.metrics = new Map();
    this.collectors = new Map();
    this.aggregations = new Map();
    this.alerts = [];
    this.collectInterval = null;
  }

  async initialize() {
    console.log("📊 Initialisation Performance Metrics...");

    try {
      await this.setupMetricCollectors();
      await this.setupAggregations();
      await this.startCollection();

      console.log("✅ Performance Metrics initialisé");
      return {
        success: true,
        message: "Métriques de performance opérationnelles",
      };
    } catch (error) {
      console.error("❌ Erreur initialisation Performance Metrics:", error);
      return { success: false, error: error.message };
    }
  }

  async setupMetricCollectors() {
    // Collecteurs de métriques
    this.collectors.set("server_performance", {
      name: "Performance Serveur",
      interval: 30000, // 30 secondes
      metrics: ["cpu_usage", "memory_usage", "disk_usage", "network_io"],
      enabled: true,
    });

    this.collectors.set("application_performance", {
      name: "Performance Application",
      interval: 60000, // 1 minute
      metrics: [
        "response_time",
        "throughput",
        "error_rate",
        "active_connections",
      ],
      enabled: true,
    });

    this.collectors.set("user_experience", {
      name: "Expérience Utilisateur",
      interval: 120000, // 2 minutes
      metrics: [
        "page_load_time",
        "time_to_interactive",
        "bounce_rate",
        "session_duration",
      ],
      enabled: true,
    });

    this.collectors.set("business_metrics", {
      name: "Métriques Business",
      interval: 300000, // 5 minutes
      metrics: [
        "active_users",
        "revenue_rate",
        "conversion_rate",
        "retention_rate",
      ],
      enabled: true,
    });

    this.collectors.set("security_metrics", {
      name: "Métriques Sécurité",
      interval: 30000, // 30 secondes
      metrics: [
        "failed_logins",
        "suspicious_requests",
        "blocked_ips",
        "security_events",
      ],
      enabled: true,
    });

    console.log("📈 Collecteurs de métriques configurés");
  }

  async setupAggregations() {
    // Agrégations temporelles
    this.aggregations.set("real_time", {
      window: "1m",
      retention: "1h",
      functions: ["avg", "max", "min", "count"],
    });

    this.aggregations.set("short_term", {
      window: "5m",
      retention: "24h",
      functions: ["avg", "max", "min", "count", "p95", "p99"],
    });

    this.aggregations.set("medium_term", {
      window: "1h",
      retention: "7d",
      functions: ["avg", "max", "min", "count", "p95", "p99", "trend"],
    });

    this.aggregations.set("long_term", {
      window: "1d",
      retention: "90d",
      functions: ["avg", "max", "min", "count", "trend", "seasonality"],
    });

    console.log("📊 Agrégations configurées");
  }

  async startCollection() {
    console.log("🔄 Démarrage collecte de métriques...");

    // Démarrer la collecte pour chaque collecteur
    for (const [collectorName, collector] of this.collectors) {
      if (collector.enabled) {
        this.startCollector(collectorName, collector);
      }
    }

    // Démarrer l'agrégation périodique
    this.startAggregation();
  }

  startCollector(name, collector) {
    const intervalId = setInterval(async () => {
      try {
        const data = await this.collectMetrics(name, collector.metrics);
        await this.storeMetrics(name, data);
      } catch (error) {
        console.error(`❌ Erreur collecte ${name}:`, error);
      }
    }, collector.interval);

    collector.intervalId = intervalId;
    console.log(`📊 Collecteur ${name} démarré (${collector.interval}ms)`);
  }

  async collectMetrics(collectorName, metricNames) {
    const timestamp = new Date();
    const data = { timestamp, collector: collectorName, metrics: {} };

    // Collecter selon le type de collecteur
    switch (collectorName) {
      case "server_performance":
        data.metrics = await this.collectServerMetrics();
        break;
      case "application_performance":
        data.metrics = await this.collectApplicationMetrics();
        break;
      case "user_experience":
        data.metrics = await this.collectUserExperienceMetrics();
        break;
      case "business_metrics":
        data.metrics = await this.collectBusinessMetrics();
        break;
      case "security_metrics":
        data.metrics = await this.collectSecurityMetrics();
        break;
    }

    return data;
  }

  async collectServerMetrics() {
    // Simulation des métriques serveur
    return {
      cpu_usage: Math.random() * 80 + 10,
      memory_usage: Math.random() * 70 + 20,
      disk_usage: Math.random() * 60 + 15,
      network_io: Math.random() * 1000000 + 100000,
    };
  }

  async collectApplicationMetrics() {
    // Simulation des métriques application
    return {
      response_time: Math.random() * 500 + 50,
      throughput: Math.random() * 1000 + 200,
      error_rate: Math.random() * 0.05,
      active_connections: Math.floor(Math.random() * 200) + 50,
    };
  }

  async collectUserExperienceMetrics() {
    // Simulation des métriques UX
    return {
      page_load_time: Math.random() * 3000 + 500,
      time_to_interactive: Math.random() * 2000 + 800,
      bounce_rate: Math.random() * 0.4 + 0.1,
      session_duration: Math.random() * 600 + 180,
    };
  }

  async collectBusinessMetrics() {
    // Simulation des métriques business
    return {
      active_users: Math.floor(Math.random() * 300) + 100,
      revenue_rate: Math.random() * 100 + 20,
      conversion_rate: Math.random() * 0.1 + 0.02,
      retention_rate: Math.random() * 0.3 + 0.6,
    };
  }

  async collectSecurityMetrics() {
    // Simulation des métriques sécurité
    return {
      failed_logins: Math.floor(Math.random() * 10),
      suspicious_requests: Math.floor(Math.random() * 5),
      blocked_ips: Math.floor(Math.random() * 3),
      security_events: Math.floor(Math.random() * 2),
    };
  }

  async storeMetrics(collectorName, data) {
    const key = `${collectorName}_${Date.now()}`;
    this.metrics.set(key, data);

    // Nettoyer les anciennes métriques (garder seulement 1h de données détaillées)
    const cutoff = Date.now() - 3600000;
    for (const [metricKey, metricData] of this.metrics) {
      if (metricData.timestamp.getTime() < cutoff) {
        this.metrics.delete(metricKey);
      }
    }
  }

  startAggregation() {
    // Agrégation toutes les minutes
    this.aggregationInterval = setInterval(async () => {
      try {
        await this.performAggregations();
      } catch (error) {
        console.error("❌ Erreur agrégation:", error);
      }
    }, 60000);

    console.log("📊 Agrégation démarrée");
  }

  async performAggregations() {
    const now = new Date();

    // Agrégation temps réel (1 minute)
    await this.aggregateWindow("real_time", 60000);

    // Agrégation court terme (5 minutes) - toutes les 5 minutes
    if (now.getMinutes() % 5 === 0) {
      await this.aggregateWindow("short_term", 300000);
    }

    // Agrégation moyen terme (1 heure) - toutes les heures
    if (now.getMinutes() === 0) {
      await this.aggregateWindow("medium_term", 3600000);
    }

    // Agrégation long terme (1 jour) - tous les jours à minuit
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      await this.aggregateWindow("long_term", 86400000);
    }
  }

  async aggregateWindow(aggregationType, windowMs) {
    const cutoff = Date.now() - windowMs;
    const windowMetrics = [];

    // Collecter les métriques dans la fenêtre
    for (const [key, data] of this.metrics) {
      if (data.timestamp.getTime() >= cutoff) {
        windowMetrics.push(data);
      }
    }

    if (windowMetrics.length === 0) return;

    // Grouper par collecteur
    const byCollector = {};
    for (const metric of windowMetrics) {
      if (!byCollector[metric.collector]) {
        byCollector[metric.collector] = [];
      }
      byCollector[metric.collector].push(metric);
    }

    // Calculer les agrégations
    const aggregation = this.aggregations.get(aggregationType);
    const aggregatedData = {};

    for (const [collectorName, metrics] of Object.entries(byCollector)) {
      aggregatedData[collectorName] = this.calculateAggregations(
        metrics,
        aggregation.functions
      );
    }

    // Stocker l'agrégation
    const aggregationKey = `${aggregationType}_${Date.now()}`;
    this.metrics.set(aggregationKey, {
      type: "aggregation",
      aggregationType,
      window: windowMs,
      timestamp: new Date(),
      data: aggregatedData,
    });
  }

  calculateAggregations(metrics, functions) {
    const result = {};

    // Extraire toutes les métriques numériques
    const numericMetrics = {};
    for (const metric of metrics) {
      if (metric.metrics && typeof metric.metrics === "object") {
        for (const [key, value] of Object.entries(metric.metrics)) {
          if (typeof value === "number") {
            if (!numericMetrics[key]) numericMetrics[key] = [];
            numericMetrics[key].push(value);
          }
        }
      }
    }

    // Calculer les fonctions d'agrégation
    for (const [metricName, values] of Object.entries(numericMetrics)) {
      result[metricName] = {};

      for (const func of functions) {
        switch (func) {
          case "avg":
            result[metricName].avg =
              values.reduce((a, b) => a + b, 0) / values.length;
            break;
          case "max":
            result[metricName].max = Math.max(...values);
            break;
          case "min":
            result[metricName].min = Math.min(...values);
            break;
          case "count":
            result[metricName].count = values.length;
            break;
          case "p95":
            result[metricName].p95 = this.calculatePercentile(values, 0.95);
            break;
          case "p99":
            result[metricName].p99 = this.calculatePercentile(values, 0.99);
            break;
          case "trend":
            result[metricName].trend = this.calculateTrend(values);
            break;
        }
      }
    }

    return result;
  }

  calculatePercentile(values, percentile) {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * percentile) - 1;
    return sorted[index] || 0;
  }

  calculateTrend(values) {
    if (values.length < 2) return "stable";

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const change = (secondAvg - firstAvg) / firstAvg;

    if (change > 0.1) return "increasing";
    if (change < -0.1) return "decreasing";
    return "stable";
  }

  async getCurrentMetrics() {
    try {
      const latest = {};

      // Récupérer les dernières métriques de chaque collecteur
      for (const [collectorName, collector] of this.collectors) {
        const recentMetrics = Array.from(this.metrics.values())
          .filter(
            (m) => m.collector === collectorName && m.type !== "aggregation"
          )
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 1);

        if (recentMetrics.length > 0) {
          latest[collectorName] = recentMetrics[0].metrics;
        }
      }

      return {
        timestamp: new Date(),
        collectors: latest,
        summary: this.generateMetricsSummary(latest),
      };
    } catch (error) {
      console.error("❌ Erreur récupération métriques:", error);
      return this.getFallbackCurrentMetrics();
    }
  }

  generateMetricsSummary(metrics) {
    const summary = {
      health: "good",
      alerts: [],
      performance: "optimal",
      efficiency: "good",
    };

    // Analyser la santé globale
    if (metrics.server_performance) {
      const server = metrics.server_performance;
      if (server.cpu_usage > 80 || server.memory_usage > 85) {
        summary.health = "warning";
        summary.alerts.push("Ressources serveur élevées");
      }
    }

    if (metrics.application_performance) {
      const app = metrics.application_performance;
      if (app.response_time > 1000 || app.error_rate > 0.05) {
        summary.performance = "degraded";
        summary.alerts.push("Performance application dégradée");
      }
    }

    if (metrics.user_experience) {
      const ux = metrics.user_experience;
      if (ux.bounce_rate > 0.4 || ux.page_load_time > 3000) {
        summary.efficiency = "poor";
        summary.alerts.push("Expérience utilisateur impactée");
      }
    }

    return summary;
  }

  async getMetricsHistory(timeframe = "1h", aggregationType = "short_term") {
    try {
      const timeframeMs = this.parseTimeframe(timeframe);
      const cutoff = Date.now() - timeframeMs;

      const historyData = [];

      // Récupérer les données agrégées
      for (const [key, data] of this.metrics) {
        if (
          data.type === "aggregation" &&
          data.aggregationType === aggregationType &&
          data.timestamp.getTime() >= cutoff
        ) {
          historyData.push(data);
        }
      }

      // Trier par timestamp
      historyData.sort((a, b) => a.timestamp - b.timestamp);

      return {
        timeframe,
        aggregationType,
        dataPoints: historyData.length,
        data: historyData,
        trends: this.analyzeHistoryTrends(historyData),
      };
    } catch (error) {
      console.error("❌ Erreur historique métriques:", error);
      return this.getFallbackHistory();
    }
  }

  analyzeHistoryTrends(historyData) {
    if (historyData.length < 2) {
      return { trend: "insufficient_data" };
    }

    const trends = {};
    const collectors = new Set();

    // Identifier tous les collecteurs
    for (const data of historyData) {
      for (const collector of Object.keys(data.data)) {
        collectors.add(collector);
      }
    }

    // Analyser les tendances pour chaque collecteur
    for (const collector of collectors) {
      trends[collector] = this.analyzeTrendForCollector(historyData, collector);
    }

    return trends;
  }

  analyzeTrendForCollector(historyData, collectorName) {
    const values = [];

    for (const data of historyData) {
      if (data.data[collectorName]) {
        values.push(data.data[collectorName]);
      }
    }

    if (values.length < 2) return { trend: "stable" };

    // Analyser les tendances des métriques principales
    const trends = {};
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    for (const metricName of Object.keys(values[0])) {
      const firstAvg = this.getAverageMetricValue(firstHalf, metricName);
      const secondAvg = this.getAverageMetricValue(secondHalf, metricName);

      if (firstAvg && secondAvg) {
        const change = (secondAvg - firstAvg) / firstAvg;
        trends[metricName] = {
          change: Math.round(change * 10000) / 100, // Pourcentage
          direction: change > 0.05 ? "up" : change < -0.05 ? "down" : "stable",
        };
      }
    }

    return trends;
  }

  getAverageMetricValue(aggregatedValues, metricName) {
    const values = aggregatedValues
      .map((v) => v[metricName]?.avg)
      .filter((v) => v !== undefined);

    if (values.length === 0) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  parseTimeframe(timeframe) {
    const units = { m: 60000, h: 3600000, d: 86400000 };
    const match = timeframe.match(/(\d+)([mhd])/);
    if (match) {
      return parseInt(match[1]) * (units[match[2]] || 3600000);
    }
    return 3600000; // 1h par défaut
  }

  async generatePerformanceReport() {
    try {
      const report = {
        period: "last_24h",
        summary: await this.getCurrentMetrics(),
        trends: await this.getMetricsHistory("24h", "medium_term"),
        benchmarks: await this.compareToBenchmarks(),
        recommendations: await this.generatePerformanceRecommendations(),
        generatedAt: new Date(),
      };

      return report;
    } catch (error) {
      console.error("❌ Erreur rapport performance:", error);
      return this.getFallbackPerformanceReport();
    }
  }

  async compareToBenchmarks() {
    // Benchmarks de l'industrie (simulation)
    const benchmarks = {
      response_time: { industry: 200, our: 150, status: "excellent" },
      page_load_time: { industry: 2500, our: 1800, status: "good" },
      bounce_rate: { industry: 0.35, our: 0.28, status: "excellent" },
      uptime: { industry: 99.5, our: 99.8, status: "excellent" },
    };

    return benchmarks;
  }

  async generatePerformanceRecommendations() {
    const current = await this.getCurrentMetrics();
    const recommendations = [];

    // Analyser les métriques actuelles
    if (current.summary.health === "warning") {
      recommendations.push({
        type: "infrastructure",
        priority: "high",
        action: "Augmenter les ressources serveur",
        impact: "Amélioration stabilité et performance",
      });
    }

    if (current.summary.performance === "degraded") {
      recommendations.push({
        type: "optimization",
        priority: "medium",
        action: "Optimiser les requêtes et algorithmes",
        impact: "Réduction temps de réponse",
      });
    }

    if (current.summary.efficiency === "poor") {
      recommendations.push({
        type: "ux",
        priority: "high",
        action: "Optimiser l'expérience utilisateur",
        impact: "Amélioration engagement et rétention",
      });
    }

    return recommendations;
  }

  async stopCollection() {
    // Arrêter tous les collecteurs
    for (const [name, collector] of this.collectors) {
      if (collector.intervalId) {
        clearInterval(collector.intervalId);
        collector.intervalId = null;
      }
    }

    // Arrêter l'agrégation
    if (this.aggregationInterval) {
      clearInterval(this.aggregationInterval);
      this.aggregationInterval = null;
    }

    console.log("⏹️ Collecte de métriques arrêtée");
  }

  getFallbackCurrentMetrics() {
    return {
      timestamp: new Date(),
      collectors: {
        server_performance: { cpu_usage: 45, memory_usage: 60 },
        application_performance: { response_time: 150, error_rate: 0.01 },
      },
      summary: { health: "good", performance: "optimal", efficiency: "good" },
      fallback: true,
    };
  }

  getFallbackHistory() {
    return {
      timeframe: "1h",
      aggregationType: "short_term",
      dataPoints: 0,
      data: [],
      trends: { trend: "stable" },
      fallback: true,
    };
  }

  getFallbackPerformanceReport() {
    return {
      period: "last_24h",
      summary: this.getFallbackCurrentMetrics(),
      trends: this.getFallbackHistory(),
      benchmarks: { response_time: { status: "good" } },
      recommendations: [{ type: "general", action: "Monitoring de base" }],
      fallback: true,
    };
  }
}

module.exports = PerformanceMetrics;
