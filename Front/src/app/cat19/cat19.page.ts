import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { personCircleOutline, schoolOutline, buildOutline, pencilOutline, peopleOutline, addOutline } from 'ionicons/icons';

import { environment } from 'src/environments/environment';
// Necesitaremos crear este componente modal en el siguiente paso
import { UserEditModalComponent } from '../components/user-edit-modal/user-edit-modal.component';

// Definimos la interfaz para el usuario
export interface User {
  id: string;
  nombre: string;
  apellidos: string;
  matricula: string;
  correo: string;
  Rol: 'admin' | 'estudiante' | 'maestro';
}

@Component({
  selector: 'app-cat19',
  templateUrl: './cat19.page.html',
  styleUrls: ['./cat19.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class Cat19Page implements OnInit {

  users: User[] = [];

  constructor(
    private http: HttpClient,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {
    addIcons({ personCircleOutline, schoolOutline, buildOutline, pencilOutline, peopleOutline, addOutline });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers(event?: any) {
    this.http.get<User[]>(`${environment.apiUrl}/usuarios`).subscribe({
      next: (data) => {
        this.users = data.sort((a, b) => a.nombre.localeCompare(b.nombre));
        if (event) {
          event.target.complete();
        }
      },
      error: async (err) => {
        console.error('Error al cargar usuarios', err);
        if (event) {
          event.target.complete();
        }
        const toast = await this.toastCtrl.create({ message: 'Error al cargar la lista de usuarios.', duration: 3000, color: 'danger' });
        toast.present();
      }
    });
  }

  handleRefresh(event: any) {
    this.loadUsers(event);
  }

  getIconForRole(role: string): string {
    switch (role) {
      case 'admin': return 'person-circle-outline';
      case 'estudiante': return 'school-outline';
      case 'maestro': return 'build-outline';
      default: return 'person-outline';
    }
  }

  getColorForRole(role: string): string {
    switch (role) {
      case 'admin': return 'danger';
      case 'estudiante': return 'success';
      case 'maestro': return 'warning';
      default: return 'medium';
    }
  }

  // Abre el modal en modo "Crear"
  async openAddModal() {
    this.openEditModal(); // Llamamos a la misma función pero sin pasarle un usuario
  }

  async openEditModal(user?: User) { // Hacemos el parámetro 'user' opcional con '?'
    const modal = await this.modalCtrl.create({
      component: UserEditModalComponent,
      componentProps: {
        // Si el usuario existe (modo edición), pasamos una copia. Si no, pasamos 'null' (modo creación).
        user: user ? { ...user } : null
      }
    });

    await modal.present();

    // Escuchamos si el modal se cerró y si debemos recargar la lista
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      this.loadUsers();
    }
  }
}
