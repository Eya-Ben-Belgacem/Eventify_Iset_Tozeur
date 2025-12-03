// src/app/events/event-create/event-create.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EventService } from '../event.service';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, RouterModule],
  template: `
    <div *ngIf="isOrganisateur; else noAccess" class="create-container">
      <h2>Créer un nouvel événement</h2>
      
      <form [formGroup]="eventForm" (ngSubmit)="onCreateEvent()" class="event-form">
        <!-- Prévisualisation d'image -->
        <div class="image-preview-section" *ngIf="imagePreview">
          <div class="preview-container">
            <img [src]="imagePreview" alt="Prévisualisation" class="preview-image" />
            <button type="button" mat-icon-button color="warn" (click)="clearImage()" class="remove-btn" title="Supprimer l'image">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <p class="file-info">✓ {{ selectedImage?.name }} ({{ (selectedImage?.size || 0) / 1024 | number:'1.0-0' }} KB)</p>
        </div>

        <!-- Input fichier -->
        <div class="file-input-wrapper" *ngIf="!imagePreview">
          <label for="fileInput" class="file-label">
            <mat-icon>image</mat-icon>
            <span>Sélectionner une image (JPG, PNG, WebP)</span>
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
            <mat-icon *ngIf="!loading">check</mat-icon>
            <span>{{ loading ? 'Création en cours...' : 'Créer l\'événement' }}</span>
          </button>
        </div>

        <!-- Message de succès/erreur -->
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
        <p>Vous n'avez pas la permission de créer un événement.</p>
        <button mat-raised-button color="primary" routerLink="/">Retourner à l'accueil</button>
      </div>
    </ng-template>
  `,
  styles: [`
    .create-container {
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
      .create-container {
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
export class EventCreateComponent implements OnInit {
  eventForm: FormGroup;
  isOrganisateur = false;
  selectedImage: File | null = null;
  image: File | null = null;
  imagePreview: string | null = null;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
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
    if (!this.isOrganisateur) {
      console.warn('Accès refusé: participant ne peut pas créer');
    }
  }

  handleFile(event: any) {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      this.selectedImage = file;
      this.image = file;
      
      // Créer la prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  clearImage() {
    this.selectedImage = null;
    this.image = null;
    this.imagePreview = null;
  }

  async onCreateEvent() {
    if (!this.eventForm.valid) {
      console.warn('❌ Formulaire invalide');
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    if (!this.isOrganisateur) {
      console.warn('❌ Utilisateur non organisateur');
      this.errorMessage = 'Vous n\'avez pas la permission de créer un événement';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      let imageUrl = '';

      // Étape 1: Upload image vers Supabase si fournie
      const fileToUpload = this.image ?? this.selectedImage;
      if (fileToUpload) {
        try {
          console.log('📤 Début upload image vers Supabase...', fileToUpload.name);
          imageUrl = await this.supabaseService.uploadEventImage(fileToUpload);
          console.log('✅ Image uploadée avec succès:', imageUrl);
        } catch (err) {
          console.error('❌ Erreur upload image:', err);
          this.errorMessage = 'Erreur lors du téléchargement de l\'image. Continuez sans image.';
          imageUrl = '';
        }
      }

      // Étape 2: Créer l'événement dans Firestore avec l'URL de l'image
      const eventData = {
        title: this.eventForm.get('title')?.value,
        description: this.eventForm.get('description')?.value,
        date: this.eventForm.get('date')?.value,
        imageUrl: imageUrl || null
      };

      console.log('💾 Sauvegarde de l\'événement dans Firestore...', eventData);
      
      const result = await this.eventService.addEvent(eventData);
      console.log('✅ Événement créé avec succès! ID:', result.id);

      this.successMessage = 'Événement créé avec succès! 🎉';
      
      // Réinitialiser le formulaire
      this.eventForm.reset();
      this.clearImage();

      // Redirection après 2 secondes
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 2000);
    } catch (err: any) {
      console.error('❌ Erreur création événement:', err);
      console.error('Details:', err?.message || err);
      this.errorMessage = `Erreur: ${err?.message || 'Impossible de créer l\'événement'}`;
    } finally {
      this.loading = false;
    }
  }
}
