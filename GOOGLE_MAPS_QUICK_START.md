# Configuration Rapide - Google Maps API

## 🎯 Objectif Rapide

Ajouter votre clé Google Maps API en 3 étapes :

### 1️⃣ Créer/Obtenir votre clé API

1. Allez sur https://console.cloud.google.com
2. Créez un nouveau projet (ou sélectionnez un existant)
3. Activez **Maps JavaScript API** :
   - Allez dans **APIs & Services → Bibliothèque**
   - Recherchez "Maps JavaScript API"
   - Cliquez **Activer**
4. Créez une clé API :
   - Allez dans **APIs & Services → Identifiants**
   - Cliquez **Créer Identifiants → Clé API**
   - Copiez votre clé

### 2️⃣ Ajouter la Clé au Fichier Environment

Modifiez `src/environments/environment.ts` :

```typescript
export const environment = {
  production: false,
  googleMapsApiKey: 'VOTRE_CLE_ICI', // Remplacez par votre clé
};
```

Modifiez aussi `src/environments/environment.prod.ts` si vous déployez en production :

```typescript
export const environment = {
  production: true,
  googleMapsApiKey: 'VOTRE_CLE_ICI', // Remplacez par votre clé (production)
};
```

### 3️⃣ C'est Tout ! 🎉

Le service Google Maps fonctionne maintenant.

## ✅ Vérifier que ça Marche

1. Lancez `npm start`
2. Allez sur http://localhost:4200
3. Créez un nouvel événement et remplissez :
   - Titre
   - Description
   - Date
   - **Lieu** (ex: "ISET Tozeur, Tunisia")
4. Créez l'événement
5. Allez voir le détail de l'événement
6. Vous devriez voir :
   - ✅ Une carte avec la localisation
   - ✅ Un bouton "Directions"
   - ✅ Un bouton "Ajouter au calendrier"

## 🔐 Sécuriser votre Clé (Production)

**Important :** Pour la production, restreignez votre clé API :

1. Dans **Identifiants**, cliquez sur votre clé
2. Sous **Restrictions d'application**, sélectionnez **HTTP referrer** (sites web)
3. Ajoutez votre domaine production (ex: `events.example.com`)
4. Sous **Restrictions aux API**, sélectionnez uniquement **Maps JavaScript API**
5. Cliquez **Enregistrer**

## 🐛 Dépannage

### "Google Maps API not loaded"
- Vérifiez que votre clé est correcte dans `environment.ts`
- Vérifiez que l'API est activée dans Google Cloud Console
- Vérifiez la console du navigateur (F12) pour les erreurs

### Carte ne s'affiche pas
- Vérifiez que vous avez entré un lieu lors de la création
- Vérifiez que l'élément HTML existe (id="event-map")
- Vérifiez la console du navigateur

### "This API project is not authorized"
- L'API Maps JavaScript API n'est pas activée
- Allez dans Google Cloud Console et activez-la

## 📚 Documentation Complète

Pour plus de détails, lisez `GOOGLE_MAPS_INTEGRATION.md`
