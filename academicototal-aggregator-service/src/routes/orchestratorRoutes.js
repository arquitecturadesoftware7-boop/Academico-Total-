// src/routes/orchestratorRoutes.js

const express = require('express');
const AggregatorController = require('../controllers/AggregatorController');

const router = express.Router();

// [DOCUMENTACION] Endpoint que el cliente final llama.
// El cliente NO ve /auth, solo /login en la ruta del orquestador.
router.post('/login', AggregatorController.login);

module.exports = router;