import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-task-edit-modal',
  templateUrl: './task-edit-modal.component.html',
  styleUrls: ['./task-edit-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class TaskEditModalComponent implements OnInit {
  @Input() task: any;
  maestros: any[] = []; // NUEVO: Para la lista de maestros

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadMaestros(); // NUEVO: Cargamos los maestros al iniciar
    // Aseguramos que la propiedad 'colaboradores' exista
    if (!this.task.colaboradores) {
      this.task.colaboradores = [];
    }
  }

  // NUEVO: Método para cargar la lista de maestros
  loadMaestros() {
    this.http.get<any[]>(`${environment.apiUrl}/usuarios/maestros`).subscribe({
      next: (data) => { this.maestros = data; },
      error: (err) => console.error('Error al cargar la lista de maestros', err)
    });
  }

  // NUEVO: Función para comparar objetos en el ion-select
  compareCollaborators(c1: { id: string }, c2: { id: string }) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  saveChanges() {
    this.authService.currentUser.pipe(take(1)).subscribe(user => {
      const updateData = {
        ...this.task,
        userId: user?.id,
        userRole: user?.Rol?.toLowerCase()
      };
      this.http.put(`${environment.apiUrl}/tareas/${this.task.id}`, updateData).subscribe({
        next: () => this.modalCtrl.dismiss(this.task, 'confirm'),
        error: (err) => console.error('Error al actualizar la tarea', err)
      });
    });
  }
}