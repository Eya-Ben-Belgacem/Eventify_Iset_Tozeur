import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  template: `
    <aside class="sidebar">
      <a routerLink="/dashboard">Dashboard</a>
      <a routerLink="/events">Mes événements</a>
      <a routerLink="/profile">Profil</a>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 200px;
      height: 100vh;
      background: #eeeeee;
      padding: 15px;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    a {
      text-decoration: none;
      font-size: 16px;
      color: #333;
    }
  `]
})
export class SidebarComponent {}
