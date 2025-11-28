import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-task-modal',
  templateUrl: './add-task-modal.component.html',
  styleUrls: ['./add-task-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule] // Imports necesarios para el componente
})
export class AddTaskModalComponent implements OnInit {
  taskForm: FormGroup;
  maestros: any[] = []; // <-- La propiedad que faltaba

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private http: HttpClient
  ) {
    this.taskForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      colaboradores: [[]]
    });
  }

  ngOnInit() {
    this.loadMaestros();
  }

  loadMaestros() {
    this.http.get<any[]>(`${environment.apiUrl}/usuarios/maestros`).subscribe({
      next: (data) => { this.maestros = data; },
      error: (err) => console.error('Error al cargar la lista de maestros', err)
    });
  }

  cancel() { return this.modalCtrl.dismiss(null, 'cancel'); }

  submit() {
    if (this.taskForm.invalid) {
      return; // Si el formulario no es válido, no hacemos nada.
    }
    // Si el formulario es válido, cerramos el modal y enviamos los datos.
    return this.modalCtrl.dismiss(this.taskForm.value, 'confirm');
  }
}