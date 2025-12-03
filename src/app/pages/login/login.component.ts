import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';

  onLogin() {
    console.log('Tentative login :', this.email, this.password);
    // Ici on mettra Firebase après que tu confirmes cette étape
  }
}
