// src/routes/authRoutes.js (FINALIZADO)

const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

// [ELIMINADO] La ruta /register ya no existe

router.post('/login', AuthController.login);

router.post('/token/refresh', AuthController.refreshToken); 

// [NUEVA RUTA] Usada por el Data Aggregator para verificar tokens
router.post('/token/verify', AuthController.verifyToken); 

module.exports = router;