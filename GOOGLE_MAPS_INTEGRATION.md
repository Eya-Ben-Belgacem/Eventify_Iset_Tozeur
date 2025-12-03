# Intégration de Google Maps et Google Calendar

## ✅ État Actuel

GoogleApiService a été implémenté et intégré dans EventDetailComponent :
- ✅ Carte Google Maps affichée dans la page de détail
- ✅ Bouton "Ajouter au calendrier" pour Google Calendar
- ✅ Bouton "Directions" pour ouvrir Google Maps
- ✅ Support du géocodage (adresse → coordonnées)

## 🔑 Configuration Requise

### Étape 1 : Obtenir une Clé API Google

1. Accédez à [Google Cloud Console](https://console.cloud.google.com)
2. Créez un nouveau projet (ou sélectionnez un existant)
3. Dans **APIs & Services → Bibliothèque**, recherchez et activez:
   - **Maps JavaScript API**
   - **Geocoding API** (optionnel, pour le géocodage)
4. Créez une clé API:
   - Allez dans **APIs & Services → Identifiants**
   - Cliquez sur **Créer Identifiants → Clé API**
   - Copiez la clé API généré

### Étape 2 : Restreindre la Clé API (Recommandé)

1. Dans **Identifiants**, cliquez sur votre clé API
2. Sous **Restrictions d'application**:
   - Sélectionnez **Applications HTTP** (sites web)
   - Ajoutez vos domaines:
     - `localhost` (développement)
     - Votre domaine production (ex: `events.example.com`)
3. Sous **Restrictions aux API**:
   - Sélectionnez **Maps JavaScript API**
   - Sélectionnez **Geocoding API** (si utilisation)
4. Cliquez **Enregistrer**

### Étape 3 : Ajouter la Clé au Service

Modifiez `src/app/core/services/google-api.service.ts` :

```typescript
private readonly MAPS_API_KEY = 'VOTRE_CLE_API_ICI';
```

Remplacez `'VOTRE_CLE_API_ICI'` par votre clé API réelle.

## 📍 Comment Utiliser

### 1. Afficher une Carte

La carte s'affiche automatiquement si l'événement a des coordonnées (latitude/longitude).

Cela se déclenche dans `EventDetailComponent.ngAfterViewInit()` :

```typescript
ngAfterViewInit() {
  if (this.event && this.event.latitude && this.event.longitude && this.mapContainer) {
    this.googleApiService.displayMap(
      this.mapContainer.nativeElement.id,
      this.event.latitude,
      this.event.longitude,
      this.event.title
    );
  }
}
```

### 2. Ajouter une Adresse à un Événement

Modifiez un événement et entrez l'adresse dans le champ **Lieu** du formulaire de création.

Le modèle Event inclut maintenant:
```typescript
interface Event {
  location?: string;      // Adresse sous forme de texte
  latitude?: number;      // Coordonnées pour la carte
  longitude?: number;     // Coordonnées pour la carte
}
```

### 3. Bouton Calendrier

Un bouton **"Ajouter au calendrier"** s'affiche pour les participants et organistes.

Cliquez le bouton ouvre Google Calendar avec l'événement pré-rempli:
- Titre de l'événement
- Date et heure
- Lien de description

```typescript
addToGoogleCalendar() {
  if (!this.event) return;
  const calendarUrl = this.googleApiService.getGoogleCalendarUrl(this.event);
  window.open(calendarUrl, '_blank');
}
```

### 4. Bouton Directions

Un bouton **"Directions"** s'affiche sous la carte (si localisation existe).

Cliquez ouvre Google Maps avec l'adresse:

```typescript
openGoogleMapsDirections() {
  if (!this.event?.location) return;
  const mapsUrl = this.googleApiService.getGoogleMapsUrl(this.event.location, 15);
  window.open(mapsUrl, '_blank');
}
```

## 🗺️ Méthodes Disponibles dans GoogleApiService

### displayMap(elementId, latitude, longitude, title)
Affiche une carte Google Maps avec un marqueur.

**Paramètres:**
- `elementId` (string): ID du conteneur HTML
- `latitude` (number): Latitude du lieu
- `longitude` (number): Longitude du lieu
- `title` (string): Titre du marqueur

**Exemple:**
```typescript
this.googleApiService.displayMap('event-map', 33.886917, 8.753590, 'ISET Tozeur');
```

### getGoogleCalendarUrl(event)
Génère une URL pour ajouter un événement à Google Calendar.

**Retourne:** URL String
**Utilisation:** `window.open(url, '_blank')`

### getGoogleMapsUrl(address, zoom)
Génère un lien direct vers Google Maps.

**Paramètres:**
- `address` (string): Adresse à chercher
- `zoom` (number): Niveau de zoom (1-21)

**Retourne:** URL String

### getGoogleMapsDirectionsUrl(origin, destination)
Génère un lien de directions Google Maps.

**Paramètres:**
- `origin` (string): Adresse de départ
- `destination` (string): Adresse d'arrivée

**Retourne:** URL String

### geocodeAddress(address)
Convertit une adresse textuelle en coordonnées (latitude/longitude).

**Paramètres:**
- `address` (string): Adresse à géocoder

**Retourne:** `Promise<{ latitude: number, longitude: number }>`

**Exemple d'utilisation:**
```typescript
const coords = await this.googleApiService.geocodeAddress('ISET Tozeur, Tunisia');
// { latitude: 33.886917, longitude: 8.753590 }
```

## 📋 Model Event Mis à Jour

```typescript
export interface Event {
  id?: string;
  title: string;
  description: string;
  date: any;
  location?: string;        // Nouveau: Adresse textuelle
  latitude?: number;        // Nouveau: Pour la carte
  longitude?: number;       // Nouveau: Pour la carte
  imageUrl?: string | null;
  organizerId?: string;
  participants?: string[];
}
```

## 🎨 UI Updates

### EventDetailComponent

**Template:** `event-detail.component.html`
- ✅ Section métadonnée affiche le **location** si présent
- ✅ Carte Google Maps affiche si **latitude/longitude** présents
- ✅ Bouton "Directions" sous la carte
- ✅ Bouton "Ajouter au calendrier" pour tous les utilisateurs

**Styles:** `event-detail.component.css`
- ✅ `.map-container` - conteneur pour la carte (400px hauteur)
- ✅ `.map-actions` - conteneur pour les boutons sous la carte
- ✅ `.button-group` - groupe de boutons (responsive)
- ✅ `.calendar-btn` - style du bouton calendrier
- ✅ Responsive: carte réduite à 300px sur mobile

### EventCreateComponent

**Template:** Ajout du champ **Lieu (optionnel)**
- Utilisateurs peuvent entrer une adresse lors de la création
- Le champ est optionnel (pas de validation requise)

## 🔍 Prochaines Étapes (Optionnelles)

### Amélioration 1: Géocodage Automatique
Convertir l'adresse en coordonnées lors de la création:

```typescript
async onCreateEvent() {
  // ... validation ...
  
  if (this.eventForm.value.location) {
    const coords = await this.googleApiService.geocodeAddress(
      this.eventForm.value.location
    );
    eventData.latitude = coords.latitude;
    eventData.longitude = coords.longitude;
  }
  
  // ... sauvegarde ...
}
```

### Amélioration 2: Édition d'Événement
Créer `EventEditComponent` pour modifier:
- Titre, description, date
- Lieu, latitude, longitude
- Image d'événement

### Amélioration 3: Recherche de Lieu
Intégrer **Google Places Autocomplete** dans le formulaire de création:

```typescript
// Dans event-create.component.ts
private placesService = new google.maps.places.PlacesService(map);

// Dans le template
<input matInput 
       #locationInput
       (keyup)="autocompleteLocation($event)"
       formControlName="location" />
```

## 🐛 Dépannage

### "Google Maps API not loaded"
- Vérifiez que la clé API est correcte dans `google-api.service.ts`
- Vérifiez que l'API est activée dans Google Cloud Console
- Vérifiez les restrictions de domaine (localhost doit être autorisé)

### Carte ne s'affiche pas
- Vérifiez que `latitude` et `longitude` sont présents sur l'événement
- Vérifiez que l'élément HTML avec l'ID `event-map` existe
- Vérifiez la console du navigateur pour les erreurs

### "This API project is not authorized"
- L'API n'est pas activée dans Google Cloud Console
- Attendez quelques minutes après l'activation

### Clé API fonctionnant en dev mais pas en production
- Les restrictions de domaine ne correspondent pas
- Assurez-vous que votre domaine production est ajouté aux restrictions

## 📚 Ressources

- [Google Maps Platform - Docs](https://developers.google.com/maps/documentation)
- [Google Calendar - Embedding & API](https://developers.google.com/calendar)
- [Google Cloud Console](https://console.cloud.google.com)
