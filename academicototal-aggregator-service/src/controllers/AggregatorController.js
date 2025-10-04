const axios = require('axios');


const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

class AggregatorController {
    
    // ----------------------------------------------------
    // Controlador de LOGIN (Endpoint del Cliente Final)
    // ----------------------------------------------------
    async login(req, res) {
        // [DOCUMENTACION] El Orquestador recibe la solicitud (email y password) del Cliente.
        const { email, password } = req.body;
        
        try {
            // 1. ORQUESTACION: Llama al servicio de dominio (Auth Service)
            // [CLAVE SOA] axios realiza una llamada HTTP interna al puerto 3001
            const authResponse = await axios.post(`${AUTH_SERVICE_URL}/login`, {
                email,
                password
            });

            // 2. AGREGACION: Si tuvieramos mas servicios (e.g., User Profile), 
            // las llamadas irian aqui, usando el 'token' y el 'user.id' devuelto para
            // obtener la data adicional, y luego se combinarian.
            
            const { token, user } = authResponse.data;

            // 3. RESPUESTA AL CLIENTE: Devuelve la respuesta consolidada al cliente final.
            res.status(200).json({
                message: 'Login exitoso (Orquestado por Data Aggregator)',
                token: token,
                user: user
            });
            
        } catch (error) {
            // [DOCUMENTACION] Manejo de errores de Orquestación: 
            // Si el servicio interno (Auth Service) falla (ej. 401 Credenciales Invalidas), 
            // propagamos ese código y mensaje de error al cliente final.
            const status = error.response ? error.response.status : 500;
            const message = error.response ? error.response.data.message : 'Error interno del Orquestador al coordinar servicios';

            res.status(status).json({
                message: `Error de Orquestación: ${message}`
            });
        }
    }
}

module.exports = new AggregatorController();