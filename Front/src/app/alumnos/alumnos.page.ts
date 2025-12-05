import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonSearchbar, IonList, IonItem, IonLabel, IonAvatar, IonNote, IonSpinner, IonButtons, IonMenuButton, IonAccordionGroup, IonAccordion, IonIcon } from '@ionic/angular/standalone';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Asegúrate de tener HttpClientModule en tu app.module o standalone component
import { environment } from 'src/environments/environment'; // Importamos el environment
import { Subject, finalize } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs/operators';

// Interfaz para tipar los datos del alumno
export interface Alumno {
  id: string;
  nombre: string;
  apellidos: string;
  matricula: string;
  correo: string;
}

@Component({
  selector: 'app-alumnos',
  templateUrl: './alumnos.page.html',
  styleUrls: ['./alumnos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule, // Importante para que funcione HttpClient
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonAvatar,
    IonNote,
    IonSpinner,
    IonButtons,
    IonMenuButton,
    IonAccordionGroup,
    IonAccordion,
    IonIcon
  ]
})
export class AlumnosPage implements OnInit {
  
  public allAlumnos: Alumno[] = [];
  public filteredAlumnos: Alumno[] = [];
  public isLoading = true;

  private searchTerms = new Subject<string>();

  // Usamos la URL de tu API real desde el archivo de environment
  private apiUrl = `${environment.apiUrl}/usuarios?role=estudiante`; 

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadInitialData();
    this.setupSearch();
  }

  loadInitialData() {
    this.isLoading = true;
    this.http.get<Alumno[]>(this.apiUrl).pipe(
      finalize(() => this.isLoading = false) // Se asegura de que isLoading se ponga en false al terminar
    ).subscribe({
      next: (data) => {
        this.allAlumnos = data || []; // Asignamos los datos reales o un array vacío si no viene nada
        this.filteredAlumnos = this.allAlumnos;
      },
      error: (err) => {
        console.error('Error al obtener los alumnos desde el API', err);
        this.allAlumnos = []; // En caso de error, dejamos la lista vacía
        this.filteredAlumnos = [];
      }
    });
  }

  setupSearch() {
    this.searchTerms.pipe(
      // Espera 300ms después de cada pulsación antes de considerar el término
      debounceTime(300),
      // Ignora el nuevo término si es igual al anterior
      distinctUntilChanged(),
      // Cambia a la nueva búsqueda cada vez que el término cambia
      startWith('')
    ).subscribe(term => {
      this.filterAlumnos(term);
    });
  }

  // Se llama cada vez que el usuario escribe en la barra de búsqueda
  search(event: any) {
    const term = event.target.value || '';
    this.searchTerms.next(term);
  }

  filterAlumnos(searchTerm: string) {
    if (!searchTerm) {
      this.filteredAlumnos = this.allAlumnos;
      return;
    }

    this.filteredAlumnos = this.allAlumnos.filter(alumno => 
      alumno.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumno.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumno.matricula.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}