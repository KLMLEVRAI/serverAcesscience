# Render Backend Setup

Ce dossier contient tout ce qu'il faut pour déployer le backend sur Render.

## Fichiers inclus :
- `server-mysql.js` - Serveur Node.js avec API REST
- `package.json` - Dépendances et scripts
- `.env.example` - Exemple de variables d'environnement

## Configuration Render

### 1. Uploader sur Render
1. Créez un nouveau **"Web Service"** sur Render
2. Connectez votre repository ou uploadez ces fichiers
3. Configurez les paramètres de build :
   - **Build Command**: `npm install`
   - **Start Command**: `node server-mysql.js`

### 2. Variables d'environnement
Dans le dashboard Render, ajoutez ces variables :

```
DB_HOST=sql200.infinityfree.com
DB_NAME=if0_40618350_db_accesscience
DB_USER=if0_40618350
DB_PASS=hfwsrgHNfTgyMpd
PORT=3001
NODE_ENV=production
```

### 3. API Endpoints
Une fois déployé, votre API sera accessible à :
`https://serveracesscience.onrender.com`

Endpoints disponibles :
- `GET /api/articles` - Récupérer tous les articles
- `GET /api/articles/:id` - Récupérer un article spécifique
- `POST /api/articles` - Créer un nouvel article
- `PUT /api/articles/:id` - Modifier un article
- `DELETE /api/articles/:id` - Supprimer un article
- `GET /api/users` - Récupérer tous les utilisateurs
- `PUT /api/users/:id` - Basculer le statut d'un utilisateur
- `GET /api/subscribers` - Récupérer tous les abonnés
- `POST /api/subscribers` - Ajouter un nouvel abonné
- `GET /api/export` - Exporter toutes les données
- `GET /api/health` - Vérification de santé du serveur

## Connexion avec votre frontend
Mettez à jour votre fichier `src/utils/storage.ts` pour utiliser l'API :

```typescript
const API_BASE_URL = 'https://serveracesscience.onrender.com';

export const getArticles = async (): Promise<Article[]> => {
  const response = await fetch(`${API_BASE_URL}/api/articles`);
  return response.json();
};
```

## Test local
Pour tester en local :
1. `npm install`
2. Copiez `.env.example` vers `.env` et configurez vos variables
3. `npm start`

Le serveur local sera sur `http://localhost:3001`