import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';
import { take } from 'rxjs';
import { addIcons } from 'ionicons';
import { hourglassOutline, cloudUploadOutline, sunnyOutline, checkmarkDoneCircleOutline, schoolOutline, documentTextOutline, readerOutline } from 'ionicons/icons';

// Interfaz actualizada para la Tarea del estudiante
interface Tarea {
  id: string;
  nombre: string;
  descripcion: string;
  estado: 'To-do' | 'Doing' | 'Done';
  creador: { id: string; nombre: string; };
  entrega?: { fecha: string; };
  // La calificación ahora es parte de la interfaz
  calificacion?: {
    nota: string;
    frase: string;
  };
}

@Component({
  selector: 'app-student-activitie',
  templateUrl: './student-activitie.component.html',
  styleUrls: ['./student-activitie.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class StudentActivitieComponent implements OnInit {

  // Propiedades para las tres listas de tareas
  todoTasks: Tarea[] = [];
  doingTasks: Tarea[] = []; // Array para "En Revisión"
  doneTasks: Tarea[] = [];

  private currentUser: any;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastCtrl: ToastController
  ) {
    addIcons({ hourglassOutline, cloudUploadOutline, sunnyOutline, checkmarkDoneCircleOutline, schoolOutline, documentTextOutline, readerOutline });
  }

  ngOnInit() {
    this.authService.currentUser.pipe(take(1)).subscribe(user => {
      if (user && user.Rol.toLowerCase() === 'estudiante') {
        this.currentUser = user;
        this.loadTasks();
      }
    });
  }

  loadTasks() {
    if (!this.currentUser) return;

    const params = new HttpParams().set('userId', this.currentUser.id);
    this.http.get<Tarea[]>(`${environment.apiUrl}/tareas`, { params }).subscribe({
      next: (tasks) => {
        // Filtramos las tareas en sus respectivos arrays
        this.todoTasks = tasks.filter(t => t.estado === 'To-do');
        this.doingTasks = tasks.filter(t => t.estado === 'Doing'); // Tareas entregadas, pendientes de calificar
        this.doneTasks = tasks.filter(t => t.estado === 'Done');   // Tareas ya calificadas
      },
      error: (err) => console.error('Error al cargar las tareas del estudiante', err)
    });
  }

  triggerFileUpload(taskId: string) {
    const fileInput = document.getElementById(`file-upload-${taskId}`);
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: Event, taskId: string) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('studentId', this.currentUser.id);

    this.http.post(`${environment.apiUrl}/tareas/${taskId}/entregar`, formData).subscribe({
      next: async () => {
        const toast = await this.toastCtrl.create({
          message: '¡Tarea entregada con éxito! Ahora está en revisión.',
          duration: 3000,
          color: 'success'
        });
        toast.present();
        this.loadTasks(); // Recargamos para que la tarea se mueva a "En Revisión"
      },
      error: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Error al entregar la tarea.',
          duration: 3000,
          color: 'danger'
        });
        toast.present();
      }
    });
  }
}
