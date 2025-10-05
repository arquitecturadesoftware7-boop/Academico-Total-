// src/routes/studentRoutes.js

const express = require('express');
const StudentController = require('../controllers/StudentController');
const internalAuthMiddleware = require('../middlewares/internalAuthMiddleware'); 

const router = express.Router();

// Aplica el middleware interno a TODAS las rutas para proteger el servicio
router.use(internalAuthMiddleware); 

// Rutas internas protegidas:
// 1. Creación (Registro completo orquestado)
router.post('/profiles', StudentController.createProfile);

// 2. Obtención de Perfil
router.get('/profiles/:studentId', StudentController.getProfile);

// 3. Obtención de Identidad (ENDPOINT NUEVO y crítico para el login)
router.post('/login', StudentController.login); // <--- NUEVA RUTA DE LOGIN INTERNO

module.exports = router;