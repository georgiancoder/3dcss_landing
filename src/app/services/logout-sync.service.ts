import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { auth } from '../firebase';

/**
 * Keeps Firebase sign-out in sync across tabs/apps.
 * - BroadcastChannel for same-origin tabs
 * - window.postMessage as a best-effort fallback
 * - Calls /api/users-signout to clear the shared session cookie
 */
@Injectable({ providedIn: 'root' })
export class LogoutSyncService {
  private readonly channelName = 'firebase-logout-css3d';
  private channel?: BroadcastChannel;

  constructor(
    private readonly http: HttpClient,
    private readonly ngZone: NgZone
  ) {
  }

  /**
   * Initiate logout in this app and notify other tabs/apps.
   */
  async signOutBothApps(): Promise<void> {
    // 1) Notify other tabs/apps first

    // 2) Clear shared session cookie (server)
    // Try to include idToken if available (matches existing backend expectations).
    const idToken = await auth.currentUser?.getIdToken(true);

    if (idToken) {
      await firstValueFrom(
        this.http.post(
          '/api/users-signout',
          { idToken },
          {
            withCredentials: true,
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
          }
        )
      );
    } else {
      await firstValueFrom(this.http.post('/api/users-signout', {}, { withCredentials: true }));
    }

    // 3) Clear local Firebase auth
    await auth.signOut();

    // 4) Hard reset the UI
    window.location.href = '/';
  }

  private broadcastLogout(): void {
    if ('BroadcastChannel' in window) {
      const ch = new BroadcastChannel(this.channelName);
      ch.postMessage('LOGOUT');
      ch.close();
    }

    // Fallback/best-effort. The receiver will decide whether to trust it.
    window.postMessage({ type: 'LOGOUT_FIREBASE' }, '*');
  }
}
