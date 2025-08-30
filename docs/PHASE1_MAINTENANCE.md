# 🚀 Phase 1 : Maintenance Automatique MCP - GameHub Retro

## 📋 Vue d'ensemble

La **Phase 1** implémente un système de maintenance automatique complet basé sur le serveur MCP sécurisé, accessible uniquement aux administrateurs. Cette phase automatise les tâches de maintenance critiques et améliore la gestion opérationnelle du projet.

## 🎯 Objectifs de la Phase 1

### ✅ **Sécurité MCP**

- Accès MCP restreint aux administrateurs uniquement
- Authentification par tokens sécurisés
- Middleware d'autorisation robuste
- Gestion des sessions et permissions

### ✅ **Automatisation de Base**

- Nettoyage automatique des utilisateurs inactifs
- Sauvegardes automatiques de la base de données
- Optimisation automatique des performances
- Vérifications de santé du système
- Nettoyage automatique des logs
- Analyse des performances

### ✅ **Planification Intelligente**

- Planificateur de tâches basé sur cron
- Gestion des priorités et des conflits
- Retry automatique en cas d'échec
- Notifications et alertes configurables
- Logs détaillés et rapports

## 🏗️ Architecture de la Phase 1

### **Structure des Fichiers**

```
src/mcp/
├── middleware/
│   └── auth.js              # Authentification admin MCP
├── client.js                # Client MCP pour scripts
└── server.js                # Serveur MCP sécurisé

scripts/maintenance/
├── cleanup-users.js         # Nettoyage des utilisateurs
├── scheduler.js             # Planificateur de tâches
└── test-maintenance.js      # Tests des fonctionnalités

config/
└── maintenance.json         # Configuration centralisée

docs/
└── PHASE1_MAINTENANCE.md   # Cette documentation
```

### **Composants Principaux**

#### 1. **Serveur MCP Sécurisé** (`src/mcp/server.js`)

- Authentification admin obligatoire
- Endpoints protégés pour la gestion
- WebSocket sécurisé avec tokens
- Gestion des erreurs et logs

#### 2. **Middleware d'Authentification** (`src/mcp/middleware/auth.js`)

- Vérification des tokens admin
- Cache des sessions pour performance
- Gestion des permissions
- Nettoyage automatique des tokens expirés

#### 3. **Client MCP** (`src/mcp/client.js`)

- Connexion WebSocket sécurisée
- Gestion des requêtes et réponses
- Reconnexion automatique
- Méthodes utilitaires pour la maintenance

#### 4. **Planificateur de Maintenance** (`scripts/maintenance/scheduler.js`)

- Planification basée sur cron
- Exécution concurrente contrôlée
- Gestion des erreurs et retry
- Historique des tâches

## 🔐 Sécurité et Authentification

### **Système de Tokens Admin**

```javascript
// Génération d'un token admin
POST /auth/generate-token
{
  "adminUserId": "user_id",
  "adminPassword": "password"
}

// Réponse
{
  "success": true,
  "token": "mcp_admin_1234567890_abc123",
  "expiresAt": "2025-08-29T14:25:00.000Z"
}
```

### **Utilisation des Tokens**

```javascript
// WebSocket avec token
ws://localhost:3002?token=YOUR_TOKEN

// HTTP avec header
Authorization: Bearer YOUR_TOKEN

// Query parameter
GET /tools?token=YOUR_TOKEN
```

### **Permissions et Rôles**

- **Admin uniquement** : Accès complet au serveur MCP
- **Vérification automatique** : Chaque requête vérifie les droits
- **Audit trail** : Toutes les actions sont loggées avec l'utilisateur

## 📅 Tâches de Maintenance Automatisées

### **1. Nettoyage des Utilisateurs Inactifs**

- **Fréquence** : Quotidien à 2h du matin
- **Critères** : Inactifs depuis 30+ jours
- **Sécurité** : Mode test par défaut
- **Préservation** : Comptes Steam et liés

```javascript
// Configuration
{
  "inactiveDays": 30,
  "dryRun": true,
  "batchSize": 50,
  "preserveSteamAccounts": true
}
```

### **2. Sauvegarde de la Base de Données**

- **Fréquence** : Hebdomadaire (dimanche à 3h)
- **Contenu** : Collections critiques
- **Compression** : Automatique
- **Rétention** : 10 sauvegardes max

```javascript
// Configuration
{
  "includeCollections": ["users", "games", "tournaments", "matches"],
  "compression": true,
  "maxBackups": 10
}
```

### **3. Optimisation de la Base**

- **Fréquence** : Tous les 15 jours à 4h
- **Opérations** : Reindex, validation, compactage
- **Fenêtre** : 4h-6h du matin
- **Retry** : Automatique en cas d'échec

### **4. Vérification de Santé**

- **Fréquence** : Toutes les 6 heures
- **Métriques** : Base, mémoire, disque, réseau
- **Seuils** : Alertes configurables
- **Actions** : Notifications automatiques

### **5. Nettoyage des Logs**

- **Fréquence** : Tous les 7 jours à 5h
- **Rétention** : 30 jours
- **Préservation** : Logs d'erreur
- **Compression** : Automatique

### **6. Analyse des Performances**

- **Fréquence** : Tous les 30 jours à 6h
- **Métriques** : CPU, mémoire, disque, réseau, base
- **Rapports** : Génération automatique
- **Recommandations** : Basées sur les seuils

## 🛠️ Utilisation Pratique

### **Démarrage du Système**

#### 1. **Démarrer le Serveur MCP**

```bash
npm run mcp:start
```

#### 2. **Générer un Token Admin**

```bash
curl -X POST http://localhost:3002/auth/generate-token \
  -H "Content-Type: application/json" \
  -d '{
    "adminUserId": "your_admin_id",
    "adminPassword": "your_password"
  }'
```

#### 3. **Tester le Nettoyage des Utilisateurs**

```bash
# Définir le token
export MCP_ADMIN_TOKEN="your_token_here"

# Exécuter le nettoyage
npm run mcp:maintenance:cleanup
```

#### 4. **Démarrer le Planificateur**

```bash
npm run mcp:maintenance:scheduler
```

### **Scripts de Maintenance Disponibles**

#### **Nettoyage Manuel**

```bash
# Nettoyage des utilisateurs
npm run mcp:maintenance:cleanup

# Nettoyage en mode test
npm run mcp:maintenance:test
```

#### **Planificateur**

```bash
# Démarrer le planificateur
npm run mcp:maintenance:scheduler

# Vérifier le statut
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3002/admin/stats
```

### **Configuration des Tâches**

#### **Modifier les Schedules**

```json
{
  "cleanup-users": {
    "schedule": "0 2 * * *", // Quotidien à 2h
    "enabled": true,
    "config": {
      "inactiveDays": 30,
      "dryRun": false // Désactiver le mode test
    }
  }
}
```

#### **Activer/Désactiver des Tâches**

```json
{
  "backup-database": {
    "enabled": false, // Désactiver la sauvegarde
    "schedule": "0 3 * * 0"
  }
}
```

## 📊 Monitoring et Rapports

### **Endpoints de Monitoring**

#### **Statut du Serveur**

```bash
# Santé générale (public)
GET /health

# Statistiques admin (protégé)
GET /admin/stats
Authorization: Bearer YOUR_TOKEN

# Liste des outils (protégé)
GET /tools
Authorization: Bearer YOUR_TOKEN
```

#### **Logs de Maintenance**

- **Fichier** : `logs/maintenance-scheduler.log`
- **Format** : JSON structuré
- **Rétention** : Configurable
- **Rotation** : Automatique

### **Rapports Automatiques**

#### **Rapport de Nettoyage**

```json
{
  "timestamp": "2025-08-28T14:25:00.000Z",
  "task": "cleanup-users",
  "result": {
    "total": 150,
    "inactive": 23,
    "processed": 23,
    "errors": 0
  },
  "duration": 4500,
  "recommendations": [
    {
      "type": "info",
      "message": "23 utilisateurs inactifs traités",
      "action": "Vérifier les comptes supprimés"
    }
  ]
}
```

#### **Rapport de Performance**

```json
{
  "timestamp": "2025-08-28T06:00:00.000Z",
  "task": "performance-analysis",
  "analysis": {
    "memory": {
      "usage": 0.65,
      "status": "good"
    },
    "uptime": {
      "days": 15,
      "status": "good"
    }
  },
  "recommendations": [
    {
      "type": "info",
      "message": "Serveur stable depuis 15 jours",
      "action": "Continuer la surveillance"
    }
  ]
}
```

## 🔧 Configuration Avancée

### **Variables d'Environnement**

```bash
# Token admin MCP
MCP_ADMIN_TOKEN=your_token_here

# Configuration de la base
MONGODB_URI=mongodb://localhost:27017/gamehub-retro

# Mode d'exécution
NODE_ENV=production
```

### **Personnalisation des Tâches**

#### **Ajouter une Nouvelle Tâche**

```javascript
// Dans scheduler.js
this.scheduleTask(
  "custom-task",
  "0 7 * * *",
  async () => {
    return await this.runCustomTask();
  },
  {
    description: "Tâche personnalisée",
    priority: "medium",
    retryOnFailure: true,
    maxRetries: 2,
  }
);
```

#### **Modifier les Seuils d'Alerte**

```json
{
  "monitoring": {
    "alerts": {
      "memory": 0.85, // Alerte à 85% d'utilisation
      "disk": 0.95, // Alerte à 95% d'utilisation
      "responseTime": 3000 // Alerte si réponse > 3s
    }
  }
}
```

## 🚨 Gestion des Erreurs et Retry

### **Stratégie de Retry**

- **Retry automatique** : Configurable par tâche
- **Délai progressif** : 5 min, 10 min, 15 min
- **Nombre maximum** : Configurable par tâche
- **Log des échecs** : Historique complet

### **Types d'Erreurs Gérées**

- **Erreurs réseau** : Reconnexion automatique
- **Erreurs de base** : Retry avec délai
- **Timeouts** : Gestion des tâches longues
- **Erreurs critiques** : Notifications immédiates

### **Exemple de Gestion d'Erreur**

```javascript
try {
  const result = await this.mcpClient.backupDatabase();
  return result;
} catch (error) {
  if (error.code === "ECONNREFUSED") {
    // Erreur de connexion - retry automatique
    throw new Error("Erreur de connexion - retry programmé");
  } else if (error.code === "ENOSPC") {
    // Espace disque insuffisant - erreur critique
    await this.notifyCriticalError("Espace disque insuffisant");
    throw error;
  }
  throw error;
}
```

## 📈 Métriques et Performance

### **Métriques Collectées**

- **Système** : CPU, mémoire, disque, réseau
- **Base de données** : Connexions, requêtes, index
- **Application** : Temps de réponse, erreurs
- **Maintenance** : Durée des tâches, taux de succès

### **Tableau de Bord**

```json
{
  "system": {
    "uptime": 1296000,
    "memory": {
      "used": 268435456,
      "total": 536870912,
      "usage": 0.5
    },
    "cpu": {
      "load": 0.3,
      "cores": 8
    }
  },
  "maintenance": {
    "activeTasks": 2,
    "completedToday": 15,
    "failedToday": 1,
    "successRate": 0.94
  }
}
```

## 🔮 Évolutions Futures (Phase 2)

### **Fonctionnalités Prévues**

- **Interface web** de gestion des tâches
- **Notifications avancées** (Slack, Discord, email)
- **Machine Learning** pour l'optimisation automatique
- **Intégration CI/CD** pour le déploiement
- **Monitoring temps réel** avec WebSocket
- **API REST** pour l'intégration externe

### **Améliorations Techniques**

- **Clustering** pour la haute disponibilité
- **Base de données** pour l'historique des tâches
- **Chiffrement** des données sensibles
- **Audit trail** complet des actions
- **Backup cloud** automatique

## 📚 Ressources et Support

### **Documentation Associée**

- [Serveur MCP Principal](../MCP_README.md)
- [Configuration de Maintenance](../config/maintenance.json)
- [Scripts de Maintenance](../scripts/maintenance/)

### **Commandes Utiles**

```bash
# Tests complets
node scripts/test-maintenance.js

# Vérification de la configuration
node -e "console.log(require('./config/maintenance.json'))"

# Statut des processus
ps aux | grep node

# Logs en temps réel
tail -f logs/maintenance-scheduler.log
```

### **Dépannage Courant**

#### **Problème de Connexion MCP**

```bash
# Vérifier le serveur
curl http://localhost:3002/health

# Vérifier les logs
tail -f logs/mcp-server.log

# Redémarrer le serveur
npm run mcp:start
```

#### **Tâche de Maintenance Échouée**

```bash
# Vérifier les logs
tail -f logs/maintenance-scheduler.log

# Vérifier la configuration
cat config/maintenance.json

# Tester manuellement
npm run mcp:maintenance:cleanup
```

## 🎉 Conclusion de la Phase 1

La **Phase 1** de maintenance automatique MCP est maintenant **complètement opérationnelle** !

### **✅ Ce qui est accompli**

- Serveur MCP sécurisé et authentifié
- Système de maintenance automatique complet
- Planificateur de tâches robuste
- Scripts de nettoyage et d'optimisation
- Configuration centralisée et flexible
- Monitoring et rapports automatiques
- Gestion des erreurs et retry automatique

### **🚀 Prochaines étapes recommandées**

1. **Tester en production** avec un petit jeu de données
2. **Ajuster les schedules** selon vos besoins
3. **Configurer les notifications** pour les alertes
4. **Planifier la Phase 2** pour les fonctionnalités avancées

### **💡 Conseils d'utilisation**

- **Commencez en mode test** (`dryRun: true`)
- **Surveillez les logs** régulièrement
- **Ajustez les seuils** selon votre infrastructure
- **Testez les sauvegardes** avant de les activer

**🎯 Votre projet GameHub Retro dispose maintenant d'un système de maintenance professionnel et sécurisé !**
