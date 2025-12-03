// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from '@angular/fire/auth';
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
  // current role: 'organisateur' | 'participant' | 'guest'
  public userRole: 'organisateur' | 'participant' | 'guest' = 'guest';

  // reactive role observable components can subscribe to
  private _role$ = new BehaviorSubject<'organisateur' | 'participant' | 'guest'>(this.userRole);
  public readonly role$ = this._role$.asObservable();

  async loadUserRoleByUid(uid: string) {
    try {
      const ref = doc(this.firestore, 'users', uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as any;
        this.userRole = (data.role === 'organisateur') ? 'organisateur' : 'participant';
        this._role$.next(this.userRole);
      } else {
        this.userRole = 'participant';
        this._role$.next(this.userRole);
      }
    } catch (err) {
      console.warn('Unable to load user role', err);
      this.userRole = 'participant';
      this._role$.next(this.userRole);
    }
  }
  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {
    // start auth listener as soon as service is constructed
    try { this.ensureInitialized(); } catch (e) { /* ignore */ }
  }

  // listen to Firebase auth state changes and update role accordingly
  ngOnInit?() {}

  private initAuthListener() {
    try {
      onAuthStateChanged(this.auth as any, async (user) => {
        if (user) {
          // user logged in, load role
          await this.loadUserRoleByUid(user.uid);
        } else {
          // no user
          this.userRole = 'guest';
          this._role$.next(this.userRole);
        }
      });
    } catch (err) {
      // fallback: ignore listener errors
      console.warn('Auth state listener could not be initialized', err);
    }
  }

  // ensure listener is initialized when service is first constructed
  // using setTimeout to avoid calling before DI fully ready in some envs
  private _initStarted = false;
  private ensureInitialized() {
    if (!this._initStarted) {
      this._initStarted = true;
      setTimeout(() => this.initAuthListener(), 0);
    }
  }

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

    // set current role immediately so guards/UI update without waiting
    this.userRole = (payload.role === 'organisateur') ? 'organisateur' : 'participant';
    this._role$.next(this.userRole);

    return userCredential;
  }

  async login(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(this.auth, email, password);
    try {
      const uid = credential.user?.uid;
      if (uid) await this.loadUserRoleByUid(uid);
    } catch (err) {
      console.warn('Failed to load role after login', err);
    }
    return credential;
  }

  async logout() {
    try {
      await (this.auth as any).signOut();
    } catch (err) {
      console.warn('Error during signOut', err);
    }
    this.userRole = 'guest';
    this._role$.next(this.userRole);
  }
}
