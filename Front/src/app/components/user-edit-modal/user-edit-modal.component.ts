import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController, AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { User } from '../../cat19/cat19.page'; // Importamos la interfaz

@Component({
  selector: 'app-user-edit-modal',
  templateUrl: './user-edit-modal.component.html',
  styleUrls: ['./user-edit-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class UserEditModalComponent implements OnInit {
  // El usuario es opcional. Si no se pasa, estamos en modo "crear".
  @Input() user?: User;
  isEditMode = false;
  // Para el formulario de creación, necesitamos campos extra.
  password = '';

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    if (this.user && this.user.id) {
      this.isEditMode = true;
    } else {
      // Si no hay usuario, inicializamos un objeto vacío para el formulario
      this.isEditMode = false;
      this.user = {
        Rol: 'estudiante', // Rol por defecto
        correo: ''
      } as User;
    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    return this.modalCtrl.dismiss(null, 'confirm');
  }

  saveChanges() {
    if (this.isEditMode) {
      // --- MODO EDICIÓN ---
      this.http.put(`${environment.apiUrl}/usuarios/${this.user!.id}`, this.user).subscribe({
        next: () => {
          this.showToast('Usuario actualizado.', 'success');
          this.confirm();
        },
        error: (err) => this.showToast(err.error.message || 'Error al actualizar.', 'danger')
      });
    } else {
      // --- MODO CREACIÓN ---
      if (!this.user?.correo || !this.password) {
        this.showToast('El correo y la contraseña son obligatorios para crear un usuario.', 'danger');
        return;
      }
      const newUser = { ...this.user, contraseña: this.password };
      this.http.post(`${environment.apiUrl}/usuarios`, newUser).subscribe({
        next: () => {
          this.showToast('Usuario creado con éxito.', 'success');
          this.confirm();
        },
        error: (err) => this.showToast(err.error.message || 'Error al crear el usuario.', 'danger')
      });
    }
  }

  async resetPassword() {
    // Añadimos una guarda para asegurarnos de que el usuario existe.
    if (!this.user) return;

    // Creamos una constante local para que TypeScript sepa que el usuario existe dentro del handler.
    const userToReset = this.user;

    const alert = await this.alertCtrl.create({
      header: 'Reiniciar Contraseña',
      inputs: [{ name: 'nuevaContraseña', type: 'text', placeholder: 'Nueva contraseña' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: (data) => {
            if (!data.nuevaContraseña) {
              this.showToast('La contraseña no puede estar vacía.', 'danger');
              return false;
            }
            this.http.put(`${environment.apiUrl}/usuarios/${userToReset.id}/reset-password`, { nuevaContraseña: data.nuevaContraseña })
              .subscribe({
                next: () => this.showToast('Contraseña reiniciada con éxito.', 'success'),
                error: () => this.showToast('Error al reiniciar la contraseña.', 'danger')
              });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteUser() {
    // Añadimos una guarda para asegurarnos de que el usuario existe.
    if (!this.user) return;

    // Creamos una constante local para usarla de forma segura en el handler.
    const userToDelete = this.user;

    const alert = await this.alertCtrl.create({
      header: '¿Estás seguro?',
      message: `Esto eliminará permanentemente a ${this.user.nombre}. Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          cssClass: 'alert-button-danger',
          handler: () => {
            this.http.delete(`${environment.apiUrl}/usuarios/${userToDelete.id}`).subscribe({
              next: () => {
                this.showToast('Usuario eliminado.', 'success');
                this.confirm();
              },
              error: () => this.showToast('Error al eliminar el usuario.', 'danger')
            });
          }
        }
      ]
    });
    await alert.present();
  }

  private async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color });
    toast.present();
  }
}
