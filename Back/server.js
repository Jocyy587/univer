const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// ¡IMPORTANTE!
// Reemplaza './firebase-service-account.json' con la ruta a tu archivo JSON de clave de servicio.
// Se recomienda colocar este archivo en la misma carpeta 'Back' y añadirlo a tu .gitignore.
const serviceAccount = require('./firebase-service-account.json');
const app = express();

// Middleware para que el servidor entienda JSON y permita peticiones desde Ionic
app.use(cors());
app.use(express.json());

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://univer-7c625-default-rtdb.firebaseio.com"
  });

  const db = admin.database();
  console.log('¡Conexión exitosa con Firebase Realtime Database!');

  // --- API Endpoints ---

  // Endpoint para obtener todos los usuarios
  app.get('/usuarios', async (req, res) => {
    try {
      const usersRef = db.ref('usuarios');
      const snapshot = await usersRef.once('value');
      const usuarios = snapshot.val();

      if (usuarios) {
        res.json(usuarios);
      } else {
        res.status(404).json({ message: 'No se encontraron usuarios.' });
      }
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  });

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

      // Log en la consola del backend para confirmar el éxito
      console.log(`✅ Inicio de sesión exitoso para el usuario: ${userData.nombre} (Matrícula: ${matricula})`);

      res.json({ message: 'Inicio de sesión exitoso', user: { id: userKey, ...userToReturn } });

    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
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
