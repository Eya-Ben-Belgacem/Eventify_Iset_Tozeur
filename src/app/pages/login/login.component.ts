// src/app/auth/login/login.component.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  async onLogin() {
    this.loading = true;
    this.errorMessage = '';
    try {
      const credential = await this.authService.login(this.email, this.password);

      // ensure role is loaded (login already tries, but be explicit)
      try {
        const uid = credential.user?.uid;
        if (uid) await this.authService.loadUserRoleByUid(uid);
      } catch (e) {
        console.warn('Could not explicitly reload role after login', e);
      }

      console.log('Login successful, role:', this.authService.userRole);

      // redirection automatique vers home après login
      await this.router.navigate(['/']);
    } catch (err: any) {
      console.error('Login failed', err);
      this.errorMessage = err.message || 'Erreur lors de la connexion';
    } finally {
      this.loading = false;
    }
  }
}
