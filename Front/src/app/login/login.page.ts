import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { leafOutline } from 'ionicons/icons';
import { 
  IonContent, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonButton,
  IonIcon,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, 
    IonItem, 
    IonLabel, 
    IonInput, 
    IonButton,
    IonIcon
  ],
})
export class LoginPage {
  credentials = {
    matricula: '',
    password: ''
  };

  constructor(
    private router: Router,
    private toastController: ToastController,
    private authService: AuthService, // Inyectar el servicio de autenticación
    private alertController: AlertController // Inyectar el controlador de alertas
  ) {
    addIcons({ leafOutline });
  }

  async onLogin() {
    if (this.credentials.matricula && this.credentials.password) {
      this.authService.login(this.credentials.matricula, this.credentials.password).subscribe({
        next: (response) => {
          console.log('Login exitoso desde login.page.ts:', response);
          this.router.navigateByUrl('/home'); // Redirigir a home si el login es correcto
        },
        error: (error) => {
          console.error('Error en el login:', error);
          // Muestra el mensaje de error que viene del backend
          this.showError(error.error.message || 'Error al conectar con el servidor.');
        }
      });
    } else {
      this.showError('Por favor, complete todos los campos.');
    }
  }

  private async showError(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  }
}
