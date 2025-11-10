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
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.page').then( m => m.RegistroPage)
  },
  {
    path: 'extracurricular',
    loadComponent: () => import('./extracurricular/extracurricular.page').then( m => m.ExtracurricularPage)
  },  {
    path: 'actividades',
    loadComponent: () => import('./actividades/actividades.page').then( m => m.ActividadesPage)
  },


];
