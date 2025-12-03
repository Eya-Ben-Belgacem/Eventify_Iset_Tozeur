// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'organisateur' | 'participant';
  profilePictureUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {}

  async register(payload: RegisterPayload) {
    // 1) Crée le compte utilisateur Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      this.auth,
      payload.email,
      payload.password
    );

    const uid = userCredential.user.uid;

    // 2) Ajoute les infos dans Firestore
    await setDoc(doc(this.firestore, 'users', uid), {
      uid,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      profilePictureUrl: payload.profilePictureUrl || '',
      createdAt: new Date()
    });

    return userCredential;
  }

  async login(email: string, password: string) {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }
}
