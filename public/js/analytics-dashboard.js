class AnalyticsDashboard {
  constructor() {
    this.baseUrl = "/api/analytics";
    this.updateInterval = 30000; // 30 secondes
    this.charts = {};
    this.isInitialized = false;
  }

  async init() {
    console.log("🎮 Initialisation Analytics Dashboard Rétro...");

    try {
      await this.setupWidgets();
      await this.initializeCharts();
      this.startRealTimeUpdates();
      this.isInitialized = true;

      console.log("✅ Analytics Dashboard Rétro initialisé");
    } catch (error) {
      console.error("❌ Erreur initialisation Analytics Dashboard:", error);
      this.initializeFallback();
    }
  }

  async setupWidgets() {
    console.log("🎯 Configuration des widgets analytics...");

    // Initialiser les métriques temps réel
    await this.updateRealTimeMetrics();

    // Initialiser les prédictions
    await this.updatePredictions();

    // Initialiser les insights
    await this.updateInsights();

    // Initialiser les expériences A/B
    await this.updateABExperiments();

    // Initialiser les optimisations
    await this.updateOptimizations();
  }

  async updateRealTimeMetrics() {
    try {
      const response = await fetch(`${this.baseUrl}/real-time`);
      const data = await response.json();

      if (data.success) {
        const metrics = data.data;

        // Mettre à jour les métriques principales
        this.updateMetric("active-users", metrics.users?.activeNow || "---");
        this.updateMetric(
          "daily-revenue",
          `€${metrics.revenue?.today || "---"}`
        );
        this.updateMetric(
          "performance-score",
          `${metrics.performance?.score || "---"}%`
        );
        this.updateMetric("active-alerts", metrics.alerts?.active || "---");

        // Mettre à jour les tendances
        this.updateTrend("users-trend", metrics.users?.trend || "📈 +12%");
        this.updateTrend("revenue-trend", metrics.revenue?.trend || "📈 +8%");
        this.updateTrend(
          "performance-trend",
          metrics.performance?.status || "📊 Optimal"
        );
        this.updateTrend(
          "alerts-status",
          metrics.alerts?.status || "✅ Normal"
        );

        console.log("📊 Métriques temps réel mises à jour");
      }
    } catch (error) {
      console.error("❌ Erreur mise à jour métriques:", error);
      this.setFallbackMetrics();
    }
  }

  async updatePredictions() {
    try {
      const response = await fetch(`${this.baseUrl}/predictions`);
      const data = await response.json();

      if (data.success) {
        const predictions = data.data;

        // Mettre à jour les prédictions utilisateur
        if (predictions.churnRisk) {
          this.updatePrediction("churn-risk", predictions.churnRisk.risk);
          this.updatePredictionBar("churn-fill", predictions.churnRisk.risk);
        }

        if (predictions.userBehavior?.engagement) {
          this.updatePrediction(
            "engagement",
            predictions.userBehavior.engagement
          );
          this.updatePredictionBar(
            "engagement-fill",
            predictions.userBehavior.engagement
          );
        }

        console.log("🧠 Prédictions mises à jour");
      }
    } catch (error) {
      console.error("❌ Erreur mise à jour prédictions:", error);
      this.setFallbackPredictions();
    }
  }

  async updateInsights() {
    try {
      const response = await fetch(`${this.baseUrl}/business`);
      const data = await response.json();

      if (data.success) {
        const insights = data.data;

        // Mettre à jour les métriques business
        this.updateBusinessMetric(
          "conversion-rate",
          insights.realTimeMetrics?.conversionRate || "---"
        );
        this.updateBusinessMetric(
          "ltv-average",
          `€${insights.realTimeMetrics?.ltv || "---"}`
        );
        this.updateBusinessMetric(
          "active-segments",
          insights.userSegments?.active || "---"
        );

        console.log("💡 Insights mis à jour");
      }
    } catch (error) {
      console.error("❌ Erreur mise à jour insights:", error);
      this.setFallbackInsights();
    }
  }

  async updateABExperiments() {
    try {
      const response = await fetch(`${this.baseUrl}/experiments`);
      const data = await response.json();

      if (data.success) {
        const experiments = data.data.experiments || [];

        // Mettre à jour les expériences A/B
        experiments.forEach((exp, index) => {
          this.updateExperimentProgress(index, exp.progress);
        });

        console.log("🧪 Expériences A/B mises à jour");
      }
    } catch (error) {
      console.error("❌ Erreur mise à jour expériences:", error);
    }
  }

  async updateOptimizations() {
    try {
      const response = await fetch(`${this.baseUrl}/optimizations`);
      const data = await response.json();

      if (data.success) {
        const optimizations = data.data.optimizations || [];

        // Mettre à jour les optimisations
        optimizations.forEach((opt, index) => {
          this.updateOptimizationStatus(index, opt.status);
        });

        console.log("⚡ Optimisations mises à jour");
      }
    } catch (error) {
      console.error("❌ Erreur mise à jour optimisations:", error);
    }
  }

  updateMetric(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
      element.style.animation = "none";
      element.offsetHeight; // Trigger reflow
      element.style.animation = "pulse 0.5s ease-in-out";
    }
  }

  updateTrend(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
      element.style.color = value.includes("+")
        ? "var(--green)"
        : value.includes("-")
        ? "var(--red)"
        : "var(--muted)";
    }
  }

  updatePrediction(id, value) {
    const element = document.querySelector(`[data-prediction="${id}"]`);
    if (element) {
      element.textContent = value;
    }
  }

  updatePredictionBar(className, percentage) {
    const elements = document.querySelectorAll(`.${className}`);
    elements.forEach((element) => {
      element.style.width = `${percentage}%`;
    });
  }

  updateBusinessMetric(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  updateExperimentProgress(index, progress) {
    const progressBars = document.querySelectorAll(".progress-fill");
    if (progressBars[index]) {
      progressBars[index].style.width = `${progress}%`;
    }
  }

  updateOptimizationStatus(index, status) {
    const statusElements = document.querySelectorAll(".optimization-status");
    if (statusElements[index]) {
      statusElements[index].textContent = status;
      statusElements[
        index
      ].className = `optimization-status ${status.toLowerCase()}`;
    }
  }

  async initializeCharts() {
    console.log("📈 Initialisation des graphiques rétro...");

    try {
      // Graphique temps réel
      const realtimeCtx = document.getElementById("realtime-chart");
      if (realtimeCtx) {
        this.charts.realtime = this.createRetroChart(
          realtimeCtx,
          "Métriques Temps Réel"
        );
      }

      // Graphique tendances
      const trendsCtx = document.getElementById("trends-chart");
      if (trendsCtx) {
        this.charts.trends = this.createRetroChart(
          trendsCtx,
          "Tendances Utilisateurs"
        );
      }

      console.log("✅ Graphiques rétro initialisés");
    } catch (error) {
      console.error("❌ Erreur initialisation graphiques:", error);
    }
  }

  createRetroChart(canvas, title) {
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Style rétro pour le canvas
    ctx.fillStyle = "var(--bg3)";
    ctx.fillRect(0, 0, width, height);

    // Bordure pixel art
    ctx.strokeStyle = "var(--neon)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);

    // Titre
    ctx.fillStyle = "var(--fg)";
    ctx.font = '12px "Press Start 2P"';
    ctx.textAlign = "center";
    ctx.fillText(title, width / 2, 20);

    // Données simulées
    this.drawRetroData(ctx, width, height);

    return ctx;
  }

  drawRetroData(ctx, width, height) {
    const data = this.generateRetroData();
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Grille de fond
    ctx.strokeStyle = "var(--tile)";
    ctx.lineWidth = 1;

    // Lignes verticales
    for (let i = 0; i <= 10; i++) {
      const x = padding + (i * chartWidth) / 10;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // Lignes horizontales
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * chartHeight) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Ligne de données
    ctx.strokeStyle = "var(--neon)";
    ctx.lineWidth = 3;
    ctx.beginPath();

    data.forEach((point, index) => {
      const x = padding + (index * chartWidth) / (data.length - 1);
      const y = height - padding - point * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Points de données
    ctx.fillStyle = "var(--neon)";
    data.forEach((point, index) => {
      const x = padding + (index * chartWidth) / (data.length - 1);
      const y = height - padding - point * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  generateRetroData() {
    const data = [];
    for (let i = 0; i < 20; i++) {
      data.push(Math.random() * 0.8 + 0.1);
    }
    return data;
  }

  startRealTimeUpdates() {
    console.log("🔄 Démarrage mises à jour temps réel...");

    setInterval(() => {
      if (this.isInitialized) {
        this.updateRealTimeMetrics();
        this.updatePredictions();
        this.updateInsights();
      }
    }, this.updateInterval);
  }

  setFallbackMetrics() {
    const fallbackData = {
      "active-users": "1,247",
      "daily-revenue": "€2,847",
      "performance-score": "94.2%",
      "active-alerts": "2",
    };

    Object.entries(fallbackData).forEach(([id, value]) => {
      this.updateMetric(id, value);
    });
  }

  setFallbackPredictions() {
    const fallbackData = {
      "churn-risk": "12%",
      engagement: "87%",
    };

    Object.entries(fallbackData).forEach(([id, value]) => {
      this.updatePrediction(id, value);
      this.updatePredictionBar(`${id.replace("-", "-")}-fill`, parseInt(value));
    });
  }

  setFallbackInsights() {
    const fallbackData = {
      "conversion-rate": "3.2%",
      "ltv-average": "€45.67",
      "active-segments": "8",
    };

    Object.entries(fallbackData).forEach(([id, value]) => {
      this.updateBusinessMetric(id, value);
    });
  }

  initializeFallback() {
    console.log("🔄 Initialisation fallback analytics...");

    this.setFallbackMetrics();
    this.setFallbackPredictions();
    this.setFallbackInsights();

    // Animation de chargement rétro
    const containers = document.querySelectorAll(".analytics-container");
    containers.forEach((container) => {
      container.style.animation = "glow 2s ease-in-out infinite alternate";
    });
  }
}

// Animation CSS pour les effets rétro
const retroStyles = `
@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

@keyframes glow {
    0% { box-shadow: 0 0 20px rgba(0, 247, 255, 0.3); }
    100% { box-shadow: 0 0 30px rgba(0, 247, 255, 0.6); }
}

.analytics-container {
    animation: glow 3s ease-in-out infinite alternate;
}

.metric-card:hover {
    animation: pulse 0.3s ease-in-out;
}

.dashboard-card:hover {
    animation: glow 1s ease-in-out infinite alternate;
}
`;

// Injecter les styles
const styleSheet = document.createElement("style");
styleSheet.textContent = retroStyles;
document.head.appendChild(styleSheet);

// Exposer globalement
window.AnalyticsDashboard = AnalyticsDashboard;
