import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-password-reset-modal',
  templateUrl: './password-reset-modal.component.html',
  styleUrls: ['./password-reset-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PasswordResetModalComponent {
  credentials = {
    matricula: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private toastCtrl: ToastController
  ) { }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async resetPassword() {
    if (this.credentials.newPassword !== this.credentials.confirmPassword) {
      this.showToast('Las contraseñas no coinciden.', 'danger');
      return;
    }

    if (!this.credentials.matricula || !this.credentials.newPassword) {
      this.showToast('La matrícula y la nueva contraseña son requeridas.', 'danger');
      return;
    }

    this.http.post(`${environment.apiUrl}/reset-password-public`, this.credentials).subscribe({
      next: async () => {
        await this.showToast('Contraseña actualizada con éxito. Ahora puedes iniciar sesión.', 'success');
        this.modalCtrl.dismiss(null, 'confirm');
      },
      error: async (err) => {
        const message = err.error?.message || 'Error al restablecer la contraseña.';
        await this.showToast(message, 'danger');
      }
    });
  }

  private async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color });
    toast.present();
  }
}
