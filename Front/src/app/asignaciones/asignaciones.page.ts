import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { take } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

// Definimos una interfaz para las asignaciones (similar a Tarea)
interface Asignacion {
  id: string;
  nombre: string;
  descripcion: string;
  estado: 'To-do' | 'Doing' | 'Done';
  creador: { id: string; nombre: string; };
  fechaCreacion: string;
  colaboradores?: { id: string; nombre: string; }[];
  entrega?: { fecha: string; estado?: string; revision?: { frase: string } }; // Para saber cuándo se completó y si fue revisada
  calificacion?: { nota: string, frase: string }; // Para compatibilidad con la plantilla
}

@Component({
  selector: 'app-asignaciones',
  templateUrl: './asignaciones.page.html',
  styleUrls: ['./asignaciones.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule] // Añadimos los imports necesarios
})
export class AsignacionesPage implements OnInit {

  todoTasks: Asignacion[] = [];
  doingTasks: Asignacion[] = [];
  doneTasks: Asignacion[] = []; // Lo dejamos por si se usa en el futuro

  private currentUserId: string | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.authService.currentUser.pipe(take(1)).subscribe(user => {
      if (user) {
        this.currentUserId = user.id;
        this.loadAsignaciones();
      }
    });
  }

  loadAsignaciones() {
    if (!this.currentUserId) return;

    // Apuntamos al nuevo endpoint de asignaciones
    const endpoint = `${environment.apiUrl}/asignaciones`;
    const params = new HttpParams().set('userId', this.currentUserId);

    this.http.get<Asignacion[]>(endpoint, { params }).subscribe({
      next: (asignaciones) => {
        // El backend ya nos da el estado correcto para el maestro:
        // 'To-do' -> Pendiente
        // 'Doing' -> Completada
        this.todoTasks = asignaciones.filter(a => a.estado === 'To-do');
        this.doingTasks = asignaciones.filter(a => a.estado === 'Doing');
        this.doneTasks = asignaciones.filter(a => a.estado === 'Done'); // Ahora puede contener asignaciones revisadas
      },
      error: (err) => console.error('Error al cargar las asignaciones', err)
    });
  }

  // Dispara el click en el input de archivo oculto
  triggerFileUpload(asignacionId: string) {
    document.getElementById(`file-upload-${asignacionId}`)?.click();
  }

  // Se ejecuta cuando el maestro selecciona un archivo
  onFileSelected(event: any, asignacionId: string) {
    const file: File = event.target.files[0];
    if (file && this.currentUserId) {
      const formData = new FormData();
      formData.append('archivo', file);
      formData.append('teacherId', this.currentUserId);

      const endpoint = `${environment.apiUrl}/asignaciones/${asignacionId}/completar`;

      this.http.post(endpoint, formData).subscribe({
        next: async () => {
          const toast = await this.toastController.create({
            message: 'Asignación completada y archivo subido.',
            duration: 2000,
            color: 'success'
          });
          toast.present();
          this.loadAsignaciones(); // Recargamos la lista
        },
        error: (err) => console.error('Error al completar la asignación', err)
      });
    }
  }

}
