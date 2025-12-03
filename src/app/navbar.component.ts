import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  template: `
    <nav class="nav">
      <div class="logo">Eventify</div>
      <ul>
        <li><a routerLink="/home">Accueil</a></li>
        <li><a routerLink="/events">Événements</a></li>
        <li><a routerLink="/login">Login</a></li>
      </ul>
    </nav>
  `,
  styles: [`
    .nav {
      display: flex;
      justify-content: space-between;
      background: #1565c0;
      color: white;
      padding: 12px 25px;
      align-items: center;
    }
    ul { display: flex; gap: 20px; }
    a { color: white; text-decoration: none; font-size: 16px; }
    a:hover { text-decoration: underline; }
  `]
})
export class NavbarComponent {}
