import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { leafOutline, hourglassOutline, checkmarkDoneCircleOutline, cloudUploadOutline, sunnyOutline, schoolOutline, checkmarkCircle } from 'ionicons/icons';

import { AuthService } from '../services/auth.service';
import { environment } from 'src/environments/environment';
import { Observable, Subscription, take, filter } from 'rxjs';

import { StudentActivitieComponent } from 'src/app/components/student-activitie/student-activitie.component';
interface ExtracurricularData {
  nombre: string;
  apellidos: string;
  matricula: string;
  modulo: string;
  userId: string;
}

@Component({
  selector: 'app-extracurricular',
  templateUrl: './extracurricular.page.html',
  styleUrls: ['./extracurricular.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink, StudentActivitieComponent],
})
export class ExtracurricularPage implements OnInit, OnDestroy {

  registroData: ExtracurricularData | null = null;
  isRegistered$: Observable<boolean>;
  private userSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({ leafOutline, hourglassOutline, checkmarkDoneCircleOutline, cloudUploadOutline, sunnyOutline, schoolOutline, checkmarkCircle });
    this.isRegistered$ = this.authService.isRegisteredExtracurricular;
  }

  ngOnInit() {
    this.userSubscription = this.authService.isAuthenticated.pipe(
      // Usamos take(1) para solo comprobar una vez al cargar la página
      take(1) 
    ).subscribe(isAuthenticated => {
      if (!isAuthenticated) {
        // Si no está autenticado, lo mandamos a la página de login
        this.router.navigate(['/login']);
      } else {
        // Si está autenticado, procedemos a cargar los datos del usuario para el formulario
        this.authService.currentUser.pipe(take(1)).subscribe(user => {
          if (user) {
            this.registroData = {
              nombre: user.nombre,
              apellidos: user.apellidos,
              matricula: user.matricula,
              modulo: '', // El usuario debe llenar este campo
              userId: user.id
            };
          }
        });
      }
    });    
  }

  onRegister() {
    if (!this.registroData) return;

    // El endpoint '/extracurricular' es un ejemplo, debes crearlo en tu backend
    this.http.post(`${environment.apiUrl}/extracurricular`, this.registroData).subscribe({
      next: async (res) => {
        const toast = await this.toastController.create({
          message: '¡Te has registrado a la actividad extracurricular con éxito!',
          duration: 3000,
          color: 'success',
          position: 'top'
        });
        await toast.present();
        // Actualizamos el estado global para que la vista cambie inmediatamente
        this.authService.setExtracurricularStatus(true);
        // Opcional: Redirigir a otra página tras el registro exitoso
        // this.router.navigate(['/home']);
      },
      error: async (err) => {
        console.error('Error en el registro', err);
        const toast = await this.toastController.create({
          message: 'Hubo un error al registrarte. Inténtalo de nuevo.',
          duration: 3000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
      }
    });
  }

  // Mantén tus otras funciones si las necesitas, como openModal
  openModal(title: string) {
    console.log('Abrir modal para:', title);
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}