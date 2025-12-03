# 👨‍💻 Developer Guide - Continuing Development

Bienvenue en tant que développeur sur le projet Eventify! Ce guide vous aidera à comprendre comment continuer le développement.

## 🎯 Before You Start

### 1. Understanding the Project
Read these first (in order):
1. [README.md](./README.md) - 5 minutes
2. [PROJECT_STATUS.md](./PROJECT_STATUS.md) - 15 minutes
3. [PROJECT_MAP.md](./PROJECT_MAP.md) - 10 minutes
4. [CHANGELOG.md](./CHANGELOG.md) - 10 minutes

Total: ~40 minutes to understand the project

### 2. Setting Up Your Environment
```bash
# Clone the repository
git clone <your-repo>
cd eventify-iset-tozeur

# Install dependencies
npm install

# Configure Google Maps API
# Edit src/environments/environment.ts
# Add your Google Maps API key

# Start development server
npm start

# Open http://localhost:4200
```

### 3. Understanding the Architecture

**Key Concepts:**
- **Angular 19:** Standalone components, no modules
- **RxJS:** Observables for reactive data flows
- **Firebase:** Authentication + Firestore database
- **Supabase:** Image storage (public buckets)
- **Google APIs:** Maps and Calendar

**Data Flow:**
```
Components → Services → Firestore/Supabase/Google APIs → Components (Observable)
```

## 📚 Project Structure Deep Dive

### Core Services

#### AuthService (`src/app/core/services/auth.service.ts`)
Manages Firebase Authentication and user roles.

**Key Methods:**
- `register(email, password, role)` - Create new user
- `login(email, password)` - Sign in user
- `logout()` - Sign out user
- `currentUser` - Get current user object
- `role$` - Observable of current user role

**Usage:**
```typescript
constructor(private authService: AuthService) {}

ngOnInit() {
  // Subscribe to role changes
  this.authService.role$.subscribe(role => {
    console.log('User role:', role);
  });
  
  // Check current user
  if (this.authService.currentUser?.uid) {
    console.log('User ID:', this.authService.currentUser.uid);
  }
}
```

#### EventService (`src/app/events/event.service.ts`)
Manages Firestore events CRUD and participant management.

**Key Methods:**
- `addEvent(event)` - Create new event
- `getEvents()` - Get all events (Observable)
- `getEvent(id)` - Get single event
- `updateEvent(id, data)` - Update event
- `deleteEvent(id)` - Delete event
- `registerToEvent(eventId, userId)` - Add participant
- `unregisterFromEvent(eventId, userId)` - Remove participant

**Usage:**
```typescript
constructor(private eventService: EventService) {}

// Get all events (real-time)
this.eventService.getEvents().subscribe(events => {
  this.events = events;
});

// Get single event
this.eventService.getEvent(eventId).subscribe(event => {
  this.event = event;
});

// Register to event
await this.eventService.registerToEvent(eventId, userId);
```

#### GoogleApiService (`src/app/core/services/google-api.service.ts`)
Handles Google Maps and Calendar APIs.

**Key Methods:**
- `displayMap(elementId, lat, lng, title)` - Show map
- `getGoogleCalendarUrl(event)` - Calendar link
- `getGoogleMapsUrl(address, zoom)` - Maps link
- `geocodeAddress(address)` - Address to coordinates
- `getGoogleMapsDirectionsUrl(origin, dest)` - Directions link

**Usage:**
```typescript
constructor(private googleApiService: GoogleApiService) {}

// Display map
this.googleApiService.displayMap('map-container', 33.88, 8.75, 'Event Title');

// Open calendar
const url = this.googleApiService.getGoogleCalendarUrl(this.event);
window.open(url, '_blank');
```

#### SupabaseService (`src/app/core/services/supabase.service.ts`)
Handles image uploads to Supabase Storage.

**Key Methods:**
- `uploadEventImage(file)` - Upload event image
- `uploadProfileImage(file)` - Upload profile image

**Usage:**
```typescript
constructor(private supabaseService: SupabaseService) {}

// Upload image
const imageUrl = await this.supabaseService.uploadEventImage(file);
// Returns: https://supabase-url/storage/v1/object/public/event-images/...
```

## 🛠️ Common Development Tasks

### Adding a New Component

```bash
# 1. Create component file
mkdir -p src/app/events/event-edit
touch src/app/events/event-edit/event-edit.component.ts
touch src/app/events/event-edit/event-edit.component.html
touch src/app/events/event-edit/event-edit.component.css
```

```typescript
// event-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-event-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './event-edit.component.html',
  styleUrls: ['./event-edit.component.css']
})
export class EventEditComponent implements OnInit {
  eventForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.eventForm = this.fb.group({
      title: [''],
      description: ['']
    });
  }

  ngOnInit() {
    // Component initialization
  }
}
```

### 2. Add routing to `app.routes.ts`
```typescript
const routes: Routes = [
  // ... existing routes ...
  {
    path: 'edit-event/:id',
    component: EventEditComponent
  }
];
```

### Adding New Database Fields

1. **Update Event Model** (`event.service.ts`)
```typescript
export interface Event {
  // ... existing fields ...
  newField?: string;  // Add new field
}
```

2. **Update Forms** (in components)
```typescript
this.eventForm.addControl('newField', new FormControl(''));
```

3. **Update HTML Templates** (in components)
```html
<mat-form-field appearance="fill">
  <mat-label>New Field</mat-label>
  <input matInput formControlName="newField" />
</mat-form-field>
```

4. **Update Firestore Rules** (if needed)
See `firestore.rules` file

### Adding Google Maps Feature

1. **Import GoogleApiService**
```typescript
constructor(private googleApiService: GoogleApiService) {}
```

2. **Add map container to template**
```html
<div id="my-map" style="width: 100%; height: 400px;"></div>
```

3. **Display map after view init**
```typescript
ngAfterViewInit() {
  this.googleApiService.displayMap('my-map', latitude, longitude, 'Title');
}
```

## 🐛 Debugging Tips

### Enable Firebase Logging
```typescript
// In app.config.ts or main.ts
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// For development only:
if (!environment.production) {
  connectAuthEmulator(auth, 'http://localhost:9099');
}
```

### Check Component Values
```typescript
// Add to component for debugging
ngOnInit() {
  this.eventService.getEvents().subscribe(events => {
    console.log('Events from Firestore:', events);
  });
}
```

### Browser DevTools
- F12 - Open DevTools
- Console tab - See logs and errors
- Network tab - See API calls
- Application tab - See localStorage/cookies
- Elements tab - Inspect HTML

## 📋 Testing Checklist Before Committing

- [ ] Run `npm run build` - no errors
- [ ] Run `npm start` - server starts
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test on mobile (F12 → Device Mode)
- [ ] Check console for errors (F12)
- [ ] Test new features manually
- [ ] Update documentation if needed

## 🚀 Common Next Features

### Feature: Auto-Geocoding
```typescript
// In event-create.component.ts
async onCreateEvent() {
  if (this.eventForm.value.location) {
    const coords = await this.googleApiService.geocodeAddress(
      this.eventForm.value.location
    );
    if (coords) {
      eventData.latitude = coords.lat;
      eventData.longitude = coords.lng;
    }
  }
  // ... rest of creation
}
```

### Feature: Event Search
```typescript
// event.service.ts - Add method
searchEvents(query: string): Observable<Event[]> {
  return this.firestore.collection('events', ref =>
    ref.where('title', '>=', query)
      .where('title', '<=', query + '\uf8ff')
  ).valueChanges() as Observable<Event[]>;
}

// In component
this.eventService.searchEvents(searchQuery).subscribe(results => {
  this.events = results;
});
```

### Feature: Event Comments
```typescript
// firestore.rules - Add collection
match /events/{eventId}/comments/{commentId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null;
}

// event.service.ts - Add methods
addComment(eventId: string, comment: { text: string; uid: string }) {
  return this.firestore
    .collection(`events/${eventId}/comments`)
    .add(comment);
}

getComments(eventId: string): Observable<any[]> {
  return this.firestore
    .collection(`events/${eventId}/comments`)
    .valueChanges();
}
```

## 📖 Code Conventions

### Naming
- **Components:** kebab-case files, PascalCase classes
  - `event-detail.component.ts` → `EventDetailComponent`
- **Services:** lowercase files, PascalCase classes
  - `auth.service.ts` → `AuthService`
- **Variables:** camelCase
  - `eventTitle`, `participantCount`, `isLoading`
- **Constants:** UPPER_SNAKE_CASE
  - `MAX_PARTICIPANTS = 100`

### File Organization
```
feature/
├── component-name.component.ts       (logic)
├── component-name.component.html     (template)
├── component-name.component.css      (styles)
└── component-name.component.spec.ts  (tests)
```

### TypeScript Best Practices
- ✅ Use `const` and `let` (never `var`)
- ✅ Use interfaces for data models
- ✅ Use `!` for null assertions only when necessary
- ✅ Use arrow functions in callbacks
- ✅ Use async/await instead of .then()
- ✅ Add JSDoc comments to public methods

## 🔐 Security Checklist

Before deploying any code:

- [ ] No API keys in code (use environment.ts)
- [ ] No console.log statements for sensitive data
- [ ] Firestore rules are restrictive
- [ ] API keys have domain restrictions
- [ ] No hardcoded usernames/passwords
- [ ] Error messages don't leak sensitive info
- [ ] HTTPS enabled in production
- [ ] CORS configured properly

## 📊 Performance Tips

### Optimize Bundle Size
```bash
# Analyze bundle
ng build --stats-json
npm install -g webpack-bundle-analyzer
webpack-bundle-analyzer dist/eventify-iset-tozeur/stats.json
```

### Lazy Load Routes
```typescript
const routes: Routes = [
  {
    path: 'events',
    loadComponent: () => import('./events/events.component').then(m => m.EventsComponent)
  }
];
```

### Unsubscribe from Observables
```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.eventService.getEvents()
    .pipe(takeUntil(this.destroy$))
    .subscribe(events => this.events = events);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

## 🤝 Git Workflow

### Creating a Feature
```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes
# ... edit files ...

# 3. Commit changes
git add .
git commit -m "feat: Add my feature

- Detailed description
- What was added
- Why it was added
"

# 4. Push to GitHub
git push origin feature/my-feature

# 5. Create Pull Request
# Go to GitHub and create PR
```

### Commit Message Format
```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style
- `refactor:` Code refactoring
- `perf:` Performance improvement
- `test:` Test addition

**Example:**
```
feat: Add event search functionality

- Implement search filter in home component
- Add search method to EventService
- Update Firestore query
- Add tests for search

Closes #123
```

## 📞 Getting Help

### Documentation
1. [README.md](./README.md) - Quick overview
2. [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Full details
3. [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) - All docs

### Code Examples
- Look at existing components for patterns
- Check services for API usage
- Review tests for usage examples

### Online Resources
- [Angular Docs](https://angular.io/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [RxJS Docs](https://rxjs.dev)
- [Material Design](https://material.angular.io)

## ✨ Ready to Code?

You're all set! Start by:

1. Reading the documentation
2. Understanding the architecture
3. Creating a feature branch
4. Making your changes
5. Testing thoroughly
6. Creating a pull request

Happy coding! 🚀

---

**Need Help?** Check [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)

**Version:** 1.1.0
**Last Updated:** December 2024
