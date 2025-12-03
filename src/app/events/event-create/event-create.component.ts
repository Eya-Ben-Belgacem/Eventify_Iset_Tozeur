// src/app/events/event-create/event-create.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { EventService } from '../event.service';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterModule],
  template: `
    <div *ngIf="isOrganisateur; else noAccess">
      <form [formGroup]="eventForm" (ngSubmit)="onSubmit()" class="event-form">
        <mat-form-field appearance="fill">
          <mat-label>Titre</mat-label>
          <input matInput formControlName="title" required>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description"></textarea>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Date</mat-label>
          <input matInput type="datetime-local" formControlName="date">
        </mat-form-field>

        <button mat-raised-button color="primary" type="submit" [disabled]="eventForm.invalid">Créer</button>
      </form>
    </div>
    <ng-template #noAccess>
      <p>Vous n'avez pas la permission de créer un événement.</p>
    </ng-template>
  `,
  styles: [`
    .event-form { max-width: 600px; margin: auto; display: flex; flex-direction: column; gap: 20px; padding: 20px; }
  `]
})
export class EventCreateComponent implements OnInit {
  eventForm: FormGroup;
  isOrganisateur = false;

  constructor(private fb: FormBuilder, private eventService: EventService, private router: Router, private authService: AuthService) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      date: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.isOrganisateur = this.authService.userRole === 'organisateur';
    if (!this.isOrganisateur) {
      // redirige ou affiche un message
      console.warn('Accès refusé: participant ne peut pas créer');
    }
  }

  onSubmit() {
    if (this.eventForm.valid && this.isOrganisateur) {
      this.eventService.addEvent(this.eventForm.value).then(() => {
        this.router.navigate(['/']);
      });
    }
  }
}
