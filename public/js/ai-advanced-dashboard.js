class AIAdvancedDashboard {
    constructor() {
        this.baseUrl = '/api/ai';
        this.isInitialized = false;
    }

    async init() {
        console.log('🧠 Initialisation AI Advanced Dashboard...');
        
        try {
            await this.initializeServices();
            this.startRealTimeUpdates();
            this.isInitialized = true;
            
            console.log('✅ AI Advanced Dashboard initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation AI Dashboard:', error);
        }
    }

    async initializeServices() {
        // Initialiser les services IA
        await this.updateEthicsMetrics();
        await this.updateAIMetrics();
    }

    async updateEthicsMetrics() {
        try {
            const response = await fetch(`${this.baseUrl}/ethics`);
            const data = await response.json();
            
            if (data.success) {
                this.updateMetric('bias-count', data.biasCount);
                this.updateMetric('transparency-score', data.transparency + '%');
                this.updateMetric('decisions-count', data.decisionsCount);
            }
        } catch (error) {
            console.error('❌ Erreur mise à jour métriques éthiques:', error);
        }
    }

    async updateAIMetrics() {
        try {
            const response = await fetch(`${this.baseUrl}/orchestrate`);
            const data = await response.json();
            
            if (data.success) {
                console.log('📊 Métriques IA mises à jour');
            }
        } catch (error) {
            console.error('❌ Erreur mise à jour métriques IA:', error);
        }
    }

    updateMetric(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    startRealTimeUpdates() {
        setInterval(() => {
            if (this.isInitialized) {
                this.updateEthicsMetrics();
                this.updateAIMetrics();
            }
        }, 30000);
    }
}

// Exposer globalement
window.AIAdvancedDashboard = AIAdvancedDashboard;