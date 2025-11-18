import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-task-modal',
  templateUrl: './add-task-modal.component.html',
  styleUrls: ['./add-task-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule]
})
export class AddTaskModalComponent implements OnInit {
  taskForm: FormGroup;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder
  ) {
    this.taskForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit() {}

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  submit() {
    if (this.taskForm.valid) {
      return this.modalCtrl.dismiss(this.taskForm.value, 'confirm');
    }
    return this.modalCtrl.dismiss(null, 'invalid');
  }
}