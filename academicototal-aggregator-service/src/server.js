// src/server.js

// 1. Carga variables de entorno (PORT, AUTH_SERVICE_URL)
require('dotenv').config(); 
const express = require('express');
const orchestratorRoutes = require('./routes/orchestratorRoutes'); // Importaremos el router

const app = express();
const PORT = process.env.PORT || 3000;

// 2. Middleware para procesar JSON
app.use(express.json());

// 3. Conexión de las Rutas de Orquestación al prefijo /api/v1
// [DOCUMENTACION] Este es el prefijo que el cliente final utiliza.
app.use('/api/v1', orchestratorRoutes); 

// Ruta de prueba
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: '🛡️ Data Aggregator de AcademicoTotal OK.',
    role: 'Capa de Orquestación y API Gateway'
  });
});

// 4. Inicia el servidor
app.listen(PORT, () => {
  console.log(`🛡️ Orquestador (Aggregator) corriendo en: http://localhost:${PORT}`);
});