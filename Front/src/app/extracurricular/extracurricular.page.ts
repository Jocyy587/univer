import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonThumbnail,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { leafOutline } from 'ionicons/icons';

@Component({
  selector: 'app-extracurricular',
  templateUrl: './extracurricular.page.html',
  styleUrls: ['./extracurricular.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    RouterModule,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonThumbnail,
  ],
})
export class ExtracurricularPage implements OnInit {
  credentials = {
    nombre: '',
    matricula: '',
    correo: '',
    password: '',
    confirmPassword: '',
  };

  constructor() {
    addIcons({ leafOutline });
  }

  ngOnInit() {}

  onRegister() {
    console.log('Registrando con:', this.credentials);
    // Aquí puedes agregar tu lógica de registro.
  }

  openModal(title: string) {
    // Lógica para abrir un modal. Por ahora, solo un console.log
    console.log('Abrir modal para:', title);
  }
}
