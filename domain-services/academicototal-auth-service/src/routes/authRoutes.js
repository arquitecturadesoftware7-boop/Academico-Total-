// src/routes/authRoutes.js

const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

// [DOCUMENTACION] POST /register: Usado para crear cuentas iniciales.
router.post('/register', AuthController.register);

// [DOCUMENTACION] POST /login: EL endpoint clave. Lo consume el Data Aggregator 
// para iniciar la orquestacion de una sesion de usuario.
router.post('/login', AuthController.login);

module.exports = router;