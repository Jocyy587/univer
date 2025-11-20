import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { Observable, Subscription, take } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { AddTaskModalComponent } from '../components/add-task-modal/add-task-modal.component';
import { SearchStudentModalComponent } from '../components/search-student-modal/search-student-modal.component';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { addIcons } from 'ionicons';
import { addOutline, leafOutline, documentAttachOutline, searchOutline, checkmarkCircle, hourglassOutline, checkmarkDoneCircleOutline, cloudUploadOutline, sunnyOutline, schoolOutline } from 'ionicons/icons';
import { StudentActivitieComponent } from 'src/app/components/student-activitie/student-activitie.component';

// Definimos una interfaz para las tareas para tener un tipado fuerte
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

  @ViewChild('donutCanvas') private donutCanvas?: ElementRef;
  donutChart: any;
  private userSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private modalCtrl: ModalController,
    private http: HttpClient
  ) {
    addIcons({ addOutline, leafOutline, documentAttachOutline, searchOutline, checkmarkCircle, hourglassOutline, checkmarkDoneCircleOutline, cloudUploadOutline, sunnyOutline, schoolOutline });
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
          this.doneTasks = tasks.filter(t => t.estado === 'Done');

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
            creadorNombre: user.nombre
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