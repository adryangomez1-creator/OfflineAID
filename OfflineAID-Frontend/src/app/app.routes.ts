import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth';
import { PanelOperadorComponent } from './components/panel-operador/panel-operador';
import { AppComponent } from './app';
import { adminGuard, usuarioGuard } from './guards/role.guard';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'usuario' },
	{ path: 'login', component: AuthComponent },
	{ path: 'usuario', component: AppComponent, canActivate: [usuarioGuard] },
	{ path: 'admin', component: PanelOperadorComponent, canActivate: [adminGuard] },
	{ path: '**', redirectTo: 'usuario' }
];
