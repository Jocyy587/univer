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
  ToastController 
} from '@ionic/angular/standalone';

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
  ]
})
export class LoginPage {
  credentials = {
    matricula: '',
    password: ''
  };

  constructor(
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({ leafOutline });
  }

  async onLogin() {
    // Here you would typically make an API call to validate credentials
    if (this.credentials.matricula && this.credentials.password) {
      // For demo purposes, we'll just check if fields are not empty
      try {
        // TODO: Replace with actual API call
        await this.router.navigate(['/home']);
      } catch (error) {
        this.showError('Error al iniciar sesión');
      }
    } else {
      this.showError('Por favor complete todos los campos');
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
