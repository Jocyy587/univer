const express = require('express');
const cors = require('cors');
const multer = require('multer');
const admin = require('firebase-admin');

// ¡IMPORTANTE!
// Reemplaza './firebase-service-account.json' con la ruta a tu archivo JSON de clave de servicio.
// Se recomienda colocar este archivo en la misma carpeta 'Back' y añadirlo a tu .gitignore.
const serviceAccount = require('./firebase-service-account.json');
const app = express();

// Middleware para que el servidor entienda JSON y permita peticiones desde Ionic
app.use(cors());
app.use(express.json());

// Configuración de Multer para manejar la subida de archivos en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB por archivo
});

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://univer-7c625-default-rtdb.firebaseio.com",
    storageBucket: "univer-7c625.appspot.com" // Asegúrate de que este sea tu bucket
  });

  const db = admin.database();
  const bucket = admin.storage().bucket();
  console.log('¡Conexión exitosa con Firebase Realtime Database!');

  // --- API Endpoints ---

  // Endpoint para iniciar sesión
  app.post('/login', async (req, res) => {
    const { matricula, password } = req.body;

    if (!matricula || !password) {
      return res.status(400).json({ message: 'Matrícula y contraseña son requeridos.' });
    }

    try {
      const usersRef = db.ref('usuarios');
      const snapshot = await usersRef.orderByChild('matricula').equalTo(matricula).once('value');

      if (!snapshot.exists()) {
        return res.status(401).json({ message: 'Credenciales inválidas (usuario no encontrado).' });
      }

      const userKey = Object.keys(snapshot.val())[0];
      const userData = snapshot.val()[userKey];

      // 🚨 ADVERTENCIA DE SEGURIDAD: Comparación en texto plano. ¡No usar en producción!
      if (userData.contraseña !== password) {
        return res.status(401).json({ message: 'Credenciales inválidas (contraseña incorrecta).' });
      }

      // No enviar la contraseña al frontend
      const { contraseña, ...userToReturn } = userData;

      res.json({ message: 'Inicio de sesión exitoso', user: { id: userKey, ...userToReturn } });

    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  });

  // Endpoint para registrar un nuevo usuario
  app.post('/register', async (req, res) => {
    const { nombre, apellidos, matricula, correo, password } = req.body;

    if (!nombre || !apellidos || !matricula || !correo || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    try {
      const usersRef = db.ref('usuarios');

      // Verificar si la matrícula o el correo ya existen
      const matriculaSnapshot = await usersRef.orderByChild('matricula').equalTo(matricula).once('value');
      if (matriculaSnapshot.exists()) {
        return res.status(409).json({ message: 'La matrícula ya está en uso.' });
      }

      const correoSnapshot = await usersRef.orderByChild('correo').equalTo(correo).once('value');
      if (correoSnapshot.exists()) {
        return res.status(409).json({ message: 'El correo electrónico ya está en uso.' });
      }

      // Crear el nuevo usuario con el rol de "estudiante"
      const newUserRef = await usersRef.push({
        nombre,
        apellidos,
        matricula: String(matricula), // Forzamos que la matrícula se guarde como string
        correo,
        contraseña: password, // Guardamos la contraseña
        Rol: 'estudiante' // Rol asignado automáticamente
      });
      res.status(201).json({ message: 'Usuario registrado exitosamente', id: newUserRef.key });
    } catch (error) {
      console.error('Error en el registro:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  });

  // Endpoint para registrarse en una actividad extracurricular
  app.post('/extracurricular', async (req, res) => {
    // Extraemos los datos que envía el frontend
    const { nombre, apellidos, matricula, modulo, userId } = req.body;

    // Verificamos que los datos necesarios estén presentes
    if (!userId || !matricula || !modulo) {
      return res.status(400).json({ message: 'Faltan datos para el registro (usuario, matrícula o módulo).' });
    }

    try {
      // Creamos una referencia a una nueva "tabla" en Firebase llamada 'registros_extracurriculares'
      const registrosRef = db.ref('registros_extracurriculares');

      // Creamos un nuevo registro con los datos del estudiante y la fecha
      const nuevoRegistro = await registrosRef.push({
        userId,
        nombre,
        apellidos,
        matricula,
        modulo,
        fechaRegistro: new Date().toISOString() // Guardamos la fecha en que se registró
      });

      // Enviamos una respuesta de éxito al frontend
      res.status(201).json({ message: 'Registro a actividad extracurricular exitoso', id: nuevoRegistro.key });
    } catch (error) {
      console.error('Error al registrar en actividad extracurricular:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  });

  // Endpoint para verificar si un usuario ya está registrado en una actividad extracurricular
  app.get('/extracurricular/status/:userId', async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'El ID de usuario es requerido.' });
    }

    try {
      const registrosRef = db.ref('registros_extracurriculares');
      const snapshot = await registrosRef.orderByChild('userId').equalTo(userId).once('value');

      // Si snapshot.exists() es true, el usuario ya está registrado.
      res.json({ isRegistered: snapshot.exists() });

    } catch (error) {
      console.error('Error al verificar el estado de registro extracurricular:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  });


  // Endpoint para crear una nueva tarea
  app.post('/tareas', async (req, res) => {
    const { nombre, descripcion, creadorId, creadorNombre, estado } = req.body;

    if (!nombre || !descripcion || !creadorId || !creadorNombre) {
      return res.status(400).json({ message: 'El nombre, descripción y los datos del creador son requeridos.' });
    }

    try {
      const tareasRef = db.ref('tareas');
      const nuevaTarea = await tareasRef.push({
        nombre,
        descripcion,
        estado: estado || 'To-do', // Usamos el estado del body, o 'To-do' si no se proporciona
        fechaCreacion: new Date().toISOString(),
        creador: { id: creadorId, nombre: creadorNombre }
      });
      res.status(201).json({ message: 'Tarea creada exitosamente', id: nuevaTarea.key });
    } catch (error) {
      console.error('Error al crear la tarea:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  });

  // Endpoint para obtener todas las tareas
  app.get('/tareas', async (req, res) => {
    const { userId } = req.query; // Recibimos el ID del usuario que hace la petición

    try {
      const tareasRef = db.ref('tareas');
      const snapshot = await tareasRef.once('value');

      if (!snapshot.exists()) {
        return res.json([]); // Devuelve un array vacío si no hay tareas
      }

      const tareasData = snapshot.val();
      let tareasArray = Object.keys(tareasData).map(key => ({
        id: key,
        ...tareasData[key]
      }));

      // Si es un estudiante, personalizamos el estado de cada tarea
      if (userId) {
        // LÓGICA PARA ESTUDIANTE
        const tareasUsuarioRef = db.ref(`TareasPorUsuario/${userId}`);
        const snapshotTareasUsuario = await tareasUsuarioRef.once('value');
        const tareasDelUsuario = snapshotTareasUsuario.val() || {};

        tareasArray = tareasArray.map(tarea => {
          const entregaData = tareasDelUsuario[tarea.id];
          if (entregaData) {
            // Si hay datos de entrega, la tarea está 'Done' (si está calificada) o 'Doing' (si solo está entregada)
            const estadoEstudiante = entregaData.estado === 'Calificado' ? 'Done' : 'Doing';
            return {
              ...tarea,
              estado: estadoEstudiante,
              entrega: entregaData.entrega,
              calificacion: entregaData.calificacion // Incluimos la calificación si existe
            };
          } else {
            // Si no tiene un registro, la tarea está "pendiente" para este estudiante.
            return { ...tarea, estado: 'To-do' }; // Las tareas no tocadas son 'To-do'
          }
        });
      } else {
        // LÓGICA PARA PROFESOR/ADMIN
        const entregasRef = db.ref('TareasPorUsuario');
        const entregasSnapshot = await entregasRef.once('value');
        const todasLasEntregas = entregasSnapshot.val() || {};

        const usersRef = db.ref('usuarios');
        const usersSnapshot = await usersRef.once('value');
        const todosLosUsuarios = usersSnapshot.val() || {};

        tareasArray = tareasArray.map(tarea => {
          tarea.entregas = [];
          // Buscamos en todas las entregas de todos los usuarios
          for (const studentId in todasLasEntregas) {
            if (todasLasEntregas[studentId][tarea.id]) {
              const entrega = todasLasEntregas[studentId][tarea.id];
              const studentInfo = todosLosUsuarios[studentId];
              // Añadimos la entrega a la tarea, incluyendo quién la hizo
              tarea.entregas.push({ ...entrega, studentId, studentNombre: studentInfo?.nombre || 'Usuario Desconocido' });
            }
          }
          // Lógica de estado para el profesor:
          if (tarea.entregas && tarea.entregas.length > 0) {
            // Si CUALQUIER entrega está pendiente de calificar, la tarea está en 'Doing'.
            if (tarea.entregas.some(e => e.estado === 'Entregado')) {
              tarea.estado = 'Doing';
            } else {
              // Si TODAS las entregas están calificadas, la tarea está 'Done'.
              tarea.estado = 'Done';
            }
          }
          return tarea;
        });
      }

      res.json(tareasArray);
    } catch (error) {
      console.error('Error al obtener las tareas:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  });

  // Endpoint para actualizar una tarea (nombre y descripción)
  app.put('/tareas/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    if (!nombre || !descripcion) {
      return res.status(400).json({ message: 'El nombre y la descripción son requeridos.' });
    }

    try {
      const tareaRef = db.ref(`tareas/${id}`);
      await tareaRef.update({ nombre, descripcion });
      res.json({ message: 'Tarea actualizada correctamente.' });
    } catch (error) {
      console.error('Error al actualizar la tarea:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  });

  // Endpoint para que un profesor califique una entrega
  app.post('/calificar', async (req, res) => {
    const { studentId, taskId, nota, frase } = req.body;

    if (!studentId || !taskId || !nota || !frase) {
      return res.status(400).json({ message: 'Se requieren todos los datos para calificar.' });
    }

    try {
      const entregaRef = db.ref(`TareasPorUsuario/${studentId}/${taskId}`);

      // Actualizamos la entrega con la calificación y cambiamos el estado
      await entregaRef.update({
        estado: 'Calificado',
        calificacion: {
          nota,
          frase,
          fecha: new Date().toISOString()
        }
      });

      res.json({ message: 'Tarea calificada correctamente.' });
    } catch (error) {
      console.error('Error al calificar la tarea:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  });

  // Endpoint para que un estudiante entregue una tarea
  app.post('/tareas/:id/entregar', upload.single('archivo'), async (req, res) => {
    const { id } = req.params;
    const file = req.file;
    const { studentId } = req.body; // Necesitamos saber qué estudiante está entregando

    if (!file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo.' });
    }

    if (!studentId) {
      return res.status(400).json({ message: 'El ID del estudiante es requerido.' });
    }

    try {
      // Guardamos la entrega en la nueva tabla: TareasPorUsuario/{studentId}/{taskId}
      const tareaUsuarioRef = db.ref(`TareasPorUsuario/${studentId}/${id}`);
      
      // Actualizamos la tarea en la base de datos con el nombre del archivo
      await tareaUsuarioRef.set({
        estado: 'Entregado',
        entrega: {
          fecha: new Date().toISOString(),
          nombreArchivo: file.originalname
        }
      });

      res.json({ message: 'Tarea entregada exitosamente (solo nombre guardado).', nombreArchivo: file.originalname });
    } catch (error) {
      console.error('Error al entregar la tarea:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  });

  // Endpoint para que un profesor busque las tareas entregadas por un alumno
  app.get('/entregas/:matricula', async (req, res) => {
    const { matricula } = req.params;

    try {
      // 1. Encontrar el ID del usuario a partir de la matrícula
      const usersRef = db.ref('usuarios');
      const userSnapshot = await usersRef.orderByChild('matricula').equalTo(matricula).once('value');

      if (!userSnapshot.exists()) {
        return res.status(404).json({ message: 'Estudiante no encontrado.' });
      }

      const userId = Object.keys(userSnapshot.val())[0];

      // 2. Obtener las tareas entregadas por ese usuario
      const tareasUsuarioRef = db.ref(`TareasPorUsuario/${userId}`);
      const entregasSnapshot = await tareasUsuarioRef.once('value');

      if (!entregasSnapshot.exists()) {
        return res.json([]); // El estudiante no ha entregado ninguna tarea
      }

      const entregas = entregasSnapshot.val();
      const tareasIds = Object.keys(entregas).filter(taskId => entregas[taskId].estado === 'Done');

      if (tareasIds.length === 0) {
        return res.json([]);
      }

      // 3. Obtener los detalles de cada tarea entregada
      const tareasRef = db.ref('tareas');
      const tareasSnapshot = await tareasRef.once('value');
      const todasLasTareas = tareasSnapshot.val();

      const tareasCompletadas = tareasIds.map(taskId => ({
        ...todasLasTareas[taskId],
        id: taskId,
        ...entregas[taskId] // Añadimos el estado y los datos de la entrega
      }));

      res.json(tareasCompletadas);
    } catch (error) {
      console.error('Error al buscar entregas del estudiante:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  });

  // --- ENDPOINTS DE GESTIÓN DE USUARIOS (SOLO ADMIN) ---

  // Obtener todos los usuarios
  app.get('/usuarios', async (req, res) => {
    try {
      const usersRef = db.ref('usuarios');
      const snapshot = await usersRef.once('value');
      if (!snapshot.exists()) {
        return res.json([]);
      }
      const usersData = snapshot.val();
      // Mapeamos los usuarios para incluir su ID y quitar la contraseña
      const usersList = Object.keys(usersData).map(key => {
        const { contraseña, ...user } = usersData[key];
        return { id: key, ...user };
      });
      res.json(usersList);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  });

  // Crear un nuevo usuario (desde el panel de admin)
  app.post('/usuarios', async (req, res) => {
    const { nombre, apellidos, matricula, correo, contraseña, Rol } = req.body;

    if (!nombre || !apellidos || !matricula || !correo || !contraseña || !Rol) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    try {
      const usersRef = db.ref('usuarios');

      const matriculaSnapshot = await usersRef.orderByChild('matricula').equalTo(String(matricula)).once('value');
      if (matriculaSnapshot.exists()) {
        return res.status(409).json({ message: 'La matrícula ya está en uso.' });
      }

      const newUserRef = await usersRef.push({
        nombre,
        apellidos,
        matricula: String(matricula), // Forzamos que la matrícula se guarde como string
        correo,
        contraseña,
        Rol
      });
      res.status(201).json({ message: 'Usuario creado exitosamente', id: newUserRef.key });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  });

  // Actualizar un usuario
  app.put('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, apellidos, matricula, Rol } = req.body;

    if (!nombre || !apellidos || !matricula || !Rol) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    try {
      const userRef = db.ref(`usuarios/${id}`);
      await userRef.update({ nombre, apellidos, matricula, Rol });
      res.json({ message: 'Usuario actualizado correctamente.' });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  });

  // Reiniciar la contraseña de un usuario
  app.put('/usuarios/:id/reset-password', async (req, res) => {
    const { id } = req.params;
    const { nuevaContraseña } = req.body;

    if (!nuevaContraseña) {
      return res.status(400).json({ message: 'La nueva contraseña es requerida.' });
    }

    try {
      const userRef = db.ref(`usuarios/${id}`);
      await userRef.update({ contraseña: nuevaContraseña });
      res.json({ message: 'Contraseña reiniciada correctamente.' });
    } catch (error) {
      console.error('Error al reiniciar contraseña:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  });

  // Eliminar un usuario
  app.delete('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const userRef = db.ref(`usuarios/${id}`);
      await userRef.remove();
      // Consideración: También podrías querer eliminar datos relacionados
      // como sus registros en 'registros_extracurriculares' o 'TareasPorUsuario'.
      res.json({ message: 'Usuario eliminado correctamente.' });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  });

  // Endpoint para que un estudiante obtenga sus tareas calificadas
  app.get('/mis-calificaciones/:userId', async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'El ID de usuario es requerido.' });
    }

    try {
      // 1. Obtener las tareas entregadas por ese usuario
      const tareasUsuarioRef = db.ref(`TareasPorUsuario/${userId}`);
      const entregasSnapshot = await tareasUsuarioRef.once('value');

      if (!entregasSnapshot.exists()) {
        return res.json([]); // El estudiante no ha entregado ninguna tarea
      }

      const entregas = entregasSnapshot.val();
      // 2. Filtrar solo las que tienen estado 'Calificado'
      const tareasCalificadasIds = Object.keys(entregas).filter(taskId => entregas[taskId].estado === 'Calificado');

      if (tareasCalificadasIds.length === 0) {
        return res.json([]); // No hay tareas calificadas todavía
      }

      // 3. Obtener los detalles de cada tarea y añadir la calificación
      const tareasRef = db.ref('tareas');
      const tareasSnapshot = await tareasRef.once('value');
      const todasLasTareas = tareasSnapshot.val() || {};

      const resultado = tareasCalificadasIds.map(taskId => ({ ...todasLasTareas[taskId], id: taskId, ...entregas[taskId] }));

      res.json(resultado);
    } catch (error) {
      console.error('Error al obtener las calificaciones del estudiante:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  });

  // Endpoint para que un estudiante obtenga sus tareas EN REVISIÓN
  app.get('/mis-revisiones/:userId', async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'El ID de usuario es requerido.' });
    }

    try {
      // 1. Obtener las tareas entregadas por ese usuario
      const tareasUsuarioRef = db.ref(`TareasPorUsuario/${userId}`);
      const entregasSnapshot = await tareasUsuarioRef.once('value');

      if (!entregasSnapshot.exists()) {
        return res.json([]); // El estudiante no ha entregado ninguna tarea
      }

      const entregas = entregasSnapshot.val();
      // 2. Filtrar solo las que tienen estado 'Entregado' (pendientes de calificar)
      const tareasEnRevisionIds = Object.keys(entregas).filter(taskId => entregas[taskId].estado === 'Entregado');

      if (tareasEnRevisionIds.length === 0) {
        return res.json([]); // No hay tareas en revisión
      }

      // 3. Obtener los detalles de cada tarea
      const tareasRef = db.ref('tareas');
      const tareasSnapshot = await tareasRef.once('value');
      const todasLasTareas = tareasSnapshot.val() || {};

      const resultado = tareasEnRevisionIds.map(taskId => ({ ...todasLasTareas[taskId], id: taskId, ...entregas[taskId] }));
      res.json(resultado);
    } catch (error) {
      console.error('Error al obtener las tareas en revisión del estudiante:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  });

  // Iniciar el servidor para que escuche peticiones
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Servidor API corriendo en http://localhost:${PORT}`);
  });

} catch (error) {
  console.error('Error al conectar con Firebase:', error);
}
