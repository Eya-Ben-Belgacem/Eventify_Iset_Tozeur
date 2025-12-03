# Configuration Supabase RLS pour Storage

## Problème Résolu
L'erreur **"new row violates row-level security policy"** survient quand Supabase refuse les uploads à cause des règles RLS trop restrictives.

## Solution Implémentée
Le code a été modifié pour :
1. **Récupérer le token Firebase d'authentification** dans `SupabaseService`
2. **Passer le token lors des uploads** vers Supabase Storage
3. **Créer des règles RLS permissives** qui acceptent les uploads authentifiés

## Steps pour Configurer Supabase RLS

### Option 1 : Désactiver RLS (Rapide - Non Recommandé pour la Production)
1. Allez sur **https://app.supabase.com** → Votre projet
2. Allez dans **Storage** → Sélectionnez le bucket `event-images`
3. Cliquez sur **"Policies"** → **Désactiver RLS**
4. Répétez pour le bucket `profiles`

### Option 2 : Ajouter les Règles RLS (Recommandé)
1. Allez sur **https://app.supabase.com** → Votre projet
2. Allez dans **SQL Editor**
3. Copiez le contenu du fichier `supabase-rls-policies.sql`
4. Collez dans l'éditeur SQL et exécutez

## Code Modifié

### SupabaseService (uploadEventImage, uploadProfileImage)
- Récupère le token Firebase : `getIdToken(user)`
- Passe le token comme `Authorization: Bearer <token>`
- Attend que l'upload soit authentifié

### RegisterComponent
- Utilise maintenant `supabaseService.uploadProfileImage()` pour les photos de profil
- Plus de `import('../../environments/supabase')`

### EventCreateComponent
- Utilise déjà `supabaseService.uploadEventImage()` pour les images d'événement

## Test
1. Rafraîchissez le navigateur
2. Inscrivez-vous avec une photo de profil
3. Créez un événement avec une image
4. Les uploads devraient fonctionner sans erreur RLS ✅

## Dépannage

### Si l'erreur persiste :
1. **Vérifiez que vous êtes authentifié** → Vous devez être connecté avant de créer un événement
2. **Vérifiez les buckets Supabase** → `event-images` et `profiles` doivent exister
3. **Vérifiez la console navigateur** (F12) pour les messages d'erreur détaillés
4. **Contactez le support Supabase** si les règles RLS ne s'appliquent pas

## Fichiers Modifiés
- `src/app/core/services/supabase.service.ts` ✅
- `src/app/pages/register/register.component.ts` ✅
- `supabase-rls-policies.sql` (nouveau) ✅
