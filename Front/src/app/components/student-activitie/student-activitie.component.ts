import { Component, Input, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { take } from 'rxjs';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

// Definimos una interfaz para las tareas para tener un tipado fuerte
interface Tarea {
  id: string;
  nombre: string;
  descripcion: string;
  estado: 'To-do' | 'Doing' | 'Done';
  creador: { id: string; nombre: string; };
  fechaCreacion: string;
  colaboradores?: { id: string; nombre: string; }[];
  entrega?: { fecha: string; nombreArchivo?: string; archivoUrl?: string; };
  calificacion?: { nota: string, frase: string };
}

@Component({
  selector: 'app-student-activitie',
  templateUrl: './student-activitie.component.html',
  styleUrls: ['./student-activitie.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, DragDropModule]
})
export class StudentActivitieComponent implements OnInit {

  todoTasks: Tarea[] = [];
  doingTasks: Tarea[] = [];
  doneTasks: Tarea[] = []; // Lo mantenemos por si se usa en el futuro

  private currentUserId: string | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.authService.currentUser.pipe(take(1)).subscribe(user => {
      if (user) {
        this.currentUserId = user.id;
        this.loadTasks();
      }
    });
  }

  drop(event: CdkDragDrop<Tarea[]>) {
    // If dropped into same container -> reorder
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Move between containers
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Persist change: update estado based on target container
      const movedTask: Tarea = event.container.data[event.currentIndex];
      let newEstado: 'To-do' | 'Doing' | 'Done' = 'To-do';
      // Decide new state by which array it now belongs to
      if (this.todoTasks.includes(movedTask)) newEstado = 'To-do';
      else if (this.doingTasks.includes(movedTask)) newEstado = 'Doing';
      else if (this.doneTasks.includes(movedTask)) newEstado = 'Done';

      // Call backend to persist
      this.updateTaskEstado(movedTask.id, newEstado).subscribe({
        next: () => {
          // optionally show toast
        },
        error: (err) => console.error('Error updating task state', err)
      });
    }
  }

  updateTaskEstado(taskId: string, estado: 'To-do' | 'Doing' | 'Done') {
    const endpoint = `${environment.apiUrl}/tareas/${taskId}/estado`;
    return this.http.patch(endpoint, { estado });
  }

  loadTasks() {
    if (!this.currentUserId) return;

    const endpoint = `${environment.apiUrl}/tareas`;
    const params = new HttpParams().set('userId', this.currentUserId);

    this.http.get<Tarea[]>(endpoint, { params }).subscribe({
      next: (tasks) => {
        this.todoTasks = tasks.filter(t => t.estado === 'To-do');
        this.doingTasks = tasks.filter(t => t.estado === 'Doing');
        this.doneTasks = tasks.filter(t => t.estado === 'Done');
      },
      error: (err) => console.error('Error al cargar las asignaciones', err)
    });
  }

  // Lógica para que un estudiante suba un archivo (ya existente)
  triggerFileUpload(taskId: string) {
    document.getElementById(`file-upload-${taskId}`)?.click();
  }

  onFileSelected(event: any, taskId: string) {
    const file: File = event.target.files[0];
    if (file && this.currentUserId) {
      const formData = new FormData();
      formData.append('archivo', file);
      formData.append('studentId', this.currentUserId);

      const endpoint = `${environment.apiUrl}/tareas/${taskId}/entregar`;

      this.http.post(endpoint, formData).subscribe({
        next: async () => {
          const toast = await this.toastController.create({
            message: 'Tarea entregada con éxito.',
            duration: 2000,
            color: 'success'
          });
          toast.present();
          this.loadTasks(); // Recargamos las tareas para que se mueva a la columna "En Revisión"
        },
        error: (err) => {
          console.error('Error al entregar la tarea', err);
        }
      });
    }
  }
}