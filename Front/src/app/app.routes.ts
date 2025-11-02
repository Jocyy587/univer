import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'pueba',
    loadComponent: () => import('./pueba/pueba.page').then( m => m.PuebaPage)
  },
  {
    path: 'sustentable',
    loadComponent: () => import('./sustentable/sustentable.page').then( m => m.SustentablePage)
  },  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },

];
