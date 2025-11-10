import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonAccordionGroup, IonAccordion, IonItem, IonLabel } from '@ionic/angular/standalone';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-actividades',
  templateUrl: './actividades.page.html',
  styleUrls: ['./actividades.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonAccordionGroup, IonAccordion, IonItem, IonLabel, CommonModule, FormsModule]
})
export class ActividadesPage implements OnInit, AfterViewInit {
  @ViewChild('donutCanvas') private donutCanvas?: ElementRef;

  donutChart: any;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.createDonutChart();
  }

  createDonutChart() {
    Chart.register(...registerables);
    if (!this.donutCanvas) return;

    this.donutChart = new Chart(this.donutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Completadas', 'En Progreso', 'Pendientes'],
        datasets: [{
          data: [12, 19, 5], // Datos de ejemplo
          backgroundColor: [
            'rgba(90, 156, 0, 1)',   // Verde sólido
            'rgba(211, 84, 0, 1)',   // Naranja sólido
            'rgba(140, 109, 54, 1)' // Amarillo/Dorado sólido
          ],
          borderColor: [
            'rgba(90, 156, 0, 1)',
            'rgba(211, 84, 0, 1)',
            'rgba(140, 109, 54, 1)'
          ],
          borderWidth: 3 // Un borde un poco más grueso
        }]
      },
      options: {
        responsive: true,
        cutout: '70%',
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }
}
