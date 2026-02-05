import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  signInWithPopup,
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import { auth, githubProvider, rtdb } from '../firebase';
import { ref, onValue } from 'firebase/database';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public readonly user$: Observable<User | null> = this.userSubject.asObservable();

  // holds the unsubscribe function returned by onValue() for the current user's logout flag
  private logoutUnsubscribe: (() => void) | null = null;

  constructor() {
    // listen for auth state changes
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // force refresh token to detect revoked sessions
          await user.getIdToken(true);
          this.userSubject.next(user);
          this.startLogoutListener(user.uid);
        } catch {
          console.log("Session revoked server-side");
          await auth.signOut();
          this.userSubject.next(null);
          this.stopLogoutListener();
        }
      } else {
        this.userSubject.next(null);
        this.stopLogoutListener();
      }
    });
  }

  // Sign in with GitHub popup and notify backend with idToken
  async signInWithGithub(): Promise<UserCredential | null> {
    const credential = await signInWithPopup(auth, githubProvider);
    try {
      // get fresh idToken and send to server
      const idToken = await auth.currentUser?.getIdToken(true);
      if (idToken) {
        await fetch('/api/users-signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
          credentials: 'include',
        });
      }
    } catch (err) {
      // log but don't block client-side sign-in
      console.error('Failed to send idToken to server', err);
    }
    return credential;
  }

  // Sign out (local + notify server to clear session cookie)
  async signOut(): Promise<void> {
    try {
      // Get current ID token before signing out
      const idToken = await auth.currentUser?.getIdToken(true);
      if (idToken) {
        // ask server to revoke / clear session cookie
        await fetch('/api/users-signout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
          credentials: 'include',
        });
      } else {
        // fallback: clear cookie
        await fetch('/api/users-signout', {
          method: 'POST',
          credentials: 'include',
        });
      }
    } catch (error) {
      console.error('Sign out server notify failed:', error);
    } finally {
      // Always sign out locally
      await auth.signOut();
      this.userSubject.next(null);
      this.stopLogoutListener();
      // optional: redirect to home
      try { window.location.href = '/'; } catch {}
    }
  }

  // Call this to set a "logout flag" server-side so other devices see it in RTDB and sign out
  async signOutEverywhere(): Promise<void> {
    const idToken = await auth.currentUser?.getIdToken(true);
    await fetch('/api/users-setLogoutFlag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
      credentials: 'include',
    });
  }

  private startLogoutListener(uid: string) {
    // if already listening, stop first
    this.stopLogoutListener();

    const path = `logoutFlags/${uid}`;
    const nodeRef = ref(rtdb, path);
    // onValue returns an unsubscribe function
    this.logoutUnsubscribe = onValue(nodeRef, (snapshot) => {
      const logoutTime = snapshot.val();
      if (logoutTime) {
        console.log('Logout flag detected:', logoutTime);
        // force sign out locally
        auth.signOut().catch(err => console.error('RTDB-forced signOut failed', err));
        this.userSubject.next(null);
        this.stopLogoutListener();
      }
    });
  }

  private stopLogoutListener() {
    if (this.logoutUnsubscribe) {
      try {
        this.logoutUnsubscribe();
      } catch (err) {
        console.warn('Error unsubscribing logout listener', err);
      }
      this.logoutUnsubscribe = null;
    }
  }

  // helper to get current user synchronously
  get currentUser(): User | null {
    return this.userSubject.getValue();
  }
}
