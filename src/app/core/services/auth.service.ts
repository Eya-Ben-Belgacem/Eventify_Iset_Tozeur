// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'organisateur' | 'participant';
  profilePictureUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  public currentUser: any = null;
  public userRole: 'organisateur' | 'participant' | 'guest' = 'guest';

  private _role$ = new BehaviorSubject(this.userRole);
  public readonly role$ = this._role$.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {
    this.ensureInitialized();
  }

  /** 🔥 Charge le rôle utilisateur depuis Firestore */
  async loadUserRoleByUid(uid: string) {
    try {
      const ref = doc(this.firestore, 'users', uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data() as any;
        this.userRole = data.role;
      } else {
        this.userRole = 'participant';
      }

      this._role$.next(this.userRole);

    } catch (err) {
      console.warn('Unable to load role', err);
      this.userRole = 'participant';
      this._role$.next(this.userRole);
    }
  }

  /** 🔥 Écoute Firebase Auth */
  private initAuthListener() {
    onAuthStateChanged(this.auth, async (user) => {

      if (user) {
        this.currentUser = user;
        await this.loadUserRoleByUid(user.uid);

      } else {
        this.currentUser = null;
        this.userRole = 'guest';
        this._role$.next('guest');
      }

    });
  }

  private _initStarted = false;
  private ensureInitialized() {
    if (!this._initStarted) {
      this._initStarted = true;
      setTimeout(() => this.initAuthListener(), 0);
    }
  }

  /** 🔥 Register user */
  async register(payload: RegisterPayload) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        payload.email,
        payload.password
      );

      const uid = userCredential.user.uid;

      await setDoc(doc(this.firestore, 'users', uid), {
        uid,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        profilePictureUrl: payload.profilePictureUrl ?? '',
        createdAt: new Date()
      });

      this.userRole = payload.role;
      this._role$.next(this.userRole);

      return userCredential;
    } catch (error: any) {
      console.error('Erreur inscription:', error.code, error.message);
      throw this.getReadableError(error.code);
    }
  }

  /** 🔥 Login */
  async login(email: string, password: string) {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);

      const uid = credential.user?.uid;
      if (uid) await this.loadUserRoleByUid(uid);

      return credential;
    } catch (error: any) {
      console.error('Erreur connexion:', error.code, error.message);
      throw this.getReadableError(error.code);
    }
  }

  /** Traduit les codes d'erreur Firebase en messages lisibles */
  private getReadableError(errorCode: string): string {
    const errors: { [key: string]: string } = {
      'auth/invalid-credential': 'Email ou mot de passe incorrect',
      'auth/user-not-found': 'Cet email n\'existe pas',
      'auth/wrong-password': 'Mot de passe incorrect',
      'auth/email-already-in-use': 'Cet email est déjà utilisé',
      'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères',
      'auth/invalid-email': 'Adresse email invalide',
      'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
      'auth/operation-not-allowed': 'Cette opération n\'est pas autorisée'
    };
    return errors[errorCode] || `Erreur: ${errorCode}`;
  }

  /** 🔥 Logout */
  async logout() {
    await this.auth.signOut();
    this.currentUser = null;
    this.userRole = 'guest';
    this._role$.next('guest');
  }
}
