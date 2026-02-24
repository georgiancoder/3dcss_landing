import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
// import { initializeApp, getApps, cert } from 'firebase-admin/app';
// import {FIREBASE_ADMIN} from './server/admin-token';
//
//
// const adminApp = getApps().length > 0
//   ? getApps()[0]
//   : initializeApp({
//     credential: cert({
//       projectId: process.env["FIREBASE_PROJECT_ID"],
//       clientEmail: process.env["FIREBASE_CLIENT_EMAIL"],
//       privateKey: process.env["FIREBASE_PRIVATE_KEY"]?.replace(/\\n/g, "\n"),
//     }),
//     projectId: 'css3d-2641c'
//   });

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // { provide: FIREBASE_ADMIN, useValue: adminApp }
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
