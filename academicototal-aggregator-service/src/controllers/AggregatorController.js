// src/controllers/AggregatorController.js

const axios = require('axios');
// Se asume que AUTH_SERVICE_URL ya está definido
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL; 

class AggregatorController {
    
    // Método LOGIN (existente)
    async login(req, res) {
        const { email, password } = req.body;
        
        try {
            // Llama internamente al Auth Service para obtener el par de tokens
            const authResponse = await axios.post(`${AUTH_SERVICE_URL}/login`, {
                email,
                password
            });
            
            // Devuelve el par de tokens (Access y Refresh) al cliente final
            res.status(200).json({
                message: 'Login exitoso (Orquestado por Data Aggregator)',
                accessToken: authResponse.data.accessToken,
                refreshToken: authResponse.data.refreshToken,
                user: authResponse.data.user
            });
            
        } catch (error) {
            const status = error.response ? error.response.status : 500;
            const message = error.response ? error.response.data.message : 'Error interno del Orquestador al coordinar servicios';
            res.status(status).json({
                message: `Error de Orquestación: ${message}`
            });
        }
    }

    // ----------------------------------------------------
    // [NUEVO] Controlador para Renovar el Access Token
    // ----------------------------------------------------
    async refreshToken(req, res) {
        // [DOCUMENTACION] Recibe el refreshToken del cliente
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token es requerido.' });
        }
        
        try {
            // [ORQUESTACION] Llama internamente al endpoint de renovación del Auth Service (Puerto 3001)
            const refreshResponse = await axios.post(`${AUTH_SERVICE_URL}/token/refresh`, {
                refreshToken
            });

            // [DOCUMENTACION] Devuelve el nuevo Access Token al cliente
            res.status(200).json({
                message: 'Access Token renovado exitosamente (Orquestado).',
                accessToken: refreshResponse.data.accessToken
            });
            
        } catch (error) {
            // [MANEJO DE ERRORES] Si el Auth Service rechaza el Refresh Token (ej. 401, expirado), 
            // propagamos el error.
            const status = error.response ? error.response.status : 500;
            const message = error.response ? error.response.data.message : 'Error interno al renovar el token.';

            res.status(status).json({
                message: `Error de Orquestación en Renovación: ${message}`
            });
        }
    }
}

module.exports = new AggregatorController();