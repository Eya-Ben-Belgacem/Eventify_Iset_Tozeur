import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="forbidden-container">
      <div class="forbidden-card">
        <h1>403</h1>
        <h2>Accès refusé</h2>
        <p>Vous n'avez pas les autorisations nécessaires pour accéder à cette page.</p>
        <a routerLink="/">Retour à l'accueil</a>
      </div>
    </div>
  `,
  styles: [
    `
      .forbidden-container { display:flex; align-items:center; justify-content:center; min-height:70vh; }
      .forbidden-card { text-align:center; background:var(--surface); padding:32px; border-radius:8px; box-shadow:var(--shadow-md); }
      .forbidden-card h1 { font-size:72px; margin:0; color:var(--primary); }
      .forbidden-card h2 { margin:8px 0 16px; }
      .forbidden-card a { color:var(--primary); font-weight:600; }
    `
  ]
})
export class ForbiddenComponent {}
