# 🎉 Eventify - Application de Gestion d'Événements

Welcome to **Eventify** - Une application moderne pour créer et gérer des événements avec système d'inscription de participants.

## 🚀 Démarrage Rapide

### 1️⃣ Installation

```bash
# Installer les dépendances
npm install
```

### 2️⃣ Configuration

#### Firebase (Firestore + Authentication)
Les clés sont déjà configurées dans `src/app/app.config.ts`

#### Supabase (Image Storage)
Les buckets sont déjà configurés: `event-images` et `profiles`

#### Google Maps & Calendar (NOUVEAU!)
1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Créer un nouveau projet et activer **Maps JavaScript API**
3. Créer une clé API
4. Ajouter votre clé dans `src/environments/environment.ts`:
   ```typescript
   googleMapsApiKey: 'YOUR_API_KEY_HERE'
   ```

### 3️⃣ Lancer l'Application

```bash
# Démarrer le serveur de développement
npm start

# L'app ouvrira sur http://localhost:4200
```

## 📱 Fonctionnalités Principales

### 👤 Authentication
- ✅ Inscription avec email/password
- ✅ Connexion/Déconnexion sécurisée
- ✅ Gestion des rôles (Organisateur/Participant)

### 📅 Événements
- ✅ Créer, afficher, modifier, supprimer des événements
- ✅ Upload d'images (drag & drop)
- ✅ Organiser les événements

### 👥 Participants
- ✅ S'inscrire/se désinscrire aux événements
- ✅ Voir la liste des participants

### 🗺️ Localisation & Maps
- ✅ Ajouter un lieu pour chaque événement
- ✅ Voir la carte Google Maps
- ✅ Bouton "Directions" → Google Maps
- ✅ Bouton "Ajouter au calendrier" → Google Calendar

## 🔧 Commandes Utiles

```bash
# Démarrer le dev server
npm start

# Build pour production
npm run build

# Exécuter les tests
npm test
```

## 📚 Documentation

- **[GOOGLE_MAPS_QUICK_START.md](./GOOGLE_MAPS_QUICK_START.md)** - Configuration Google Maps
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - État du projet
- **[SESSION_SUMMARY.md](./SESSION_SUMMARY.md)** - Dernières modifications

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
