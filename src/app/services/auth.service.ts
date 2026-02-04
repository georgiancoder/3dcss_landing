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
      if (user) {
        // Try to refresh token - fails if revoked server-side
        user.getIdToken(true)
          .then(() => {
            this.userSubject.next(user);
          })
          .catch(() => {
            // Token revoked server-side → auto sign out
            console.log("Session revoked server-side");
            auth.signOut();
          });
      }
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
        await fetch('https://css-3d.com/api/users-signin', {
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
    try {
      // Get current ID token before signing out
      const idToken = await auth.currentUser?.getIdToken(true);
      console.log(idToken, 'idToken');
      if (idToken) {
        // Revoke session server-side (optional but recommended)
        await fetch("/api/users-signout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }), // pass for revoke
          credentials: "include",
        });
      } else {
        // Just clear cookie if no Firebase user
        await fetch("/api/users-signout", {
          method: "POST",
          credentials: "include",
        });
      }

      // Clear local Firebase state
      await auth.signOut();

      window.location.href = "/";
    } catch (error) {
      console.error("Sign out failed:", error);
      await auth.signOut(); // Fallback
    }  }

  // helper to get current user synchronously
  get currentUser(): User | null {
    return this.userSubject.getValue();
  }
}
