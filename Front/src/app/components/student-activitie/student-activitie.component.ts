import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpParams } from '@angular/common/http';
import { take } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { environment } from 'src/environments/environment';

// La interfaz Tarea es necesaria para este componente
interface Tarea {
  id: string;
  nombre: string;
  descripcion: string;
  estado: 'To-do' | 'Doing' | 'Done';
  creador: { id: string; nombre: string; };
  fechaCreacion: string;
  entrega?: { fecha: string; nombreArchivo: string; archivoUrl?: string; };
}

@Component({
  selector: 'app-student-activitie',
  templateUrl: './student-activitie.component.html',
  styleUrls: ['./student-activitie.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class StudentActivitieComponent  implements OnInit {

  // Arreglos para las tareas del estudiante
  todoTasks: Tarea[] = [];
  doneTasks: Tarea[] = [];

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    // Obtenemos el usuario actual para enviar su ID
    this.authService.currentUser.pipe(take(1)).subscribe(user => {
      if (!user) return; // No hacer nada si no hay usuario

      const params = new HttpParams().set('userId', user.id);

      this.http.get<Tarea[]>(`${environment.apiUrl}/tareas`, { params }).subscribe({
        next: (tasks) => {
          this.todoTasks = tasks.filter(t => t.estado === 'Doing');
          this.doneTasks = tasks.filter(t => t.estado === 'Done');
        },
        error: (err) => console.error('Error al cargar las tareas del estudiante', err)
      });
    });
  }

  triggerFileUpload(taskId: string) {
    document.getElementById('file-upload-' + taskId)?.click();
  }

  onFileSelected(event: Event, taskId: string) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.submitTask(taskId, input.files[0]);
    }
  }

  submitTask(taskId: string, file: File) {
    const formData = new FormData();
    formData.append('archivo', file);
    
    this.authService.currentUser.pipe(take(1)).subscribe(user => {
      if (user) {
        formData.append('studentId', user.id);
        this.http.post(`${environment.apiUrl}/tareas/${taskId}/entregar`, formData).subscribe(() => this.loadTasks());
      }
    });
  }
}
