// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// Firebase + AngularFire imports
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // Firebase initialisation
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: "AIzaSyCJS-IcZYIBt3MaQc_SxxhQXLnApathFPU",
        authDomain: "eventify-iset-tozeur.firebaseapp.com",
        projectId: "eventify-iset-tozeur",
        storageBucket: "eventify-iset-tozeur.firebasestorage.app",
        messagingSenderId: "741497211694",
        appId: "1:741497211694:web:d5915f5516b6e856c408bf"
      })
    ),

    // Firebase Services
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage())
  ]
};
