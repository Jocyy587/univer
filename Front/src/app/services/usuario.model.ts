export interface Usuario {
  id: string;
  correo: string;
  matricula: string;
  nombre: string;
  Rol: string;
  apellidos: string; // <--- AÑADE ESTA LÍNEA

}

export interface UserSession {
  id: string;
  nombre: string;
  apellidos: string; // <--- AÑADE ESTA LÍNEA
  matricula: string;
  correo: string;
  Rol: string;
}