import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { switchMap } from 'rxjs/operators';
import { firstValueFrom, Subscription } from 'rxjs';

import { EventService, Event } from '../event.service';
import { AuthService } from '../../core/services/auth.service';
import { GoogleApiService } from '../../core/services/google-api.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit, OnDestroy, AfterViewInit {

  event?: Event | null = null;
  currentUserId = '';
  isOrganizer = false;
  isRegistered = false;
  participantCount = 0;
  loading = false;
  errorMessage = '';
  hasLocation = false;

  @ViewChild('mapContainer') mapContainer?: ElementRef;

  private _subs = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private authService: AuthService,
    private googleApiService: GoogleApiService
  ) {}

  ngOnInit() {
    // initial current user id (may be empty for guests)
    this.currentUserId = this.authService.currentUser?.uid || '';

    // React to role changes so UI updates when user logs in/out or role changes
    const roleSub = this.authService.role$.subscribe(role => {
      this.isOrganizer = (role === 'organisateur');
      this.currentUserId = this.authService.currentUser?.uid || '';
      this.updateStatus();
    });
    this._subs.add(roleSub);

    // Load event and react to route param changes
    const eventSub = this.route.params.pipe(
      switchMap(params => this.eventService.getEvent(params['id']))
    ).subscribe({
      next: (evt) => {
        this.event = evt as Event;
        this.updateStatus();
      },
      error: (err) => {
        console.error('Erreur chargement événement:', err);
        this.errorMessage = 'Impossible de charger l\'événement.';
      }
    });
    this._subs.add(eventSub);
  }

  ngAfterViewInit() {
    // Display map after view is rendered (if we have location data)
    if (this.event && this.event.latitude && this.event.longitude && this.mapContainer) {
      this.googleApiService.displayMap(
        this.mapContainer.nativeElement.id,
        this.event.latitude,
        this.event.longitude,
        this.event.title
      );
    }
  }

  updateStatus() {
    if (!this.event) return;
    this.participantCount = this.event.participants?.length ?? 0;
    this.isRegistered = this.event.participants ? this.event.participants.includes(this.currentUserId) : false;
    // organizer detection: prefer organizerId stored on event
    this.isOrganizer = this.event.organizerId === this.currentUserId || this.isOrganizer;
    // Check if we have location data
    this.hasLocation = !!(this.event.latitude && this.event.longitude);
  }

  addToGoogleCalendar() {
    if (!this.event) return;
    const calendarUrl = this.googleApiService.getGoogleCalendarUrl(this.event);
    window.open(calendarUrl, '_blank');
  }

  openGoogleMapsDirections() {
    if (!this.event?.location) return;
    const mapsUrl = this.googleApiService.getGoogleMapsUrl(this.event.location, 15);
    window.open(mapsUrl, '_blank');
  }

  async toggleRegistration() {
    if (!this.event?.id) return;
    
    // Ensure we have the current user
    if (!this.currentUserId) {
      // Try to get currentUser from AuthService one more time
      this.currentUserId = this.authService.currentUser?.uid || '';
    }

    if (!this.currentUserId) {
      this.errorMessage = 'Veuillez vous connecter pour vous inscrire.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      if (this.isRegistered) {
        await this.eventService.unregisterFromEvent(this.event.id, this.currentUserId);
      } else {
        await this.eventService.registerToEvent(this.event.id, this.currentUserId);
      }

      // refresh event from firestore
      const updated = await firstValueFrom(this.eventService.getEvent(this.event.id));
      this.event = updated as Event;
      this.updateStatus();
      
      // Success message
      this.errorMessage = '';
      console.log('✅ Inscription mise à jour avec succès');
    } catch (err: any) {
      console.error('Erreur inscription/désinscription:', err);
      this.errorMessage = err?.message || 'Erreur lors de la mise à jour.';
    } finally {
      this.loading = false;
    }
  }

  async confirmDelete() {
    if (!this.event?.id) return;
    if (!this.isOrganizer) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.')) {
      try {
        await this.eventService.deleteEvent(this.event.id);
        this.router.navigate(['/']);
      } catch (err: any) {
        console.error('Erreur suppression événement:', err);
        this.errorMessage = err?.message || 'Impossible de supprimer l\'événement.';
      }
    }
  }

  ngOnDestroy() {
    this._subs.unsubscribe();
  }
}

