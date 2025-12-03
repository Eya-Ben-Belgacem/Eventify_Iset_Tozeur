// src/app/events/home/home.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { EventService } from '../event.service';
import { AiRecommendationService, SimpleEvent } from '../../core/services/ai-recommendation.service';
import { AiChatComponent } from '../../core/components/ai-chat/ai-chat.component';
import { Subscription } from 'rxjs';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  imageUrl?: string;
  participants?: any[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, AiChatComponent],
  template: `
    <div class="events-container">
      <h2 class="page-title">Événements à venir</h2>

      <div class="events-toolbar">
        <button *ngIf="isOrganisateur" mat-raised-button color="primary" routerLink="/create-event" class="add-btn">
          <mat-icon>add</mat-icon>
          <span>Créer un événement</span>
        </button>
      </div>

      <div class="recommendations" *ngIf="recommended && recommended.length">
        <h3>Recommandations pour vous</h3>
        <div class="recommend-list">
          <mat-card *ngFor="let r of recommended" class="rec-card">
            <div class="rec-body">
              <h4>{{ r.title }}</h4>
              <p>{{ r.description }}</p>
              <div class="rec-actions">
                <button mat-button color="primary" [routerLink]="['/event', r.id]">Voir</button>
              </div>
            </div>
          </mat-card>
        </div>
      </div>

      <div class="cards-grid">
        <mat-card class="card" *ngFor="let event of events">
          <div class="card-media" *ngIf="event.imageUrl">
            <img class="event-image" [src]="event.imageUrl" alt="{{ event.title }}" />
          </div>
          <div class="card-body">
            <h3 class="event-title">{{ event.title }}</h3>
            <div class="event-meta">{{ event.date | date:'fullDate' }}</div>
            <p class="event-desc">{{ event.description }}</p>
            <div class="card-actions">
              <button mat-button color="primary" [routerLink]="['/event', event.id]">Voir</button>
              <button mat-icon-button color="accent" [routerLink]="['/event', event.id]" title="Voir">
                <mat-icon>visibility</mat-icon>
              </button>
              <ng-container *ngIf="isOrganisateur">
                <button mat-icon-button color="primary" [routerLink]="['/edit-event', event.id]" title="Modifier">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteEvent(event.id)" title="Supprimer">
                  <mat-icon>delete</mat-icon>
                </button>
              </ng-container>
            </div>
          </div>
        </mat-card>
      </div>

      <div class="bottom-section">
        <div class="bottom-left">
          <h3>Explorez plus</h3>
          <p>Continuez votre découverte des événements intéressants.</p>
        </div>
        <app-ai-chat [events]="events"></app-ai-chat>
      </div>
    </div>
  `,
  styles: [
    `
      .events-container { padding: 20px; display: flex; flex-direction: column; gap: 24px; max-width:1400px; margin: 0 auto; }
      .page-title { margin: 0 0 12px 0; font-size: 2rem; color: var(--text-primary); font-weight: 700; }
      .events-toolbar { display:flex; justify-content:flex-end; }
      .add-btn { display: flex; gap: 8px; align-items: center; }
      .cards-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
      .card { padding: 12px; display:flex; flex-direction:column; border-radius:8px; box-shadow: 0 6px 18px rgba(0,0,0,0.06); }
      .card-media { width: 100%; max-height: 220px; overflow: hidden; display:block; border-radius:6px; }
      .event-image { width: 100%; height: 160px; object-fit: cover; display:block; border-radius:6px; }
      .card-body { padding: 12px 6px; display:flex; flex-direction:column; gap:8px; flex:1; }
      .event-title { margin: 0 0 6px 0; font-size: 1.05rem; color: var(--text-primary); font-weight: 700; }
      .event-meta { color: var(--text-secondary); font-size: 0.85rem; }
      .event-desc { color: var(--text-primary); margin: 0; line-height: 1.4; white-space: nowrap; overflow:hidden; text-overflow: ellipsis; }
      .card-actions { display:flex; gap: 8px; margin-top:auto; align-items:center; justify-content:flex-end; }
      .bottom-section { display:grid; grid-template-columns: 1fr 360px; gap: 24px; align-items:start; margin-top: 20px; }
      .bottom-left { padding: 12px; }
      .bottom-left h3 { margin-top:0; color: var(--text-primary); }
      .bottom-left p { color: var(--text-secondary); }
      .recommendations { margin: 20px 0; }
      .recommend-list { display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
      .rec-card { padding: 12px; border-radius:6px; }
      .rec-body { display:flex; flex-direction:column; gap: 8px; }
      .rec-actions { display:flex; gap:8px; }
      @media (max-width: 900px) {
        .bottom-section { grid-template-columns: 1fr; }
        .page-title { font-size: 1.5rem; }
        app-ai-chat { max-width: 100%; }
      }
    `
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  events: Event[] = [];
  isOrganisateur = false;
  private _sub?: Subscription;
  recommended: SimpleEvent[] = [];

  constructor(
    private eventService: EventService,
    private router: Router,
    private authService: AuthService
    ,
    private aiRecommendationService: AiRecommendationService
  ) {}

  async ngOnInit() {
    // Ensure auth listener is running
    try { (this.authService as any).ensureInitialized?.(); } catch (e) { /* ignore */ }

    this.isOrganisateur = this.authService.userRole === 'organisateur';
    this._sub = this.authService.role$.subscribe(r => {
      this.isOrganisateur = (r === 'organisateur');
    });

    // Récupère les événements depuis Firestore
    this.eventService.getEvents().subscribe((evts) => {
      this.events = evts as Event[];
      // Charger recommandations (non bloquant)
      this.loadRecommendations();
    });
  }

  private async loadRecommendations() {
    try {
      const userId = (this.authService.currentUser && this.authService.currentUser.uid) ? this.authService.currentUser.uid : null;
      const items: SimpleEvent[] = this.events.map(e => ({ id: (e as any).id, title: e.title, description: e.description, date: e.date, participants: (e as any).participants }));
      this.recommended = await this.aiRecommendationService.recommendForUser(userId, items, 4);
    } catch (err) {
      console.warn('Recommendations load failed', err);
    }
  }

  deleteEvent(id?: string) {
    if (!id) return;
    if (confirm('Voulez-vous vraiment supprimer cet événement ?')) {
      this.eventService.deleteEvent(id); // <-- Firestore delete
      // Mettre à jour la liste après suppression
      this.events = this.events.filter(e => e.id !== id);
    }
  }

  ngOnDestroy() {
    this._sub?.unsubscribe();
  }
}
