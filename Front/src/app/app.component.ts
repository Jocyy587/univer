import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { addIcons } from 'ionicons';
import { leafOutline } from 'ionicons/icons';
import { 
  IonApp, 
  IonRouterOutlet, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonMenuButton,
  IonButton,
  IonIcon,
  IonFooter
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service'; // Importa el servicio de autenticación
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonApp, 
    IonRouterOutlet,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonButton,
    IonIcon,
    IonFooter
  ],
})
export class AppComponent implements OnInit {
  // Observables para el estado de autenticación y el rol de administrador
  isAuthenticated$: Observable<boolean>;
  isAdmin$: Observable<boolean>;

  constructor(private authService: AuthService) { // Inyecta AuthService
    addIcons({ leafOutline });
    // Asigna los observables del servicio a las propiedades del componente
    this.isAuthenticated$ = this.authService.isAuthenticated;
    this.isAdmin$ = this.authService.currentUser.pipe(
      map(user => user?.Rol === 'admin') // Comprueba si el rol del usuario es 'admin'
    );
  }

  ngOnInit() {
    // El servicio ya carga la sesión en su constructor,
    // así que no es necesario hacer nada más aquí.
  }

  // Método para cerrar sesión
  onLogout() {
    this.authService.logout();
  }
}
