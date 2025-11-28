import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { StudentActivitieComponent } from '../components/student-activitie/student-activitie.component';

@Component({
  selector: 'app-asignaciones',
  templateUrl: './asignaciones.page.html',
  styleUrls: ['./asignaciones.page.scss'],
  standalone: true,
  // Importamos los módulos necesarios y el componente de actividades del estudiante
  imports: [IonicModule, CommonModule, StudentActivitieComponent]
})
export class AsignacionesPage {

  constructor() { }

}