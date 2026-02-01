import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import { auth, githubProvider } from '../firebase';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public readonly user$: Observable<User | null> = this.userSubject.asObservable();

  constructor() {
    // listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      this.userSubject.next(user ?? null);
    });
  }

  // Sign in with GitHub popup and notify backend with idToken
  async signInWithGithub(): Promise<UserCredential | null> {
    const credential = await signInWithPopup(auth, githubProvider);
    try {
      // get fresh idToken and send to server
      const idToken = await auth.currentUser?.getIdToken(true);
      if (idToken) {
        await fetch('https://api-twypgdks3a-uc.a.run.app/users-signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });
      }
    } catch (err) {
      // log but don't block client-side sign-in
      console.error('Failed to send idToken to server', err);
    }
    return credential;
  }

  // Sign out
  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  // helper to get current user synchronously
  get currentUser(): User | null {
    return this.userSubject.getValue();
  }
}
