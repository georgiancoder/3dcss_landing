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

  // Sign in with GitHub popup
  async signInWithGithub(): Promise<UserCredential> {
    return signInWithPopup(auth, githubProvider);
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
