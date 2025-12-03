// src/app/events/event-create/event-create.component.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { EventService } from '../event.service';
import { GoogleApiService } from '../../core/services/google-api.service';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCardModule, MatProgressSpinnerModule, RouterModule],
  template: `
    <div *ngIf="isOrganisateur; else noAccess" class="create-wrapper container">
      <mat-card class="create-card">
        <div class="card-header">
          <h2>Créer un nouvel événement</h2>
          <p class="muted">Ajoutez les détails et une image pour rendre votre événement attractif.</p>
        </div>

        <form [formGroup]="eventForm" (ngSubmit)="onCreateEvent()" class="event-form">
          <div class="left">
            <div class="image-box card" [class.drag-over]="dragOver" (click)="openFileDialog()" (dragover)="onDragOver($event)" (dragleave)="onDragLeave()" (drop)="onDrop($event)">
              <ng-container *ngIf="imagePreview; else placeholder">
                <img [src]="imagePreview" alt="Prévisualisation" class="preview-image" />
                <button type="button" mat-icon-button color="warn" class="remove-btn" (click)="clearImage()"><mat-icon>close</mat-icon></button>
              </ng-container>
              <ng-template #placeholder>
                <label for="fileInput" class="file-label">
                  <mat-icon>cloud_upload</mat-icon>
                  <div>Glissez/déposez ou cliquez pour ajouter une image</div>
                </label>
              </ng-template>
              <input #fileInput id="fileInput" type="file" (change)="handleFile($event)" accept="image/*" hidden />
            </div>
          </div>

          <div class="right">
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Titre *</mat-label>
              <input matInput formControlName="title" required />
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="5"></textarea>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Date de l'événement *</mat-label>
              <input matInput type="datetime-local" formControlName="date" required />
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Lieu (optionnel)</mat-label>
              <input matInput formControlName="location" />
            </mat-form-field>

            <div class="form-actions">
              <button mat-stroked-button type="button" routerLink="/">Annuler</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="eventForm.invalid || loading" class="primary-btn">
                <mat-progress-spinner *ngIf="loading" diameter="20" mode="indeterminate"></mat-progress-spinner>
                <span>{{ loading ? 'Création...' : 'Créer l’événement' }}</span>
              </button>
            </div>

            <div *ngIf="successMessage" class="success-message card">
              <mat-icon>check_circle</mat-icon>
              {{ successMessage }}
            </div>
            <div *ngIf="errorMessage" class="error-message card">
              <mat-icon>error</mat-icon>
              {{ errorMessage }}
            </div>
          </div>
        </form>
      </mat-card>
    </div>

    <ng-template #noAccess>
      <div class="no-access card">
        <mat-icon>lock</mat-icon>
        <p>Vous n'avez pas la permission de créer un événement.</p>
        <button mat-raised-button color="primary" routerLink="/">Retourner à l'accueil</button>
      </div>
    </ng-template>
  `,
  styles: [
    `
    .create-wrapper {
      padding: 24px 12px;
    }

    .create-card {
      max-width: 1000px;
      margin: 24px auto;
      padding: 18px;
      border-radius: 12px;
    }

    .card-header h2 { margin: 0; }
    .card-header .muted { color: var(--text-secondary); margin-top: 6px; }

    .event-form { display: grid; grid-template-columns: 320px 1fr; gap: 20px; align-items: start; }

    .image-box { display:flex; align-items:center; justify-content:center; height: 320px; position: relative; border: 2px dashed rgba(0,0,0,0.06); border-radius:8px; transition: all .18s ease; overflow:hidden; }
    .image-box.drag-over { border-color: rgba(33,150,243,0.9); box-shadow: 0 6px 18px rgba(33,150,243,0.12); transform: translateY(-2px); }
    .image-box::after { content: ''; position:absolute; left:0; right:0; top:0; bottom:0; pointer-events:none; transition: background .18s ease; }
    .file-label { display:flex; flex-direction:column; align-items:center; gap:8px; color:var(--text-secondary); cursor:pointer; }
    .file-label mat-icon { font-size:42px; color:var(--primary); }
    .preview-image { width:100%; height:100%; object-fit:cover; border-radius:8px; }
    .remove-btn { position:absolute; top:8px; right:8px; background: rgba(0,0,0,0.5); color:white; }

    .right { display:flex; flex-direction:column; gap:12px; }
    .full-width { width: 100%; }

    .form-actions { display:flex; gap:12px; justify-content:flex-end; margin-top:6px; }
    .form-actions mat-progress-spinner { margin-right:8px; }
    .primary-btn { display:inline-flex; align-items:center; gap:8px; box-shadow: 0 6px 18px rgba(32,129,226,0.12); transition: transform .12s ease, box-shadow .12s ease; }
    .primary-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(32,129,226,0.16); }

    .success-message, .error-message { display:flex; gap:8px; align-items:center; padding:12px; border-radius:8px; }
    .success-message { background: rgba(76,175,80,0.08); color: #2e7d32; }
    .error-message { background: rgba(244,67,54,0.06); color: #c62828; }

    .no-access { text-align:center; padding:24px; border-radius:8px; }

    @media (max-width: 900px) {
      .event-form { grid-template-columns: 1fr; }
      .image-box { height: 240px; }
    }
    `
  ]
})
export class EventCreateComponent implements OnInit {
  eventForm: FormGroup;
  isOrganisateur = false;
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  loading = false;
  successMessage = '';
  errorMessage = '';
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  dragOver = false;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private authService: AuthService,
    private eventService: EventService,
    private googleApi: GoogleApiService,
    private router: Router
  ) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      date: ['', Validators.required],
      location: ['']
    });
  }

  ngOnInit() {
    this.isOrganisateur = this.authService.userRole === 'organisateur';
  }

  handleFile(event: any) {
    const file = event?.target?.files?.[0] ?? event?.dataTransfer?.files?.[0] ?? null;
    if (file) {
      this.processFile(file);
    }
  }

  processFile(file: File) {
    this.selectedImage = file;
    const reader = new FileReader();
    reader.onload = (e) => this.imagePreview = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  openFileDialog() {
    this.fileInput?.nativeElement?.click();
  }

  onDragOver(event: any) {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave() {
    this.dragOver = false;
  }

  onDrop(event: any) {
    event.preventDefault();
    this.dragOver = false;
    const file = event?.dataTransfer?.files?.[0] ?? null;
    if (file) this.processFile(file);
  }

  clearImage() {
    this.selectedImage = null;
    this.imagePreview = null;
  }

  async onCreateEvent() {
    if (!this.eventForm.valid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    if (!this.isOrganisateur) {
      this.errorMessage = 'Vous n\'avez pas la permission de créer un événement';
      return;
    }

    const currentUser = this.authService.currentUser;
    if (!currentUser?.uid) {
      this.errorMessage = 'Utilisateur non authentifié. Veuillez vous reconnecter.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      let imageUrl = '';

      if (this.selectedImage) {
        imageUrl = await this.supabaseService.uploadEventImage(this.selectedImage);
      }

      const rawLocation = this.eventForm.value.location?.toString().trim();
      let coords: { lat: number; lng: number } | null = null;

      if (rawLocation) {
        try {
          coords = await this.googleApi.geocodeAddress(rawLocation);
        } catch (geoErr) {
          console.error('Geocoding error:', geoErr);
        }
      }

      const eventData: any = {
        title: this.eventForm.value.title,
        description: this.eventForm.value.description || '',
        date: this.eventForm.value.date,
        imageUrl: imageUrl || null,
        organizerId: currentUser.uid,
        participants: []
      };

      // Only include location/coordinates if provided (Firestore rejects undefined)
      if (rawLocation) {
        eventData.location = rawLocation;
      }

      if (coords) {
        eventData.latitude = coords.lat;
        eventData.longitude = coords.lng;
      }

      await this.eventService.addEvent(eventData);

      this.successMessage = 'Événement créé avec succès! 🎉';
      this.eventForm.reset();
      this.clearImage();

      setTimeout(() => this.router.navigate(['/']), 2000);
    } catch (err: any) {
      console.error('Erreur création événement:', err);
      this.errorMessage = `Erreur: ${err?.message || 'Impossible de créer l\'événement'}`;
    } finally {
      this.loading = false;
    }
  }
}
