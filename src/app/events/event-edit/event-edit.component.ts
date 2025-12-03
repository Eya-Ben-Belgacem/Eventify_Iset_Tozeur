// src/app/events/event-edit/event-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EventService, Event } from '../event.service';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-event-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, RouterModule],
  template: `
    <div *ngIf="isOrganisateur; else noAccess" class="edit-container">
      <h2>Modifier l'événement</h2>
      
      <form [formGroup]="eventForm" (ngSubmit)="onSubmit()" class="event-form">
        <!-- Prévisualisation d'image -->
        <div class="image-preview-section" *ngIf="imagePreview || event?.imageUrl">
          <div class="preview-container">
            <img [src]="imagePreview || event?.imageUrl" alt="Prévisualisation" class="preview-image" />
            <button type="button" mat-icon-button color="warn" (click)="clearImage()" class="remove-btn" title="Supprimer l'image">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <p class="file-info" *ngIf="selectedImage">✓ {{ selectedImage.name }} ({{ (selectedImage.size || 0) / 1024 | number:'1.0-0' }} KB)</p>
        </div>

        <!-- Input fichier pour changer l'image -->
        <div class="file-input-wrapper" *ngIf="!imagePreview && !event?.imageUrl">
          <label for="fileInput" class="file-label">
            <mat-icon>image</mat-icon>
            <span>Ajouter une image (optionnel)</span>
          </label>
          <input 
            id="fileInput"
            type="file" 
            #imageInput 
            (change)="handleFile($event)" 
            accept="image/*" 
            hidden
          />
        </div>

        <div class="file-input-wrapper" *ngIf="!imagePreview && event?.imageUrl">
          <label for="fileInput" class="file-label">
            <mat-icon>image</mat-icon>
            <span>Changer l'image</span>
          </label>
          <input 
            id="fileInput"
            type="file" 
            #imageInput 
            (change)="handleFile($event)" 
            accept="image/*" 
            hidden
          />
        </div>

        <!-- Champs du formulaire -->
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Titre *</mat-label>
          <input matInput formControlName="title" required>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="4"></textarea>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Date de l'événement *</mat-label>
          <input matInput type="datetime-local" formControlName="date" required>
        </mat-form-field>

        <!-- Boutons d'action -->
        <div class="form-actions">
          <button mat-stroked-button type="button" routerLink="/">
            Annuler
          </button>
          <button 
            mat-raised-button 
            color="primary" 
            type="submit" 
            [disabled]="eventForm.invalid || loading"
            class="submit-btn"
          >
            <mat-icon *ngIf="!loading">save</mat-icon>
            <span>{{ loading ? 'Modification en cours...' : 'Enregistrer' }}</span>
          </button>
        </div>

        <!-- Messages -->
        <div *ngIf="successMessage" class="success-message">
          <mat-icon>check_circle</mat-icon>
          {{ successMessage }}
        </div>
        <div *ngIf="errorMessage" class="error-message">
          <mat-icon>error</mat-icon>
          {{ errorMessage }}
        </div>
      </form>
    </div>

    <ng-template #noAccess>
      <div class="no-access">
        <mat-icon>lock</mat-icon>
        <p>Vous n'avez pas la permission de modifier cet événement.</p>
        <button mat-raised-button color="primary" routerLink="/">Retourner à l'accueil</button>
      </div>
    </ng-template>
  `,
  styles: [`
    .edit-container {
      max-width: 700px;
      margin: 0 auto;
      padding: 30px 20px;
    }

    h2 {
      color: var(--text-primary);
      margin-bottom: 30px;
      text-align: center;
      font-size: 1.8rem;
    }

    .event-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .full-width {
      width: 100%;
    }

    /* Image Preview */
    .image-preview-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      background: var(--bg-secondary);
      border-radius: 8px;
      border: 2px solid var(--primary);
    }

    .preview-container {
      position: relative;
      overflow: hidden;
      border-radius: 6px;
      max-height: 350px;
      background: var(--bg-tertiary);
    }

    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .remove-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0, 0, 0, 0.6);
      color: white;
    }

    .file-info {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin: 0;
    }

    /* File Input */
    .file-input-wrapper {
      padding: 24px;
      border: 2px dashed var(--primary);
      border-radius: 8px;
      text-align: center;
      background: var(--bg-secondary);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .file-input-wrapper:hover {
      border-color: var(--primary-light);
      background: var(--bg-tertiary);
    }

    .file-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .file-label mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: var(--primary);
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 12px;
    }

    .form-actions button {
      min-width: 140px;
    }

    .submit-btn {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    /* Messages */
    .success-message,
    .error-message {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 0.9rem;
      margin-top: 8px;
    }

    .success-message {
      background: #e8f5e9;
      color: #2e7d32;
      border: 1px solid #4caf50;
    }

    .error-message {
      background: #ffebee;
      color: #c62828;
      border: 1px solid #f44336;
    }

    /* No Access */
    .no-access {
      max-width: 500px;
      margin: 60px auto;
      padding: 40px;
      text-align: center;
      background: var(--bg-secondary);
      border-radius: 8px;
    }

    .no-access mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--warn);
      margin-bottom: 16px;
    }

    .no-access p {
      color: var(--text-primary);
      margin: 16px 0;
      font-size: 1.1rem;
    }

    @media (max-width: 600px) {
      .edit-container {
        padding: 20px 12px;
      }

      h2 {
        font-size: 1.5rem;
        margin-bottom: 20px;
      }

      .event-form {
        gap: 20px;
      }

      .form-actions {
        flex-direction: column;
      }

      .form-actions button {
        width: 100%;
      }
    }
  `]
})
export class EventEditComponent implements OnInit {
  eventForm: FormGroup;
  eventId!: string;
  event?: Event;
  isOrganisateur = false;
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private supabaseService: SupabaseService
  ) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      date: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.isOrganisateur = this.authService.userRole === 'organisateur';

    this.route.params.pipe(
      switchMap(params => {
        this.eventId = params['id'];
        return this.eventService.getEvent(this.eventId);
      })
    ).subscribe({
      next: (event) => {
        this.event = event;
        this.eventForm.patchValue(event);
        // Vérifier que c'est l'organisateur
        if (event.organizerId !== this.authService.currentUser?.uid) {
          this.isOrganisateur = false;
        }
      },
      error: (err) => {
        console.error('Erreur chargement événement:', err);
        this.errorMessage = 'Impossible de charger l\'événement';
      }
    });
  }

  handleFile(event: any) {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      this.selectedImage = file;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  clearImage() {
    this.selectedImage = null;
    this.imagePreview = null;
  }

  async onSubmit() {
    if (!this.eventForm.valid || !this.isOrganisateur || !this.eventId) {
      this.errorMessage = 'Formulaire invalide';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      let imageUrl = this.event?.imageUrl || '';

      // Uploader la nouvelle image si fournie
      if (this.selectedImage) {
        try {
          console.log('📤 Upload nouvelle image...');
          imageUrl = await this.supabaseService.uploadEventImage(this.selectedImage);
          console.log('✅ Image uploadée:', imageUrl);
        } catch (err) {
          console.error('❌ Erreur upload:', err);
          this.errorMessage = 'Erreur téléchargement image';
          throw err;
        }
      }

      // Mettre à jour l'événement
      const updateData = {
        ...this.eventForm.value,
        imageUrl,
        organizerId: this.event?.organizerId,
        participants: this.event?.participants
      };

      console.log('💾 Mise à jour événement...', updateData);
      await this.eventService.updateEvent(this.eventId, updateData);
      console.log('✅ Événement mis à jour!');

      this.successMessage = 'Événement modifié avec succès! 🎉';
      
      setTimeout(() => {
        this.router.navigate(['/event', this.eventId]);
      }, 1500);
    } catch (err: any) {
      console.error('❌ Erreur modification:', err);
      this.errorMessage = err?.message || 'Erreur lors de la modification';
    } finally {
      this.loading = false;
    }
  }
}
