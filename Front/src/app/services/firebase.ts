import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Usuario } from './usuario.model';

@Injectable({
  providedIn: 'root',
})
export class Firebase {
  

  // La URL de tu API. Si cambia, solo la modificas aquí.
  constructor(private http: HttpClient) { }

  getUsuarios(): Observable<Usuario[]> {
    // El backend ahora devuelve un array directamente, así que ya no necesitamos el 'map'.
    return this.http.get<Usuario[]>(`${environment.apiUrl}/usuarios`);
  }
 getExtracurricularStatus(userId: string): Observable<{ isRegistered: boolean }> {
  return this.http.get<{ isRegistered: boolean }>(`${environment.apiUrl}/extracurricular/status/${userId}`);

}
  // Nuevo método para iniciar sesión
  login(matricula: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/login`, { matricula, password });
  }
 
}