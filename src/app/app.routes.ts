import { Routes } from '@angular/router';
import { HomeComponent } from './events/home/home.component';
import { EventCreateComponent } from './events/event-create/event-create.component';
import { EventDetailComponent } from './events/event-detail/event-detail.component';
import { EventEditComponent } from './events/event-edit/event-edit.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { RoleGuard } from './core/guards/role.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { ForbiddenComponent } from './pages/forbidden/forbidden.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'create-event', component: EventCreateComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'organisateur' } },
  { path: 'event/:id', component: EventDetailComponent },
  { path: 'edit-event/:id', component: EventEditComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'organisateur' } },
  { path: 'forbidden', component: ForbiddenComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: '' }
];
