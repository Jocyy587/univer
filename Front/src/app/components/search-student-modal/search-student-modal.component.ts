import { Component } from '@angular/core';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-search-student-modal',
  templateUrl: './search-student-modal.component.html',
  styleUrls: ['./search-student-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SearchStudentModalComponent {
  matricula: string = '';
  studentTasks: any[] = [];
  isLoading: boolean = false;
  searched: boolean = false;
  studentName: string = '';

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private alertController: AlertController
  ) { }

  cancel() {
    this.modalCtrl.dismiss();
  }

  search() {
    if (!this.matricula.trim()) return;
    this.isLoading = true;
    this.searched = true;
    this.http.get<any[]>(`${environment.apiUrl}/entregas/${this.matricula}`).subscribe({
      next: (tasks) => {
        this.studentTasks = tasks;
        this.studentName = tasks.length > 0 ? tasks[0].creador.nombre : ''; // Asumiendo que el creador es el mismo
        this.isLoading = false;
      },
      error: async (err) => {
        this.isLoading = false;
        this.studentTasks = [];
        const alert = await this.alertController.create({ header: 'Error', message: err.error.message || 'Estudiante no encontrado', buttons: ['OK'] });
        await alert.present();
      }
    });
  }
}
