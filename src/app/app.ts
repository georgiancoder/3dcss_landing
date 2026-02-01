import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header';
import { Hero } from './components/hero';
import { CommunitySlider } from './components/community-slider';
import { Tutorial } from './components/tutorial';
import { Features } from './components/features';
import { CommunityGrid } from './components/community-grid';
import { Cta } from './components/cta';
import { Footer } from './components/footer';
// initialize firebase (exports db) so it's ready for services/components
import './firebase';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    Header,
    Hero,
    CommunitySlider,
    Tutorial,
    Features,
    CommunityGrid,
    Cta,
    Footer
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('css3dLanding');
}
