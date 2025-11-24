import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

// Suponiendo que tienes una interfaz de Tarea, si no, puedes crearla.
export interface Task {
  id: string;
  nombre: string;
  descripcion: string;
  // ... otras propiedades de la tarea
}

@Component({
  selector: 'app-task-edit-modal',
  templateUrl: './task-edit-modal.component.html',
  styleUrls: ['./task-edit-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TaskEditModalComponent implements OnInit {
  @Input() task!: Task;

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    // Hacemos una copia para no modificar el objeto original hasta guardar
    this.task = { ...this.task };
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    return this.modalCtrl.dismiss(this.task, 'confirm');
  }

  saveChanges() {
    const updateData = {
      nombre: this.task.nombre,
      descripcion: this.task.descripcion
    };

    this.http.put(`${environment.apiUrl}/tareas/${this.task.id}`, updateData).subscribe({
      next: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Tarea actualizada con éxito.',
          duration: 2000,
          color: 'success'
        });
        toast.present();
        this.confirm();
      },
      error: async (err) => {
        const toast = await this.toastCtrl.create({
          message: 'Error al actualizar la tarea.',
          duration: 3000,
          color: 'danger'
        });
        toast.present();
      }
    });
  }
}
