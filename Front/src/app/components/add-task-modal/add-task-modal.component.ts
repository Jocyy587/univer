import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { take } from 'rxjs';

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
    private http: HttpClient,
    private authService: AuthService // Inyectamos el servicio de autenticación
  ) {
    this.taskForm = this.fb.group({
      tipo: ['estudiante', Validators.required], // Nuevo campo para el tipo
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      // Los colaboradores ahora son solo un array de IDs
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

  // La función que se ejecuta al enviar el formulario
  saveTask() {
    if (this.taskForm.invalid) {
      return;
    }

    this.authService.currentUser.pipe(take(1)).subscribe(user => {
      if (!user) {
        console.error('No se pudo obtener el usuario actual');
        return;
      }

      const formValue = this.taskForm.value;

      // 1. Determinamos el endpoint basado en el tipo seleccionado
      const endpoint = formValue.tipo === 'maestro' 
        ? `${environment.apiUrl}/asignaciones` 
        : `${environment.apiUrl}/tareas`;

      // 2. Construimos el objeto de datos a enviar
      const taskData = {
        nombre: formValue.nombre,
        descripcion: formValue.descripcion,
        creadorId: user.id,
        creadorNombre: user.nombre,
        // Mapeamos los IDs de colaboradores a objetos {id, nombre}
        colaboradores: this.maestros
          .filter(m => formValue.colaboradores.includes(m.id))
          .map(m => ({ id: m.id, nombre: m.nombre }))
      };

      // 3. Enviamos la petición POST
      this.http.post(endpoint, taskData).subscribe({
        next: () => {
          // Si tiene éxito, cerramos el modal y enviamos una señal de 'confirm'
          this.modalCtrl.dismiss({ saved: true }, 'confirm');
        },
        error: (err) => console.error(`Error al crear en ${endpoint}`, err)
      });
    });
  }
}