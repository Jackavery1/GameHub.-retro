# 🎮 Serveur MCP GameHub Retro

Un serveur MCP (Model Context Protocol) complet pour la gestion de la plateforme GameHub Retro, offrant des outils avancés pour la gestion des utilisateurs, des jeux, des tournois et de la base de données.

## 🚀 Installation

### Prérequis

- Node.js 16+
- MongoDB
- npm ou yarn

### Installation des dépendances

```bash
npm install @modelcontextprotocol/sdk @modelcontextprotocol/server
```

## 📁 Structure du projet

```
src/mcp/
├── server.js              # Serveur MCP principal
├── tools/
│   ├── userTools.js       # Outils de gestion des utilisateurs
│   ├── gameTools.js       # Outils de gestion des jeux
│   ├── tournamentTools.js # Outils de gestion des tournois
│   ├── authTools.js       # Outils d'authentification
│   └── databaseTools.js   # Outils de base de données
```

## 🛠️ Outils disponibles

### 👥 Gestion des utilisateurs (`userTools`)

#### `get_user`

Récupère un utilisateur par son ID ou email.

**Paramètres:**

- `userId` (string, optionnel): ID de l'utilisateur
- `email` (string, optionnel): Email de l'utilisateur

**Exemple:**

```json
{
  "email": "user@example.com"
}
```

#### `create_user`

Crée un nouvel utilisateur.

**Paramètres:**

- `name` (string, requis): Nom de l'utilisateur
- `email` (string, requis): Email de l'utilisateur
- `password` (string, requis): Mot de passe
- `role` (string, optionnel): Rôle (user/admin, défaut: user)

#### `update_user`

Met à jour un utilisateur existant.

**Paramètres:**

- `userId` (string, requis): ID de l'utilisateur
- `updates` (object, requis): Champs à mettre à jour

#### `delete_user`

Supprime un utilisateur.

**Paramètres:**

- `userId` (string, requis): ID de l'utilisateur

#### `list_users`

Liste tous les utilisateurs avec pagination.

**Paramètres:**

- `page` (number, optionnel): Numéro de page (défaut: 1)
- `limit` (number, optionnel): Nombre d'utilisateurs par page (défaut: 10)
- `role` (string, optionnel): Filtrer par rôle

#### `link_account`

Lie un compte externe à un utilisateur.

**Paramètres:**

- `userId` (string, requis): ID de l'utilisateur
- `provider` (string, requis): Fournisseur (steam, gog, epic, itchio, amazon)
- `handle` (string, requis): Identifiant public du compte

### 🎮 Gestion des jeux (`gameTools`)

#### `get_game`

Récupère un jeu par son ID, slug ou nom.

**Paramètres:**

- `gameId` (string, optionnel): ID du jeu
- `slug` (string, optionnel): Slug du jeu
- `name` (string, optionnel): Nom du jeu

#### `create_game`

Crée un nouveau jeu.

**Paramètres:**

- `name` (string, requis): Nom du jeu
- `slug` (string, requis): Slug unique du jeu
- `cover` (string, optionnel): URL de la couverture
- `genres` (array, optionnel): Genres du jeu
- `rawgId` (number, optionnel): ID RAWG
- `steamAppId` (number, optionnel): ID Steam

#### `update_game`

Met à jour un jeu existant.

**Paramètres:**

- `gameId` (string, requis): ID du jeu
- `updates` (object, requis): Champs à mettre à jour

#### `delete_game`

Supprime un jeu.

**Paramètres:**

- `gameId` (string, requis): ID du jeu

#### `list_games`

Liste tous les jeux avec filtres et pagination.

**Paramètres:**

- `page` (number, optionnel): Numéro de page (défaut: 1)
- `limit` (number, optionnel): Nombre de jeux par page (défaut: 20)
- `genre` (string, optionnel): Filtrer par genre
- `search` (string, optionnel): Recherche par nom
- `sortBy` (string, optionnel): Critère de tri (défaut: name)
- `sortOrder` (string, optionnel): Ordre de tri (asc/desc, défaut: asc)

#### `search_games`

Recherche avancée de jeux.

**Paramètres:**

- `query` (string, requis): Terme de recherche
- `genres` (array, optionnel): Genres à inclure
- `excludeGenres` (array, optionnel): Genres à exclure
- `hasCover` (boolean, optionnel): Jeux avec couverture uniquement
- `limit` (number, optionnel): Nombre maximum de résultats (défaut: 50)

#### `get_game_stats`

Récupère les statistiques des jeux.

**Paramètres:**

- `includeGenres` (boolean, optionnel): Inclure les statistiques par genre (défaut: true)

### 🏆 Gestion des tournois (`tournamentTools`)

#### `get_tournament`

Récupère un tournoi par son ID ou nom.

**Paramètres:**

- `tournamentId` (string, optionnel): ID du tournoi
- `name` (string, optionnel): Nom du tournoi

#### `create_tournament`

Crée un nouveau tournoi.

**Paramètres:**

- `name` (string, requis): Nom du tournoi
- `description` (string, optionnel): Description du tournoi
- `gameId` (string, requis): ID du jeu
- `organizerId` (string, requis): ID de l'organisateur
- `maxParticipants` (number, requis): Nombre maximum de participants
- `startDate` (string, requis): Date de début (ISO string)
- `endDate` (string, optionnel): Date de fin (ISO string)
- `format` (string, optionnel): Format (single_elimination, double_elimination, round_robin)
- `entryFee` (number, optionnel): Frais d'inscription (défaut: 0)
- `prizePool` (number, optionnel): Prix à gagner (défaut: 0)

#### `update_tournament`

Met à jour un tournoi existant.

**Paramètres:**

- `tournamentId` (string, requis): ID du tournoi
- `updates` (object, requis): Champs à mettre à jour

#### `delete_tournament`

Supprime un tournoi et toutes ses données associées.

**Paramètres:**

- `tournamentId` (string, requis): ID du tournoi

#### `list_tournaments`

Liste tous les tournois avec filtres et pagination.

**Paramètres:**

- `page` (number, optionnel): Numéro de page (défaut: 1)
- `limit` (number, optionnel): Nombre de tournois par page (défaut: 10)
- `status` (string, optionnel): Filtrer par statut
- `gameId` (string, optionnel): Filtrer par jeu
- `organizerId` (string, optionnel): Filtrer par organisateur
- `search` (string, optionnel): Recherche par nom

#### `register_participant`

Inscrit un participant à un tournoi.

**Paramètres:**

- `tournamentId` (string, requis): ID du tournoi
- `userId` (string, requis): ID de l'utilisateur

#### `get_tournament_participants`

Récupère la liste des participants d'un tournoi.

**Paramètres:**

- `tournamentId` (string, requis): ID du tournoi

#### `generate_tournament_bracket`

Génère le bracket d'un tournoi.

**Paramètres:**

- `tournamentId` (string, requis): ID du tournoi

### 🔐 Outils d'authentification (`authTools`)

#### `authenticate_user`

Authentifie un utilisateur avec email et mot de passe.

**Paramètres:**

- `email` (string, requis): Email de l'utilisateur
- `password` (string, requis): Mot de passe

#### `change_password`

Change le mot de passe d'un utilisateur.

**Paramètres:**

- `userId` (string, requis): ID de l'utilisateur
- `currentPassword` (string, requis): Mot de passe actuel
- `newPassword` (string, requis): Nouveau mot de passe

#### `reset_password`

Réinitialise le mot de passe d'un utilisateur (admin seulement).

**Paramètres:**

- `userId` (string, requis): ID de l'utilisateur
- `newPassword` (string, requis): Nouveau mot de passe
- `adminUserId` (string, requis): ID de l'administrateur

#### `verify_steam_account`

Vérifie et lie un compte Steam à un utilisateur.

**Paramètres:**

- `userId` (string, requis): ID de l'utilisateur
- `steamId` (string, requis): ID Steam de l'utilisateur

#### `check_permissions`

Vérifie les permissions d'un utilisateur.

**Paramètres:**

- `userId` (string, requis): ID de l'utilisateur
- `requiredRole` (string, requis): Rôle requis
- `action` (string, requis): Action à effectuer

#### `get_user_session`

Récupère les informations de session d'un utilisateur.

**Paramètres:**

- `userId` (string, requis): ID de l'utilisateur

#### `validate_token`

Valide un token d'authentification (simulation).

**Paramètres:**

- `token` (string, requis): Token à valider
- `tokenType` (string, optionnel): Type de token (session/api/steam)

### 🗄️ Outils de base de données (`databaseTools`)

#### `get_database_status`

Récupère le statut de la base de données.

**Paramètres:**

- `includeStats` (boolean, optionnel): Inclure les statistiques détaillées (défaut: true)

#### `backup_database`

Effectue une sauvegarde de la base de données (simulation).

**Paramètres:**

- `includeCollections` (array, optionnel): Collections à inclure
- `backupName` (string, optionnel): Nom de la sauvegarde

#### `get_collection_stats`

Récupère les statistiques d'une collection spécifique.

**Paramètres:**

- `collectionName` (string, requis): Nom de la collection

#### `optimize_database`

Optimise la base de données (simulation).

**Paramètres:**

- `operations` (array, optionnel): Opérations d'optimisation (défaut: ['reindex', 'validate'])

#### `get_system_info`

Récupère les informations système et de performance.

**Paramètres:**

- `includePerformance` (boolean, optionnel): Inclure les métriques de performance (défaut: true)

#### `clear_collection`

Vide une collection spécifique (danger: supprime toutes les données).

**Paramètres:**

- `collectionName` (string, requis): Nom de la collection
- `confirm` (boolean, requis): Confirmation de suppression

#### `export_collection`

Exporte une collection au format JSON (simulation).

**Paramètres:**

- `collectionName` (string, requis): Nom de la collection
- `limit` (number, optionnel): Nombre maximum de documents (défaut: 1000)
- `format` (string, optionnel): Format d'export (json/csv, défaut: json)

## 🚀 Utilisation

### Démarrage du serveur

```bash
node src/mcp/server.js
```

### Test du serveur

```bash
npm run test:mcp
```

### Configuration MCP

Ajoutez la configuration suivante à votre fichier MCP :

```json
{
  "mcpServers": {
    "gamehub-retro": {
      "command": "node",
      "args": ["src/mcp/server.js"],
      "env": {
        "NODE_ENV": "development",
        "MONGODB_URI": "mongodb://localhost:27017/gamehub-retro"
      }
    }
  }
}
```

## 🔧 Configuration

### Variables d'environnement

- `MONGODB_URI`: URI de connexion MongoDB
- `NODE_ENV`: Environnement (development/production)
- `SESSION_SECRET`: Secret de session (pour l'application principale)

### Base de données

Le serveur MCP se connecte automatiquement à la base de données MongoDB configurée dans l'application principale.

## 🧪 Tests

Le serveur inclut un script de test complet qui valide :

- Le démarrage du serveur
- La gestion des erreurs
- La fermeture propre du serveur

## 📝 Logs

Le serveur MCP génère des logs détaillés pour :

- Les appels d'outils
- Les erreurs
- Le statut de la base de données
- Les opérations système

## 🔒 Sécurité

- Validation des paramètres d'entrée
- Vérification des permissions utilisateur
- Protection contre les injections MongoDB
- Gestion sécurisée des mots de passe avec bcrypt

## 🤝 Contribution

Pour contribuer au serveur MCP :

1. Créez une branche pour votre fonctionnalité
2. Ajoutez des tests pour les nouveaux outils
3. Mettez à jour la documentation
4. Soumettez une pull request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 🆘 Support

Pour toute question ou problème :

- Créez une issue sur GitHub
- Consultez la documentation
- Contactez l'équipe de développement

---

**GameHub Retro MCP Server** - Propulsé par le protocole MCP pour une gestion avancée de votre plateforme de jeux rétro ! 🎮✨
