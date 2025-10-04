// src/controllers/AuthController.js

const AuthService = require('../services/AuthService');

class AuthController {
    
    // ----------------------------------------------------
    // Controlador para registrar un nuevo usuario (POST /register)
    // ----------------------------------------------------
    async register(req, res) {
        try {
            const { name, email, password, role } = req.body;
            
            const newUser = await AuthService.registerUser(name, email, password, role);
            
            res.status(201).json({
                message: 'Usuario registrado exitosamente.',
                user: newUser
            });
        } catch (error) {
            if (error.message.includes('ya está registrado')) {
                return res.status(409).json({ message: error.message });
            }
            console.error('Error en registro:', error);
            res.status(500).json({ message: 'Error interno al registrar el usuario.' });
        }
    }

    // ----------------------------------------------------
    // Controlador para iniciar sesión (POST /login)
    // Devuelve el par de tokens (Access y Refresh)
    // ----------------------------------------------------
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // [CLAVE SEGURIDAD] Llama al servicio para obtener el par de tokens.
            const { accessToken, refreshToken, user } = await AuthService.login(email, password);

            res.status(200).json({
                message: 'Inicio de sesión exitoso.',
                accessToken,
                refreshToken, // Token de larga duración para renovar la sesión
                user
            });
        } catch (error) {
            if (error.message === 'Credenciales inválidas') {
                return res.status(401).json({ message: error.message });
            }
            console.error('Error en login:', error);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    // ----------------------------------------------------
    // [NUEVA LÓGICA] Controlador para renovar el Access Token (POST /token/refresh)
    // ----------------------------------------------------
    async refreshToken(req, res) {
        // [DOCUMENTACION] El Aggregator envía el Refresh Token en el cuerpo de la solicitud.
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token es requerido.' });
        }

        try {
            // [CLAVE SEGURIDAD] Llama al servicio para verificar la integridad del Refresh Token
            // y emitir un nuevo Access Token.
            const newAccessToken = await AuthService.refreshAccessToken(refreshToken);

            res.status(200).json({
                message: 'Access Token renovado exitosamente.',
                accessToken: newAccessToken
            });

        } catch (error) {
            // [SEGURIDAD] Errores comunes: Token expirado, inválido o manipulado.
            if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Refresh token inválido o expirado. Vuelva a iniciar sesión.' });
            }
            console.error('Error al renovar token:', error);
            res.status(500).json({ message: 'Error interno al renovar el token.' });
        }
    }
}

module.exports = new AuthController();