import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
  template: `
    <header class="navbar">
      <div class="navbar-container">
        <!-- Logo/Brand -->
        <div class="navbar-brand">
          <a routerLink="/" class="logo">🎉 Eventify</a>
        </div>

        <!-- Hamburger Menu -->
        <button class="hamburger" (click)="toggleSidebar()" [class.active]="sidebarOpen">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <!-- Navigation Links -->
        <nav class="navbar-nav" [class.open]="sidebarOpen">
          <a routerLink="/" routerLinkActive="active" (click)="sidebarOpen = false">Accueil</a>
          <a *ngIf="isOrganisateur" routerLink="/create-event" routerLinkActive="active" (click)="sidebarOpen = false">Créer</a>
          <a *ngIf="!isAuthenticated" routerLink="/login" routerLinkActive="active" (click)="sidebarOpen = false">Connexion</a>
          <a *ngIf="!isAuthenticated" routerLink="/register" routerLinkActive="active" (click)="sidebarOpen = false">Inscription</a>
          <a *ngIf="isAuthenticated" (click)="onLogout()">Se déconnecter</a>
        </nav>

        <!-- Dark Mode Toggle -->
        <button class="theme-toggle" (click)="toggleTheme()" [title]="themeService.isDarkMode() ? 'Mode clair' : 'Mode sombre'">
          <span *ngIf="!themeService.isDarkMode()">🌙</span>
          <span *ngIf="themeService.isDarkMode()">☀️</span>
        </button>
      </div>

      <!-- Mobile Sidebar Overlay -->
      <div class="sidebar-overlay" *ngIf="sidebarOpen" (click)="sidebarOpen = false"></div>
    </header>
  `,
  styles: [`
    .navbar {
      background-color: var(--surface);
      box-shadow: var(--shadow-md);
      position: sticky;
      top: 0;
      z-index: 100;
      border-bottom: 1px solid var(--border);
    }

    .navbar-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md) var(--spacing-lg);
      max-width: 1200px;
      margin: 0 auto;
      gap: var(--spacing-md);
    }

    .navbar-brand {
      flex-shrink: 0;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary);
      text-decoration: none;
      transition: color var(--transition-fast);
    }

    .logo:hover {
      color: var(--primary-dark);
    }

    .navbar-nav {
      display: flex;
      gap: var(--spacing-lg);
      align-items: center;
      flex: 1;
      justify-content: center;
    }

    .navbar-nav a {
      font-weight: 500;
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--border-radius-md);
      transition: all var(--transition-fast);
      position: relative;
    }

    .navbar-nav a::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: var(--spacing-md);
      right: var(--spacing-md);
      height: 2px;
      background-color: var(--primary);
      transform: scaleX(0);
      transition: transform var(--transition-fast);
    }

    .navbar-nav a:hover::after,
    .navbar-nav a.active::after {
      transform: scaleX(1);
    }

    .hamburger {
      display: none;
      flex-direction: column;
      background: none;
      border: none;
      cursor: pointer;
      gap: 5px;
      padding: 0;
      box-shadow: none;
    }

    .hamburger span {
      width: 24px;
      height: 3px;
      background-color: var(--text-primary);
      border-radius: 2px;
      transition: all var(--transition-fast);
    }

    .hamburger.active span:nth-child(1) {
      transform: rotate(45deg) translateY(10px);
    }

    .hamburger.active span:nth-child(2) {
      opacity: 0;
    }

    .hamburger.active span:nth-child(3) {
      transform: rotate(-45deg) translateY(-10px);
    }

    .theme-toggle {
      background: none;
      border: 2px solid var(--border);
      border-radius: var(--border-radius-full);
      width: 40px;
      height: 40px;
      padding: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      transition: all var(--transition-fast);
      box-shadow: var(--shadow-sm);
    }

    .theme-toggle:hover {
      border-color: var(--primary);
      transform: scale(1.05);
    }

    .sidebar-overlay {
      position: fixed;
      top: 60px;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 99;
      animation: fadeIn var(--transition-fast);
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .hamburger {
        display: flex;
      }

      .navbar-nav {
        position: fixed;
        top: 60px;
        left: 0;
        width: 250px;
        flex-direction: column;
        background-color: var(--surface);
        border-right: 1px solid var(--border);
        padding: var(--spacing-lg);
        gap: var(--spacing-md);
        height: calc(100vh - 60px);
        justify-content: flex-start;
        transform: translateX(-100%);
        transition: transform var(--transition-slow);
        z-index: 100;
      }

      .navbar-nav.open {
        transform: translateX(0);
      }

      .navbar-nav a::after {
        bottom: 0;
      }

      .navbar-container {
        padding: var(--spacing-md);
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  sidebarOpen = false;
  // theme observable removed; use ThemeService methods directly
  isOrganisateur = false;
  isAuthenticated = false;
  private _roleSub?: Subscription;

  constructor(public themeService: ThemeService, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // subscribe to role changes to toggle links
    this._roleSub = this.authService.role$.subscribe(r => {
      this.isOrganisateur = (r === 'organisateur');
      this.isAuthenticated = (r !== 'guest');
    });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
  
  async onLogout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
    this.sidebarOpen = false;
  }

  ngOnDestroy() {
    this._roleSub?.unsubscribe();
  }
}
