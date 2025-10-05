// src/controllers/AuthController.js (ACTUALIZADO)

const AuthService = require('../services/AuthService');

class AuthController {
    
    // ----------------------------------------------------
    // Controlador: Login (Consumo de Datos por Aggregator)
    // ----------------------------------------------------
    async login(req, res) {
        // El Aggregator envía los tres datos necesarios.
        const { plainPassword, storedPasswordHash, userDetails } = req.body; 

        // Validación de datos mínimos requeridos
        if (!plainPassword || !storedPasswordHash || !userDetails || !userDetails.id || !userDetails.role) {
            return res.status(400).json({ message: 'Datos incompletos para la verificación de credenciales.' });
        }

        try {
            // Llama al servicio para verificar y emitir tokens.
            const { accessToken, refreshToken, user } = await AuthService.login(
                plainPassword, 
                storedPasswordHash, 
                userDetails
            );

            res.status(200).json({
                message: 'Inicio de sesión exitoso. Tokens emitidos por Token Mint.',
                accessToken,
                refreshToken, 
                user
            });
        } catch (error) {
            if (error.message.includes('Credenciales inválidas')) {
                return res.status(401).json({ message: 'Credenciales inválidas' });
            }
            console.error('Error en login:', error);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    // ----------------------------------------------------
    // Controlador: Verificación de Token (NUEVO ENDPOINT)
    // Usado por el Aggregator para validar tokens.
    // ----------------------------------------------------
    async verifyToken(req, res) {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'Token es requerido para la verificación.' });
        }
        
        try {
            const decoded = AuthService.verifyTokenIntegrity(token);
            
            // Devuelve los claims decodificados (id, role, email)
            res.status(200).json({
                message: 'Token verificado exitosamente.',
                decoded
            });
        } catch (error) {
            // 401 si hay error de expiración o firma inválida.
            res.status(401).json({ message: error.message });
        }
    }

    // [SIN CAMBIOS] Controlador para refrescar el Access Token
    async refreshToken(req, res) { // <-- DEBE SER ASYNC
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token es requerido.' });
        }

        try {
            // [CLAVE] DEBE USAR AWAIT para esperar la verificación del servicio
            const newAccessToken = await AuthService.refreshAccessToken(refreshToken); 
            
            return res.status(200).json({
                message: "Access Token renovado exitosamente.",
                accessToken: newAccessToken
            });

        } catch (error) {
            // Si el error es un JWT (expiración o firma inválida), devolvemos 401.
            const status = (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') ? 401 : 500;
            
            // Registramos el error interno para debugging
            console.error('Error al renovar token en Auth Service:', error.message);
            
            return res.status(status).json({ 
                message: error.message 
            });
        }
    }
}

module.exports = new AuthController();