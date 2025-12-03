import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    // If userRole is guest, consider not authenticated
    if (this.auth.userRole && this.auth.userRole !== 'guest') return true;

    // try to detect firebase currentUser as a fallback
    try {
      const current = (this.auth as any).auth?.currentUser;
      if (current) return true;
    } catch (e) {
      // ignore
    }

    // redirect to login
    this.router.navigate(['/login']);
    return false;
  }
}
