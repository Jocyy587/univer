import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Firebase } from './firebase';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

// Interfaz para el objeto de usuario que almacenaremos en la sesión
interface UserSession {
  id: string;
  correo: string;
  matricula: string;
  nombre: string;
  Rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // BehaviorSubject para el estado de autenticación (true/false)
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  // BehaviorSubject para el usuario actual (null si no hay sesión)
  private _currentUser = new BehaviorSubject<UserSession | null>(null);

  // Observables públicos para que los componentes puedan suscribirse
  isAuthenticated = this._isAuthenticated.asObservable();
  currentUser = this._currentUser.asObservable();

  constructor(
    private firebaseService: Firebase,
    private router: Router
  ) {
    // Intentar cargar la sesión del almacenamiento local al iniciar el servicio
    this.loadSession();
  }

  private loadSession() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user: UserSession = JSON.parse(storedUser);
      this._currentUser.next(user);
      this._isAuthenticated.next(true);
    }
  }

  login(matricula: string, password: string): Observable<any> {
    return this.firebaseService.login(matricula, password).pipe(
      tap(response => {
        // --- INICIO: Log para depuración ---
        console.log('Respuesta del backend al iniciar sesión:', response);
        const user: UserSession = response.user;
        localStorage.setItem('currentUser', JSON.stringify(user)); // Guardar en localStorage
        this._currentUser.next(user);
        this._isAuthenticated.next(true);
      })
    );
  }

  logout() {
    localStorage.removeItem('currentUser'); // Limpiar localStorage
    this._currentUser.next(null);
    this._isAuthenticated.next(false);
    this.router.navigateByUrl('/login'); // Redirigir a la página de login
  }
}