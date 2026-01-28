import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'header.html'
})
export class Header implements OnInit {
  @Input() title = '';

  constructor(
    private firestore: FirestoreService,
    public auth: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    // If no title passed in, try to load it from Firestore: collection "siteMeta", doc "header"
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
