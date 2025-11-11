import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { Usuario } from './usuario.model';

@Injectable({
  providedIn: 'root',
})
export class Firebase {
  

  // La URL de tu API. Si cambia, solo la modificas aquí.
  private apiUrl = '/api';

  constructor(private http: HttpClient) { }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<{ [key: string]: Omit<Usuario, 'id'> }>(`${this.apiUrl}/usuarios`).pipe(
      map(data => {
        // Transformamos el objeto que devuelve Firebase en un array de Usuarios
        // para que sea más fácil de usar en el frontend con *ngFor.
        return Object.keys(data).map(key => ({ id: key, ...data[key] }));
      })
    );
  }

  // Nuevo método para iniciar sesión
  login(matricula: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { matricula, password });
  }
}
