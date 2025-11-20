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
        matricula,
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
        const tareasUsuarioRef = db.ref(`TareasPorUsuario/${userId}`);
        const snapshotTareasUsuario = await tareasUsuarioRef.once('value');
        const tareasDelUsuario = snapshotTareasUsuario.val() || {};

        tareasArray = tareasArray.map(tarea => {
          const estadoPersonal = tareasDelUsuario[tarea.id];
          if (estadoPersonal) {
            // Si el estudiante tiene un registro para esta tarea (ej: una entrega), usamos su estado y datos
            return {
              ...tarea,
              estado: estadoPersonal.estado,
              entrega: estadoPersonal.entrega
            };
          } else {
            // Si no tiene un registro, la tarea está "pendiente" para este estudiante.
            return { ...tarea, estado: 'Doing' }; // Por defecto, las tareas no entregadas están en "Doing"
          }
        });
      }

      res.json(tareasArray);
    } catch (error) {
      console.error('Error al obtener las tareas:', error);
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
        estado: 'Done',
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

  // Iniciar el servidor para que escuche peticiones
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Servidor API corriendo en http://localhost:${PORT}`);
  });

} catch (error) {
  console.error('Error al conectar con Firebase:', error);
}
