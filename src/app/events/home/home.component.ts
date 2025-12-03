// src/app/events/home/home.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService, Event } from '../event.service';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service'; // service auth
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="events-container">
      <div class="events-toolbar">
        <button *ngIf="isOrganisateur" mat-raised-button color="primary" routerLink="/create-event">
          Ajouter un événement
        </button>
      </div>

      <div class="event-card" *ngFor="let event of events">
        <mat-card class="card">
          <div class="card-body">
            <h3 class="event-title">{{ event.title }}</h3>
            <div class="event-meta">{{ event.date | date:'fullDate' }}</div>
            <p class="event-desc">{{ event.description }}</p>
          </div>

          <mat-card-actions class="card-actions">
            <button mat-icon-button color="accent" [routerLink]="['/event', event.id]" title="Voir">
              <mat-icon>visibility</mat-icon>
            </button>

            <!-- boutons éditer et supprimer uniquement pour organisateur -->
            <ng-container *ngIf="isOrganisateur">
              <button mat-icon-button color="primary" [routerLink]="['/edit-event', event.id]" title="Modifier">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteEvent(event.id)" title="Supprimer">
                <mat-icon>delete</mat-icon>
              </button>
            </ng-container>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .events-container { padding: 20px; display: flex; flex-direction: column; gap: 20px; }
      .events-toolbar { display:flex; justify-content:flex-end; max-width: 960px; margin: 0 auto 8px; }
      .event-card { width: 100%; max-width: 960px; margin: auto; }
      .card { display:flex; flex-direction:column; padding: 12px; }
      .card-body { padding: 8px 4px; }
      .event-title { margin: 0 0 6px 0; font-size: 1.15rem; color: var(--text-primary); font-weight: 700; }
      .event-meta { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 8px; }
      .event-desc { color: var(--text-primary); margin: 0; line-height: 1.4; white-space: pre-wrap; }
      .card-actions { display:flex; gap: 8px; justify-content: flex-end; padding-top: 8px; }
    `
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  events: Event[] = [];
  isOrganisateur = false;
  private _sub?: Subscription;

  constructor(private eventService: EventService, private router: Router, private authService: AuthService) {}

  ngOnInit() {
    // Ensure auth listener is running (in case service wasn't initialized earlier)
    try { (this.authService as any).ensureInitialized?.(); } catch (e) { /* ignore */ }

    // Vérifie le rôle initial puis s'abonne aux changements de rôle
    this.isOrganisateur = this.authService.userRole === 'organisateur';
    this._sub = this.authService.role$.subscribe(r => {
      this.isOrganisateur = (r === 'organisateur');
    });

    // Récupère la liste des événements
    this.eventService.getEvents().subscribe(events => this.events = events);
  }

  ngOnDestroy() {
    this._sub?.unsubscribe();
  }

  deleteEvent(id?: string) {
    if (!id) return;
    if (confirm('Voulez-vous vraiment supprimer cet événement ?')) {
      this.eventService.deleteEvent(id);
    }
  }
}
