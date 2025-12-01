import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // 1. Importar CommonModule

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';


@Component({
  selector: 'app-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    CommonModule  ],
})
export class InfoModalComponent {
  // @Input() permite que pasemos el título desde la página principal
  @Input() title: string = 'Información';

  constructor(private modalCtrl: ModalController) {
    addIcons({ close });
  }

  // Función para cerrar el modal
  dismiss() {
    this.modalCtrl.dismiss();
  }
}
