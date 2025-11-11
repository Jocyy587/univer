export interface Usuario {
  id: string;
  correo: string;
  matricula: string;
  nombre: string;
  Rol: string;
  // No incluimos la contraseña en el modelo del frontend por seguridad.
}
