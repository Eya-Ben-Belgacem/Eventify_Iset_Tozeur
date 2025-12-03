# Firestore Security Rules - Setup Guide

## Problème
L'erreur **"Missing or insufficient permissions"** lors de l'inscription comme participant signifie que les règles Firestore refusent de modifier le document `events/{eventId}`.

## Solution
Mettre à jour les règles Firestore dans Firebase Console pour permettre aux utilisateurs authentifiés de :
1. ✅ Lire les événements
2. ✅ Créer des événements (organizers)
3. ✅ Modifier le champ `participants` (tous)
4. ✅ Supprimer les événements (organizers)

## Étapes d'Application

### Étape 1 : Allez dans Firebase Console
1. Ouvrez https://console.firebase.google.com
2. Sélectionnez votre projet `eventify-iset-tozeur`
3. Allez dans **Firestore Database** (menu gauche)

### Étape 2 : Ouvrez les Rules
1. Cliquez sur l'onglet **Rules** (à côté de "Data")
2. Vous verrez un éditeur de texte avec les règles actuelles

### Étape 3 : Remplacez les Règles
1. Sélectionnez TOUT le contenu existant (Ctrl+A)
2. Supprimez-le
3. Ouvrez le fichier `firestore.rules` (dans votre projet)
4. Copiez tout le contenu (Ctrl+A, Ctrl+C)
5. Collez dans l'éditeur Firebase (Ctrl+V)

### Étape 4 : Publiez les Règles
1. Cliquez sur le bouton **"Publish"** (en haut à droite)
2. Confirmez si une popup apparaît
3. Attendez quelques secondes - ✅ "Rules updated successfully"

## Résultat
Après la publication, les utilisateurs pourront :
- ✅ S'inscrire aux événements
- ✅ Se désinscrire
- ✅ Créer des événements (organisateurs)
- ✅ Modifier leurs événements
- ✅ Supprimer leurs événements

## Testez
1. Rafraîchissez le navigateur
2. Allez sur un événement
3. Cliquez "S'inscrire" → devrait fonctionner maintenant ✅

## Si ça ne marche pas
- Vérifiez que vous avez **publié** les règles (pas juste édité)
- Attendez 30 secondes pour la propagation
- Vérifiez que vous êtes **authentifié** (connecté)
- Vérifiez les logs Firestore pour les erreurs détaillées

## Structure des Règles
```
users/{userId}         → Chaque user peut lire/écrire son propre doc
events/{eventId}       → Tous les utilisateurs authentifiés peuvent lire
                       → Organisateurs peuvent modifier/supprimer
                       → Tous les utilisateurs authentifiés peuvent modifier participants[]
```
