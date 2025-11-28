import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController, IonicModule, AlertController } from '@ionic/angular';
import { Observable, Subscription, take } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { AddTaskModalComponent } from '../components/add-task-modal/add-task-modal.component';
import { SearchStudentModalComponent } from '../components/search-student-modal/search-student-modal.component';
import { TaskEditModalComponent } from '../components/task-edit-modal/task-edit-modal.component';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { addIcons } from 'ionicons';
import { duplicateOutline, addOutline, leafOutline, documentAttachOutline, searchOutline, checkmarkCircle, hourglassOutline, checkmarkDoneCircleOutline, cloudUploadOutline, sunnyOutline, schoolOutline, trashOutline } from 'ionicons/icons';
import { StudentActivitieComponent } from 'src/app/components/student-activitie/student-activitie.component';

// Definimos una interfaz para las tareas para tener un tipado fuerte
interface Tarea {
  id: string;
  nombre: string;
  descripcion: string;
  estado: 'To-do' | 'Doing' | 'Done';
  type?: 'student' | 'teacher'; // Tipo de tarea
  creador: { id: string; nombre: string; };
  fechaCreacion: string;
  colaboradores?: { id: string; nombre: string; }[]; // Propiedad añadida
  entrega?: { fecha: string; nombreArchivo: string; archivoUrl?: string; }; // Para estudiante
  entregas?: any[]; // Para profesor
  calificacion?: { nota: string, frase: string }; // Para estudiante
}

@Component({
  selector: 'app-actividades',
  templateUrl: './actividades.page.html',
  styleUrls: ['./actividades.page.scss'], // Asegúrate de que esta línea exista
  standalone: true,
  imports: [IonicModule, CommonModule, AddTaskModalComponent, SearchStudentModalComponent, StudentActivitieComponent]
})
export class ActividadesPage implements OnInit, AfterViewInit {
  canCreateTasks$: Observable<boolean>;

  isStudent$: Observable<boolean>;
  // Arreglos para almacenar las tareas por estado
  todoTasks: Tarea[] = [];
  doingTasks: Tarea[] = [];
  doneTasks: Tarea[] = [];
                                                                                                                                                                                                                                                                                        
  currentUserId: string | null = null; // Cambiado a público
  isAdmin = false; // Cambiado a público
  @ViewChild('donutCanvas') private donutCanvas?: ElementRef;
  donutChart: any;
  private userSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private modalCtrl: ModalController,
    private http: HttpClient,
    private alertCtrl: AlertController // Inyectamos el AlertController
  ) {
    addIcons({ duplicateOutline, addOutline, leafOutline, documentAttachOutline, searchOutline, checkmarkCircle, hourglassOutline, checkmarkDoneCircleOutline, cloudUploadOutline, sunnyOutline, schoolOutline, trashOutline });
    Chart.register(...registerables);
    this.canCreateTasks$ = this.authService.currentUser.pipe(
      map(user => {
        const userRole = user?.Rol?.toLowerCase();
        return !!user && (userRole === 'admin' || userRole === 'profesor' || userRole === 'maestro');
      })
    );
    this.isStudent$ = this.authService.currentUser.pipe(
      map(user => !!user && user.Rol?.toLowerCase() === 'estudiante')
    );
  }

  ngOnInit() {
    this.userSubscription = this.authService.currentUser.subscribe(user => {
      // Solo cargamos las tareas si hay un usuario y NO es estudiante,
      // ya que el componente de estudiante maneja su propia carga.
      if (user && user.Rol?.toLowerCase() !== 'estudiante') {
        this.currentUserId = user.id;
        const userRole = user.Rol?.toLowerCase();
        this.isAdmin = userRole === 'admin';
        this.loadTasks();
      }
    });
  }

  ngAfterViewInit() {
    this.createDonutChart();
  }

  loadTasks() {
    // Obtenemos el usuario actual para enviar su ID si es un estudiante
    this.authService.currentUser.pipe(take(1)).subscribe(user => {
      // Esta lógica ahora es solo para profesores/admin
      if (!user || user.Rol?.toLowerCase() === 'estudiante') return;

      // No se necesitan parámetros porque el backend devuelve todo para admin/profesor
      this.http.get<Tarea[]>(`${environment.apiUrl}/tareas`).subscribe({
        next: (tasks) => {
          // Lógica solo para profesores/admin
          this.todoTasks = tasks.filter(t => t.estado === 'To-do');
          this.doingTasks = tasks.filter(t => t.estado === 'Doing');

          // Para el profesor, una tarea está "Done" si TODAS sus entregas están calificadas.
          // CORRECCIÓN: Una tarea solo está "Done" si su estado es 'Done' O si tiene entregas y TODAS están calificadas.
          // La condición `t.entregas.length > 0` evita que las tareas nuevas sin entregas se marquen como "Done".
          this.doneTasks = tasks.filter(t => t.estado === 'Done' || (t.entregas && t.entregas.length > 0 && t.entregas.every(e => e.estado === 'Calificado')));

          // Actualizamos el gráfico de dona con los datos reales
          this.updateDonutChartData();
          console.log('Tareas cargadas y personalizadas:', { todo: this.todoTasks, doing: this.doingTasks, done: this.doneTasks });
        },
        error: (err) => {
          console.error('Error al cargar las tareas', err);
        }
      });
    });
  }

  // Función auxiliar para mostrar los nombres de los colaboradores
  getCollaboratorNames(task: Tarea): string {
    if (!task.colaboradores || task.colaboradores.length === 0) {
      return '';
    }
    return task.colaboradores.map(c => c.nombre).join(', ');
  }

  // Nueva función para verificar permisos sobre una tarea
  canManageTask(task: Tarea): boolean {
    // El admin siempre tiene permiso
    if (this.isAdmin) {
      return true;
    }
    // Si no hay usuario logueado, no hay permisos
    if (!this.currentUserId) {
      return false;
    }
    // El creador tiene permiso
    if (task.creador.id === this.currentUserId) {
      return true;
    }
    // Un colaborador tiene permiso
    return task.colaboradores?.some(c => c.id === this.currentUserId) || false;
  }


  async openAddTaskModal() {
    const modal = await this.modalCtrl.create({
      component: AddTaskModalComponent,
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      this.authService.currentUser.pipe(take(1)).subscribe(user => {
        if (user) {
          const taskData = {
            ...data,
            creadorId: user.id,
            creadorNombre: user.nombre,
            colaboradores: data.colaboradores || [] // Aseguramos que se envíe el campo
          };
          this.http.post(`${environment.apiUrl}/tareas`, taskData).subscribe({
            next: (res) => {
              console.log('Tarea creada', res);
              this.loadTasks(); // Recargamos las tareas para ver la nueva
            },
            error: (err) => console.error('Error al crear tarea', err)
          });
        }
      });
    }
  }

  async openSearchStudentModal() {
    const modal = await this.modalCtrl.create({
      component: SearchStudentModalComponent,
    });
    await modal.present();
  }

  async openEditTaskModal(task: Tarea) {
    const modal = await this.modalCtrl.create({
      component: TaskEditModalComponent,
      componentProps: {
        task: task // Pasamos la tarea seleccionada al modal
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      // Si el modal se cerró con 'confirm', significa que se guardaron cambios.
      // Recargamos la página completa para asegurar que todos los cambios se reflejen.
      window.location.reload();
    }
  }

  async deleteTask(taskId: string, creatorId: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que quieres eliminar esta tarea? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Eliminar',
          handler: () => {
            // Añadimos el ID del usuario y su rol a los parámetros para la verificación en el backend
            const params = new HttpParams()
              .set('id', taskId)
              .set('userId', this.currentUserId || '')
              .set('userRole', this.isAdmin ? 'admin' : 'profesor');

            this.http.delete(`${environment.apiUrl}/tareas`, { params }).subscribe({
              next: () => {
                console.log(`Tarea con ID ${taskId} eliminada.`);
                // Filtramos la tarea eliminada de todas las listas locales
                this.todoTasks = this.todoTasks.filter(t => t.id !== taskId);
                this.doingTasks = this.doingTasks.filter(t => t.id !== taskId);
                this.doneTasks = this.doneTasks.filter(t => t.id !== taskId);
                // Actualizamos el gráfico
                this.updateDonutChartData();
              },
              error: (err) => {
                console.error('Error al eliminar la tarea', err);
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async openGradeModal(entrega: any, taskId: string) {
    const frasesCalificacion = {
      '10': '¡Excelente trabajo, superaste las expectativas!',
      '9': 'Muy buen trabajo, bien estructurado y completo.',
      '8': 'Buen trabajo, cumple con todos los requisitos.',
      '7': 'Aprobado, cumple con lo mínimo esperado.',
      'No Aprobada': 'No cumple con los requisitos mínimos, requiere revisión.'
    };

    const alert = await this.alertCtrl.create({
      header: `Calificar a ${entrega.studentNombre}`,
      inputs: Object.keys(frasesCalificacion).map(nota => ({
        name: 'calificacion',
        type: 'radio',
        label: `${nota} - ${frasesCalificacion[nota as keyof typeof frasesCalificacion]}`,
        value: nota,
        checked: false
      })),
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: (notaSeleccionada: string) => {
            if (!notaSeleccionada) return false; // No hacer nada si no se selecciona nada
            const calificacionData = {
              studentId: entrega.studentId,
              taskId: taskId,
              nota: notaSeleccionada,
              frase: frasesCalificacion[notaSeleccionada as keyof typeof frasesCalificacion],
              // Añadimos el ID y rol del usuario que califica para la verificación en el backend
              userId: this.currentUserId,
              userRole: this.isAdmin ? 'admin' : 'profesor'
            };
                // La solución: Llamamos a loadTasks() DENTRO del subscribe,
                // asegurando que se ejecute solo DESPUÉS de que el servidor confirme la calificación.
                // ACTUALIZACIÓN: Cambiamos loadTasks() por una recarga completa de la página.
                this.http.post(`${environment.apiUrl}/calificar`, calificacionData).subscribe({
                  next: () => window.location.reload(),
                  error: (err) => console.error('Error al calificar', err)
                });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  createDonutChart() {
    if (!this.donutCanvas) return;

    this.donutChart = new Chart(this.donutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['To-do', 'Doing', 'Done'],
        datasets: [{
          data: [0, 0, 0], // Inicia con datos vacíos, se actualizará al cargar tareas
          backgroundColor: [
            '#d35400', // Naranja para To-do
            '#f1c40f', // Amarillo para Doing
            '#5a9c00', // Verde para Done
          ],
          borderWidth: 0,
        }]
      },
      options: {
        cutout: '70%', // Grosor del anillo
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: { color: 'white' } // Asegura que las etiquetas sean visibles en el fondo oscuro
          }
        }
      }
    });
  }

  updateDonutChartData() {
    if (this.donutChart) {
      const data = [this.todoTasks.length, this.doingTasks.length, this.doneTasks.length];
      this.donutChart.data.datasets[0].data = data;
      this.donutChart.update();
    }
  }

  ngOnDestroy() {
    // Es una buena práctica desuscribirse para evitar fugas de memoria.
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}