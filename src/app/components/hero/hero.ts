import {Component, makeStateKey, PLATFORM_ID, TransferState, inject, signal, Inject, Optional, PendingTasks } from '@angular/core';
import {isPlatformServer} from '@angular/common';
import {FIREBASE_ADMIN} from '../../server/admin-token';
import firebase from 'firebase/compat/app';
import app = firebase.app;
import { getFirestore } from 'firebase-admin/firestore';

const POSTS_KEY = makeStateKey<any[]>('posts');

@Component({
    selector: 'app-hero',
    standalone: true,
    imports: [],
    templateUrl: './hero.html',
    styleUrl: './hero.css',
})
export class Hero {
  // private platformId = inject(PLATFORM_ID);
  // private transferState = inject(TransferState);
  // private pendingTasks = inject(PendingTasks);
  //
  // posts = signal<any[]>(this.transferState.get(POSTS_KEY, []));
  //
  // constructor(@Optional() @Inject(FIREBASE_ADMIN) private adminApp: app.App) {
  //   if (!isPlatformServer(this.platformId) || this.posts().length) return;
  //   const done = this.pendingTasks.add()
  //   this.fetchData()
  //     .finally(() => done());
  // }
  //
  //   private async fetchData() {
  //     // 1. Check if we are running on the NodeJS Server AND Admin is provided
  //     if (!this.adminApp) return;
  //     const db = getFirestore(this.adminApp);
  //     const snap = await db.collection('posts').limit(10).get();
  //     const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  //
  //     this.posts.set(data);
  //     this.transferState.set(POSTS_KEY, data);
  // }
}
