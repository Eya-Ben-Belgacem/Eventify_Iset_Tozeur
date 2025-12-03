# ✅ Checklist - Configuration Finale

Suivez cette checklist pour configurer l'application complètement.

## 🎯 Google Maps Configuration (OBLIGATOIRE pour les cartes)

### Étape 1 : Google Cloud Console
- [ ] Accédez à https://console.cloud.google.com
- [ ] Créez un nouveau projet (ou sélectionnez un existant)
- [ ] Attendez 1-2 minutes pour l'initialisation du projet

### Étape 2 : Activer l'API Maps
- [ ] Dans le menu de gauche, allez à **APIs & Services → Bibliothèque**
- [ ] Recherchez "Maps JavaScript API"
- [ ] Cliquez dessus et appuyez sur **Activer**
- [ ] Attendez 1-2 minutes pour l'activation

### Étape 3 : Créer une Clé API
- [ ] Allez dans **APIs & Services → Identifiants**
- [ ] Cliquez sur **Créer Identifiants → Clé API**
- [ ] Une pop-up affichera votre clé
- [ ] Cliquez sur l'icône copier pour copier la clé
- [ ] Gardez cette clé (vous en aurez besoin dans les prochaines étapes)

### Étape 4 : Restreindre la Clé API (Recommandé)
- [ ] Dans la liste des identifiants, trouvez votre clé API
- [ ] Cliquez dessus pour l'ouvrir
- [ ] Sous **Restrictions d'application**:
  - [ ] Sélectionnez **Applications HTTP (sites web)**
  - [ ] Cliquez **Ajouter un élément HTTP referrer**
  - [ ] Entrez `localhost` (pour le développement)
  - [ ] Entrez votre domaine production (ex: `events.example.com`)
- [ ] Sous **Restrictions aux API**:
  - [ ] Sélectionnez **Maps JavaScript API**
- [ ] Cliquez **Enregistrer**

### Étape 5 : Ajouter la Clé à l'Application
- [ ] Ouvrez `src/environments/environment.ts`
- [ ] Modifiez la ligne:
  ```typescript
  googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY'
  ```
  Par:
  ```typescript
  googleMapsApiKey: 'VOTRE_CLE_API_ICI'
  ```
- [ ] Ouvrez `src/environments/environment.prod.ts`
- [ ] Répétez la même modification
- [ ] Sauvegardez les fichiers

### Étape 6 : Redémarrer l'Application
- [ ] Arrêtez le serveur de développement (Ctrl+C)
- [ ] Exécutez `npm start` à nouveau
- [ ] Attendez que le serveur soit prêt
- [ ] Ouvrez http://localhost:4200

## 🧪 Test des Fonctionnalités

### Test 1 : Créer un Événement
- [ ] Connectez-vous en tant qu'organisateur
- [ ] Cliquez sur "Créer un événement"
- [ ] Remplissez le formulaire:
  - [ ] Titre: "Mon Événement Test"
  - [ ] Description: "Ceci est un test"
  - [ ] Date: Demain
  - [ ] **Lieu: "ISET Tozeur, Tunisia"** (Important pour le test de carte!)
- [ ] Téléchargez une image
- [ ] Cliquez "Créer l'événement"

### Test 2 : Voir la Carte
- [ ] Allez voir le détail de l'événement créé
- [ ] Cherchez la section **"Localisation"**
- [ ] [ ] Vérifiez que la carte Google Maps s'affiche
- [ ] [ ] Vérifiez que le marqueur est au bon endroit

### Test 3 : Boutons Localisation
- [ ] Cliquez sur le bouton **"Directions"**
  - [ ] Google Maps doit s'ouvrir dans un nouvel onglet
  - [ ] La localisation doit être trouvée
- [ ] Retournez à l'onglet Eventify
- [ ] Cliquez sur **"Ajouter au calendrier"**
  - [ ] Google Calendar doit s'ouvrir dans un nouvel onglet
  - [ ] L'événement doit être pré-rempli

### Test 4 : Autres Fonctionnalités
- [ ] Inscrivez-vous à l'événement
- [ ] Vérifiez que vous apparaissez dans la liste de participants
- [ ] Désinscrivez-vous
- [ ] Vérifiez que vous avez disparu de la liste

## 📱 Tests Responsifs

### Desktop (>1024px)
- [ ] La carte s'affiche en 400px de hauteur
- [ ] Les boutons sont côte à côte
- [ ] Le layout est bien aligné

### Tablette (768px - 1024px)
- [ ] La carte s'affiche en 400px
- [ ] Les boutons passent en colonne sur petit écran
- [ ] Tout est lisible et accessible

### Mobile (<768px)
- [ ] La carte s'affiche en 300px de hauteur
- [ ] Les boutons sont en colonne (largeur 100%)
- [ ] Le texte est lisible
- [ ] Les images se redimensionnent correctement

## 🔐 Production Checklist

Si vous déployez en production:

### Avant le Déploiement
- [ ] Changez votre clé API dans `environment.prod.ts`
- [ ] Assurez-vous que la clé est restreinte à votre domaine
- [ ] Vérifiez que l'URL Supabase est correcte
- [ ] Vérifiez que les clés Firebase sont correctes
- [ ] Exécutez `npm run build` pour tester le build
- [ ] Vérifiez que le build n'a pas d'erreurs

### Après le Déploiement
- [ ] Testez tous les formulaires
- [ ] Testez l'upload d'images
- [ ] Testez les cartes Google Maps
- [ ] Testez Google Calendar
- [ ] Vérifiez les permissions d'accès
- [ ] Testez sur mobile/tablet

## 🐛 Dépannage Rapide

### La carte ne s'affiche pas
- [ ] Vérifiez que vous avez entré une adresse dans le champ "Lieu"
- [ ] Vérifiez que votre clé API est correcte
- [ ] Vérifiez dans la console du navigateur (F12) pour les erreurs
- [ ] Activez Maps JavaScript API dans Google Cloud Console

### "Google Maps API not loaded"
- [ ] Vérifiez que `googleMapsApiKey` n'est pas "YOUR_GOOGLE_MAPS_API_KEY"
- [ ] Attendez 1-2 minutes après l'activation de l'API
- [ ] Redémarrez le serveur de développement

### Les boutons Directions/Calendrier ne fonctionnent pas
- [ ] Vérifiez que vous avez un lieu d'entrée
- [ ] Vérifiez que les navigateurs pop-ups ne sont pas bloqués
- [ ] Essayez dans un navigateur différent

## 📞 Support

Si vous avez des problèmes:

1. **Lisez d'abord:**
   - `GOOGLE_MAPS_QUICK_START.md`
   - `GOOGLE_MAPS_INTEGRATION.md`
   - `PROJECT_STATUS.md`

2. **Vérifiez:**
   - Console du navigateur (F12 → Console)
   - Logs de Google Cloud Console
   - Statut Supabase

3. **Testez:**
   - Créez un événement simple sans carte
   - Créez un événement avec une adresse connue

## ✨ Félicitations!

Une fois que vous avez coché toutes les cases, votre application Eventify est:
- ✅ Complètement configurée
- ✅ Testée et fonctionnelle
- ✅ Prête pour l'utilisation
- ✅ Prête pour la production (optionnel)

Amusez-vous à utiliser Eventify! 🎉

---

**Last Updated:** December 2024
**Status:** ✅ Ready for Use
