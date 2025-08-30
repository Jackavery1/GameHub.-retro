# 🧪 Guide de Test Manuel - Phase 2 : Interface d'Administration MCP

## 📋 **Vue d'Ensemble**

Ce guide vous accompagne dans le test complet de l'interface Phase 2 de GameHub Retro. L'interface permet aux administrateurs de gérer le serveur MCP, configurer les tâches de maintenance et surveiller les performances.

## 🚀 **Prérequis**

- ✅ Serveur principal démarré sur le port 3001
- ✅ Serveur MCP démarré sur le port 3002 (optionnel pour tests complets)
- ✅ Compte utilisateur avec rôle "admin"
- ✅ Navigateur web moderne (Chrome, Firefox, Edge)

## 🧪 **Étapes de Test**

### **1. Test de la Page d'Accueil**

**URL** : `http://localhost:3001/`

**Vérifications** :

- [ ] La page se charge sans erreur
- [ ] Le design est cohérent avec le thème GameHub Retro
- [ ] Le lien "MCP Admin" est visible dans le header (si connecté en tant qu'admin)
- [ ] Aucune erreur dans la console du navigateur

**Résultat attendu** : ✅ Page d'accueil fonctionnelle

---

### **2. Test de l'Interface d'Administration**

**URL** : `http://localhost:3001/admin/mcp-settings`

**Vérifications** :

- [ ] Redirection vers la page de connexion si non authentifié (protection active)
- [ ] Chargement de l'interface après authentification admin
- [ ] Tous les onglets sont visibles et fonctionnels
- [ ] Le fichier JavaScript MCP se charge sans erreur 404

**Résultat attendu** : ✅ Interface accessible et protégée

---

### **3. Test des Onglets de l'Interface**

#### **Onglet "Vue d'ensemble"**

- [ ] Statut du serveur MCP affiché
- [ ] Métriques (uptime, clients connectés) visibles
- [ ] Boutons d'action (Vérifier, Démarrer, Arrêter) fonctionnels
- [ ] Statistiques rapides (tâches actives, outils disponibles) affichées
- [ ] Actions rapides (nettoyage utilisateurs, sauvegarde DB) cliquables

#### **Onglet "Tâches de maintenance"**

- [ ] Liste des tâches planifiées visible
- [ ] Bouton "Actualiser" fonctionnel
- [ ] Informations sur les tâches (schedule, priorité) affichées

#### **Onglet "Configuration"**

- [ ] Formulaire de configuration des tâches visible
- [ ] Switches d'activation/désactivation fonctionnels
- [ ] Champs de schedule cron éditables
- [ ] Bouton "Sauvegarder la Configuration" fonctionnel

#### **Onglet "Monitoring"**

- [ ] Métriques système (CPU, mémoire, disque) affichées
- [ ] Boutons "Démarrer/Arrêter le monitoring" fonctionnels
- [ ] Graphiques de performance visibles

#### **Onglet "Logs"**

- [ ] Historique des opérations affiché
- [ ] Filtres par niveau (Info, Warning, Error) fonctionnels
- [ ] Bouton "Actualiser" fonctionnel

---

### **4. Test des Fonctionnalités JavaScript**

**Vérifications dans la console du navigateur** :

- [ ] Aucune erreur "function not defined"
- [ ] Toutes les fonctions MCP sont définies
- [ ] Les interactions (clics, formulaires) fonctionnent
- [ ] Les notifications toast s'affichent correctement

**Fonctions à tester** :

- `checkServerStatus()` - Vérification du statut du serveur
- `refreshTasks()` - Actualisation des tâches
- `loadConfiguration()` - Chargement de la configuration
- `saveConfiguration()` - Sauvegarde de la configuration
- `startMonitoring()` - Démarrage du monitoring
- `refreshLogs()` - Actualisation des logs

---

### **5. Test de la Sécurité**

**Vérifications** :

- [ ] Accès aux routes admin sans authentification → Redirection vers connexion
- [ ] Accès avec un compte non-admin → Accès refusé
- [ ] Accès avec un compte admin → Interface accessible
- [ ] Protection des endpoints MCP sensibles

---

### **6. Test de la Responsivité**

**Tests sur différentes tailles d'écran** :

- [ ] **Desktop** (1920x1080) : Interface complète visible
- [ ] **Tablette** (768x1024) : Adaptation des colonnes
- [ ] **Mobile** (375x667) : Navigation mobile fonctionnelle

---

## 🔧 **Dépannage des Problèmes Courants**

### **Problème : Page 404 sur les routes admin**

**Solution** : Vérifiez que le serveur a été redémarré après l'ajout des routes

### **Problème : JavaScript non chargé**

**Solution** : Vérifiez la console du navigateur et l'URL du fichier JS

### **Problème : Erreurs d'authentification**

**Solution** : Vérifiez que vous avez un compte avec le rôle "admin"

### **Problème : Interface non responsive**

**Solution** : Vérifiez que Bootstrap et les CSS sont chargés

---

## 📊 **Critères de Réussite**

### **Niveau Basique** ✅

- [ ] Interface accessible après authentification admin
- [ ] Tous les onglets se chargent sans erreur
- [ ] Navigation entre les onglets fonctionnelle
- [ ] Aucune erreur JavaScript critique

### **Niveau Intermédiaire** ✅✅

- [ ] Toutes les fonctionnalités JavaScript fonctionnent
- [ ] Interface responsive sur tous les écrans
- [ ] Sécurité des routes admin active
- [ ] Intégration avec le serveur MCP fonctionnelle

### **Niveau Avancé** ✅✅✅

- [ ] Toutes les tâches de maintenance exécutables
- [ ] Monitoring en temps réel fonctionnel
- [ ] Configuration sauvegardée et rechargée
- [ ] Logs et métriques à jour

---

## 🎯 **Validation Finale**

**Avant de passer à la Phase 3, vérifiez que** :

- [ ] Tous les tests de niveau basique sont passés
- [ ] Au moins 80% des tests de niveau intermédiaire sont passés
- [ ] L'interface est stable et sans erreur critique
- [ ] La sécurité est active et fonctionnelle

---

## 📝 **Rapport de Test**

Après chaque session de test, documentez :

- **Date et heure** du test
- **Navigateur utilisé** et version
- **Problèmes rencontrés** et solutions appliquées
- **Fonctionnalités testées** avec succès
- **Recommandations** pour la Phase 3

---

## 🚀 **Prochaines Étapes**

Une fois la Phase 2 validée :

1. **Phase 3** : Fonctionnalités avancées et intégration complète
2. **Optimisation** des performances et de l'expérience utilisateur
3. **Tests de charge** et de sécurité approfondis
4. **Documentation** complète pour les administrateurs

---

_Guide créé pour GameHub Retro - Phase 2 MCP Administration_
_Version : 1.0 | Date : Août 2025_

