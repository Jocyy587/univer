import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'login',
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
  },
  {
    path: 'actividades',
    loadComponent: () => import('./actividades/actividades.page').then( m => m.ActividadesPage)
  },  {
    path: 'cat19',
    loadComponent: () => import('./cat19/cat19.page').then( m => m.Cat19Page)
  },
  {
    path: 'asignaciones',
    loadComponent: () => import('./asignaciones/asignaciones.page').then( m => m.AsignacionesPage)
  },
  {
    path: 'alumnos',
    loadComponent: () => import('./alumnos/alumnos.page').then( m => m.AlumnosPage)
  },



];
