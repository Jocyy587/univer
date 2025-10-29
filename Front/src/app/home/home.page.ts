import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonIcon,
  IonMenuButton,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonCard,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { leafOutline, playCircleOutline } from 'ionicons/icons';
import { RouterModule } from '@angular/router';
import { InfoModalComponent } from 'src/app/components/info-modal/info-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true, // Es importante marcarlo como standalone
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonIcon,
    IonMenuButton,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonList,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonCard,
    RouterModule, // Añadimos RouterModule para que [routerLink] funcione
    InfoModalComponent, // ¡Añade el componente del modal aquí!
  ],
})
export class HomePage {
  constructor(private modalCtrl: ModalController) {
    // Registra los íconos para que puedan ser usados en el template
    addIcons({ leafOutline, playCircleOutline });
  }

  async openModal(cardTitle: string) {
    const modal = await this.modalCtrl.create({
      component: InfoModalComponent,
      // Pasa el título de la tarjeta al componente del modal
      componentProps: {
        title: cardTitle,
      },
    });
    await modal.present();
  }
}
