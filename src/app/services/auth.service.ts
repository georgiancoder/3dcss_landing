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

  private static readonly API_BASE = '/api';
  // private static readonly API_BASE = 'http://127.0.0.1:5001/css3d-2641c/us-central1/api';

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
      const idToken = await auth.currentUser?.getIdToken(true);
      if (idToken) {
        await fetch(`${AuthService.API_BASE}/users-signin`, {
          method: 'POST',
          // headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
          credentials: 'include',
        });
      }
    } catch (err) {
      console.error('Failed to send idToken to server', err);
    }
    return credential;
  }

  // Call this to set a "logout flag" server-side so other devices see it in RTDB and sign out
  async signOutEverywhere(): Promise<void> {
    const idToken = await auth.currentUser?.getIdToken(true);
    await fetch(`${AuthService.API_BASE}/users-setLogoutFlag`, {
      method: 'POST',
      // headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
      credentials: 'include',
    });
  }

  private startLogoutListener(uid: string) {
    // if already listening, stop first
    this.stopLogoutListener();

    const path = `logoutFlags/${uid}`;
    const nodeRef = ref(rtdb, path);
    const startedAt = Date.now();
    // onValue returns an unsubscribe function
    this.logoutUnsubscribe = onValue(nodeRef, (snapshot) => {
      const raw = snapshot.val();
      if (!raw) return;

      // normalize to milliseconds (handles seconds or ms)
      const logoutNum = Number(raw);
      const logoutMs = !isNaN(logoutNum)
        ? (logoutNum < 1e12 ? logoutNum * 1000 : logoutNum)
        : NaN;

      if (isNaN(logoutMs)) return;

      // only act on flags created after this listener started
      if (logoutMs > startedAt) {
        console.log('Logout flag detected:', logoutMs);
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
