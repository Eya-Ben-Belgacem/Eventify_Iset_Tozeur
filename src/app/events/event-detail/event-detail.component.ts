// src/app/events/event-detail/event-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService, Event } from '../event.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule],
  template: `
    <mat-card *ngIf="event">
      <div *ngIf="event.imageUrl" class="detail-media">
        <img [src]="event.imageUrl" alt="{{ event.title }}" class="detail-image" />
      </div>
      <mat-card-title>{{event.title}}</mat-card-title>
      <mat-card-subtitle>{{event.date | date:'short'}}</mat-card-subtitle>
      <mat-card-content>
        <p>{{event.description}}</p>
      </mat-card-content>
      <button mat-raised-button color="primary" routerLink="/">Retour</button>
    </mat-card>
  `,
  styles: [`
    mat-card { max-width: 800px; margin: 20px auto; padding: 20px; }
    .detail-media { width: 100%; max-height: 420px; overflow:hidden; margin-bottom:12px; }
    .detail-image { width: 100%; height: auto; object-fit: cover; border-radius: 6px; }
  `]
})
export class EventDetailComponent implements OnInit {
  event?: Event;

  constructor(private eventService: EventService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.pipe(
      switchMap(params => this.eventService.getEvent(params['id']))
    ).subscribe(event => this.event = event);
  }
}
