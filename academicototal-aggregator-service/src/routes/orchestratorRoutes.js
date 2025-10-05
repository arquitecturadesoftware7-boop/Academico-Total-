// src/routes/orchestratorRoutes.js (FINALIZADO)

const express = require('express');
const AggregatorController = require('../controllers/AggregatorController');
const authMiddleware = require('../middlewares/authMiddleware'); // Importación

const router = express.Router();

// -------------------------------------------------------------------
// Rutas Públicas (No requieren Token)
// -------------------------------------------------------------------
router.post('/register/student', AggregatorController.registerStudent); 
router.post('/login', AggregatorController.login);
router.post('/token/refresh', AggregatorController.refreshToken);

// -------------------------------------------------------------------
// Rutas Protegidas (Requieren Access Token Válido)
// -------------------------------------------------------------------

// 1. El middleware de JWT valida el token antes de pasar al controlador.
// 2. El controlador usa req.user.id y req.user.role.
router.get('/profiles', authMiddleware, AggregatorController.getUserProfile); 

module.exports = router;