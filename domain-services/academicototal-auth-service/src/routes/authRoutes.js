const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

router.post('/login', AuthController.login);

router.post('/token/refresh', AuthController.refreshToken); 

router.post('/token/verify', AuthController.verifyToken); 

module.exports = router;