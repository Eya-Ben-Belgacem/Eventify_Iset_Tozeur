# Google APIs Integration Guide

## Overview
Ce guide explique comment intégrer **Google Maps API** et **Google Calendar API** de manière sécurisée.

## 🔑 Obtenir les Clés API

### Étape 1 : Créer un projet Google Cloud
1. Allez sur https://console.cloud.google.com
2. Cliquez sur **"Select a Project"** → **"NEW PROJECT"**
3. Nom : `eventify-iset-tozeur`
4. Cliquez **"Create"**

### Étape 2 : Activer les APIs
1. Dans la barre de recherche, cherchez **"Maps JavaScript API"**
2. Cliquez sur le résultat → **"Enable"**
3. Répétez pour **"Calendar API"** → **"Enable"**

### Étape 3 : Créer une clé API
1. Allez dans **"Credentials"** (menu gauche)
2. Cliquez **"+ Create Credentials"** → **"API Key"**
3. Une clé API sera créée (ex: `AIzaSy...`)
4. **Copiez-la** et sauvegardez-la

### Étape 4 : Restreindre la clé API (IMPORTANT pour la sécurité)
1. Cliquez sur la clé API créée
2. Sous **"Application restrictions"**, sélectionnez **"HTTP referrers (web sites)"**
3. Ajoutez vos domaines :
   - `http://localhost:*`
   - `https://yourdomain.com`
4. Sous **"API restrictions"**, sélectionnez **"Restrict key"**
5. Cochez uniquement :
   - ✅ Maps JavaScript API
   - ✅ Calendar API
6. Cliquez **"Save"**

---

## 🗺️ Configuration Google Maps

### 1. Ajouter la clé API au service
Ouvrez `src/app/core/services/google-api.service.ts` et remplacez :
```typescript
private readonly MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';
```
Par votre clé API réelle.

### 2. Utiliser la carte dans EventDetailComponent
Ajoutez au template HTML :
```html
<div id="map-container" style="width: 100%; height: 400px;"></div>
```

Ajoutez au TypeScript :
```typescript
import { GoogleApiService } from '../../core/services/google-api.service';

export class EventDetailComponent implements OnInit {
  constructor(
    private googleApi: GoogleApiService,
    // ...
  ) {}

  ngAfterViewInit() {
    if (this.event?.location) {
      this.googleApi.displayMap(
        'map-container',
        28.9755,  // latitude example
        77.6245,  // longitude example
        this.event.title
      );
    }
  }
}
```

---

## 📅 Configuration Google Calendar

### 1. Ajouter le bouton "Ajouter au calendrier"
Dans `event-detail.component.html`, ajoutez :
```html
<button mat-raised-button (click)="addToGoogleCalendar()">
  <mat-icon>calendar_today</mat-icon>
  <span>Ajouter au calendrier Google</span>
</button>
```

### 2. Implémenter la méthode dans TypeScript
```typescript
addToGoogleCalendar() {
  if (!this.event) return;
  
  const calendarUrl = this.googleApi.getGoogleCalendarUrl({
    title: this.event.title,
    description: this.event.description,
    date: this.event.date,
    location: this.event.location || ''
  });
  
  window.open(calendarUrl, '_blank');
}
```

---

## 🌍 Exemple complet : Ajouter location à Event Model

### 1. Mettre à jour l'interface Event
```typescript
export interface Event {
  id?: string;
  title: string;
  description: string;
  date: any;
  location?: string;  // ← Ajouter ceci
  latitude?: number;  // ← Ajouter ceci
  longitude?: number; // ← Ajouter ceci
  imageUrl?: string | null;
  organizerId?: string;
  participants?: string[];
}
```

### 2. Ajouter un champ location au formulaire EventCreate
```html
<mat-form-field appearance="fill" class="full-width">
  <mat-label>Lieu</mat-label>
  <input matInput formControlName="location" />
</mat-form-field>
```

### 3. Mettre à jour EventCreateComponent
```typescript
this.eventForm = this.fb.group({
  title: ['', Validators.required],
  description: [''],
  date: ['', Validators.required],
  location: ['']  // ← Ajouter ceci
});
```

---

## 🔒 Bonnes Pratiques de Sécurité

1. ✅ **Restreindre les domaines** : Utilisez les restrictions HTTP referrer
2. ✅ **Limiter les APIs** : Activez uniquement les APIs utilisées
3. ✅ **Utiliser des variables d'environnement** (optionnel en prod)
4. ❌ **Ne pas exposer la clé** : Ne la commitez pas en public
5. ✅ **Monitorer l'usage** : Vérifiez les quotas dans GCP Console

---

## 🧪 Tester

### Test Google Maps
1. Allez sur un événement avec une adresse
2. Vous devriez voir une carte affichée
3. Cliquez sur le marqueur

### Test Google Calendar
1. Cliquez sur "Ajouter au calendrier"
2. Vous serez redirigé vers Google Calendar
3. L'événement sera pré-rempli

---

## ⚠️ Dépannage

**Erreur "Maps API not loaded"**
- Vérifiez que la clé API est correcte
- Vérifiez que le domaine est autorisé dans GCP Console

**Erreur "Calendar API disabled"**
- Allez dans GCP Console → APIs & Services → Habilitez "Calendar API"

**Erreur "CORS"**
- Vérifiez les restrictions de domaine pour la clé API

---

## 📚 Documentation
- [Google Maps API Docs](https://developers.google.com/maps/documentation/javascript)
- [Google Calendar API Docs](https://developers.google.com/calendar/api)
- [GCP Console](https://console.cloud.google.com)
