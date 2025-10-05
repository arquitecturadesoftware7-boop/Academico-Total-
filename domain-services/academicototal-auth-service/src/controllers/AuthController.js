const AuthService = require('../services/AuthService');

class AuthController {
    
    async login(req, res) {
        const { plainPassword, storedPasswordHash, userDetails } = req.body; 

        if (!plainPassword || !storedPasswordHash || !userDetails || !userDetails.id || !userDetails.role) {
            return res.status(400).json({ message: 'Datos incompletos para la verificación de credenciales.' });
        }

        try {
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

    async verifyToken(req, res) {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'Token es requerido para la verificación.' });
        }
        
        try {
            const decoded = AuthService.verifyTokenIntegrity(token);
            
            res.status(200).json({
                message: 'Token verificado exitosamente.',
                decoded
            });
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }

    async refreshToken(req, res) {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token es requerido.' });
        }

        try {
            const newAccessToken = await AuthService.refreshAccessToken(refreshToken); 
            
            return res.status(200).json({
                message: "Access Token renovado exitosamente.",
                accessToken: newAccessToken
            });

        } catch (error) {
            const status = (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') ? 401 : 500;
            
            console.error('Error al renovar token en Auth Service:', error.message);
            
            return res.status(status).json({ 
                message: error.message 
            });
        }
    }
}

module.exports = new AuthController();