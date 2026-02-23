import { InjectionToken } from '@angular/core';
import type { app } from 'firebase-admin';

export const FIREBASE_ADMIN = new InjectionToken<app.App>('firebase-admin');
