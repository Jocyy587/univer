import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { environment } from 'src/environments/environment';
import { leafOutline } from 'ionicons/icons';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonItem, IonLabel, IonInput, IonButton, IonIcon]
})
export class RegistroPage {
  credentials = {
    nombre: '',
    apellidos: '',
    matricula: '',
    correo: '',
    password: '',
    confirmPassword: ''
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController
  ) {
    addIcons({ leafOutline });
  }

  async onRegister() {
    if (this.credentials.password !== this.credentials.confirmPassword) {
      this.presentAlert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    // Excluimos confirmPassword del objeto que se envía al backend
    const { confirmPassword, ...registrationData } = this.credentials;

    this.http.post(`${environment.apiUrl}/register`, registrationData).subscribe({
      next: async (response: any) => {
        await this.presentAlert('¡Éxito!', 'Te has registrado correctamente. Ahora puedes iniciar sesión.');
        this.router.navigate(['/login']);
      },
      error: async (error) => {
        const message = error.error?.message || 'Ocurrió un error durante el registro.';
        await this.presentAlert('Error de Registro', message);
        console.error('Registration failed', error);
      }
    });
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}