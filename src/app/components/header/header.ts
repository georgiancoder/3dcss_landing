import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { LogoutSyncService } from '../../services/logout-sync.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './header.html',
    styleUrl: './header.css'
})
export class Header implements OnInit {
    @Input() title = '';

    constructor(
        private firestore: FirestoreService,
        public auth: AuthService,
        private logoutSync: LogoutSyncService,
    ) { }

    async ngOnInit(): Promise<void> {
        if (!this.title) {
            const data = await this.firestore.getDoc('siteMeta', 'header');
            if (data && typeof data.title === 'string') {
                this.title = data.title;
            }
        }
    }

    async signIn(): Promise<void> {
        try {
            await this.auth.signInWithGithub();
        } catch (err) {
            console.error('GitHub sign-in failed', err);
        }
    }



    async signOut(): Promise<void> {
        try {
            await this.auth.signOut();
        } catch (err) {
            console.error('Sign-out failed', err);
        }
    }
}
