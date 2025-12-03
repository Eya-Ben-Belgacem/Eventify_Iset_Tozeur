import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  
  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    const requiredRole: string = (route.data && route.data['role']) || 'organisateur';
  
    // if userRole is not loaded, try to load it when possible
    if (this.authService.userRole === 'guest') {
      try {
        const uid = (this.authService as any).auth?.currentUser?.uid;
        if (uid) await this.authService.loadUserRoleByUid(uid);
      } catch (err) {
        // ignore
      }
    }

    if (this.authService.userRole === requiredRole) return true;

    // redirect to home if unauthorized
    return this.router.parseUrl('/');
  }
}
