import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Firebase } from './firebase';
import { switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';import { UserSession } from './usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // BehaviorSubject para el estado de autenticación (true/false)
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  // BehaviorSubject para el usuario actual (null si no hay sesión)
  private _currentUser = new BehaviorSubject<UserSession | null>(null);
  // NUEVO: BehaviorSubject para el estado de registro extracurricular
  private _isRegisteredExtracurricular = new BehaviorSubject<boolean>(false);

  // Observables públicos para que los componentes puedan suscribirse
  isAuthenticated = this._isAuthenticated.asObservable();
  currentUser = this._currentUser.asObservable();
  // NUEVO: Observable público para el estado de registro
  isRegisteredExtracurricular = this._isRegisteredExtracurricular.asObservable();

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
      // Al cargar la sesión, también verificamos su estado de registro
      this.checkExtracurricularStatus(user.id).subscribe();
    }
  }

  login(matricula: string, password: string): Observable<any> {
    return this.firebaseService.login(matricula, password).pipe(
      switchMap(response => {
        const user: UserSession = response.user;
        localStorage.setItem('currentUser', JSON.stringify(user)); // Guardar en localStorage
        this._currentUser.next(user);
        this._isAuthenticated.next(true);
        // Después de iniciar sesión, verificamos el estado y devolvemos la respuesta original
        return this.checkExtracurricularStatus(user.id).pipe(
          tap(() => console.log('Estado extracurricular verificado tras login.')),
          switchMap(() => of(response)) // Devolvemos la respuesta original del login
        );
      })
    );
  }

  // NUEVO: Método para verificar el estado de registro
  checkExtracurricularStatus(userId: string): Observable<{ isRegistered: boolean }> {
    return this.firebaseService.getExtracurricularStatus(userId).pipe(
      tap((response: { isRegistered: boolean }) => {
        this._isRegisteredExtracurricular.next(response.isRegistered);
      })
    );
  }

  // NUEVO: Método para actualizar manualmente el estado tras un registro exitoso
  setExtracurricularStatus(isRegistered: boolean) {
    this._isRegisteredExtracurricular.next(isRegistered);
  }

  logout() {
    localStorage.removeItem('currentUser'); // Limpiar localStorage
    this._currentUser.next(null);
    this._isAuthenticated.next(false);
    this._isRegisteredExtracurricular.next(false); // Reseteamos el estado al cerrar sesión
    this.router.navigateByUrl('/login'); // Redirigir a la página de login
  }
  
}