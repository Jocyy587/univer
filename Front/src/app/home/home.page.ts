import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
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
import { leafOutline, playCircleOutline, chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { RouterModule } from '@angular/router';
import { InfoModalComponent } from '../components/info-modal/info-modal.component';

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
    InfoModalComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomePage {
  @ViewChild('projectsSlides') projectsSlides: any;
  constructor(private modalCtrl: ModalController) {
    // Registra los íconos para que puedan ser usados en el template
  addIcons({ leafOutline, playCircleOutline, chevronBackOutline, chevronForwardOutline });
  }

  // Opciones para ion-slides (Swiper options)
  // We use a simple DOM scroller for the carousel. slideOpts kept for reference.
  slideOpts = {
    direction: 'horizontal',
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    centeredSlides: true,
    pagination: { clickable: true },
  };

  nextSlide() {
    try {
      const el = this.projectsSlides?.nativeElement || this.projectsSlides;
      if (!el) return;
      const slideWidth = el.querySelector('.project-slide')?.offsetWidth || el.clientWidth * 0.9;
      el.scrollBy({ left: slideWidth + 24, behavior: 'smooth' });
    } catch (e) { console.warn(e); }
  }

  prevSlide() {
    try {
      const el = this.projectsSlides?.nativeElement || this.projectsSlides;
      if (!el) return;
      const slideWidth = el.querySelector('.project-slide')?.offsetWidth || el.clientWidth * 0.9;
      el.scrollBy({ left: -(slideWidth + 24), behavior: 'smooth' });
    } catch (e) { console.warn(e); }
  }

  /**
   * Ensure the hovered card is visible vertically so the title that moves on hover
   * doesn't get clipped. Called from (mouseenter) on the card element.
   */
  ensureCardVisible(event: Event) {
    try {
      // currentTarget is present on MouseEvent and TouchEvent as EventTarget | null
      const card = (event.currentTarget as HTMLElement) || (event.target as HTMLElement);
      if (!card) return;

      // calculate bounding rects
      const rect = card.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      // desired bottom offset (leave room so the title is visible, account for sticky header)
      const headerEl = document.querySelector('ion-header');
      const headerHeight = headerEl ? (headerEl as HTMLElement).offsetHeight : 64;
      const desiredBottom = viewportHeight - headerHeight - 24; // 24px breathing room

      // if the card's bottom is below the desired bottom, scroll the page down a bit
      if (rect.bottom > desiredBottom) {
        const delta = rect.bottom - desiredBottom;
        window.scrollBy({ top: delta + 8, behavior: 'smooth' });
      }

      // if the card is above the header (rare), scroll up
      if (rect.top < headerHeight + 8) {
        const deltaUp = rect.top - (headerHeight + 8);
        window.scrollBy({ top: deltaUp - 8, behavior: 'smooth' });
      }
    } catch (e) { console.warn('ensureCardVisible', e); }
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

  toggleMemberCard(event: MouseEvent) {
    const clickedCard = (event.currentTarget as HTMLElement);

    // Cerramos todas las demás tarjetas que puedan estar abiertas
    const allCards = document.querySelectorAll('.member-card');
    allCards.forEach(card => {
      if (card !== clickedCard) {
        card.classList.remove('active');
      }
    });

    // Abrimos o cerramos la tarjeta clickeada
    clickedCard.classList.toggle('active');
  }
}
