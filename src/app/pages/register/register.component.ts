import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  selectedFile: File | null = null;

  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['organisateur', Validators.required]
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files?.[0] ?? null;
  }

  async onRegister() {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    try {
      let profilePictureUrl = '';

      // Upload photo to Supabase if available and file selected
      if (this.selectedFile) {
        try {
          const mod = await import('../../environments/supabase');
          const supabase = (mod as any).supabase;
          if (supabase && supabase.storage) {
            const fileName = `${Date.now()}-${this.selectedFile.name}`;
            const { error: uploadError } = await supabase.storage.from('profiles').upload(fileName, this.selectedFile);
            if (uploadError) throw uploadError;
            const { data } = supabase.storage.from('profiles').getPublicUrl(fileName);
            profilePictureUrl = data?.publicUrl || '';
          }
        } catch (err) {
          console.warn('Supabase upload skipped or failed:', err);
        }
      }

      await this.authService.register({
        ...this.registerForm.value,
        profilePictureUrl
      });

      // 🎉 Message de succès
      this.successMsg = "Compte créé avec succès ! Redirection...";

      // ⏳ délai avant redirection
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);

    } catch (error: any) {
      this.errorMsg = error?.message || 'Erreur lors de l\'inscription.';
    }

    this.loading = false;
  }
}
