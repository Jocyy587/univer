import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-extracurricular',
  templateUrl: './extracurricular.page.html',
  styleUrls: ['./extracurricular.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ExtracurricularPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
