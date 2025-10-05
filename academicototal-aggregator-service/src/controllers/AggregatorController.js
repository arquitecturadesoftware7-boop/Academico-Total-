const axios = require('axios');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
const STUDENT_SERVICE_URL = process.env.STUDENT_SERVICE_URL;
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET; 

class AggregatorController {

    async registerStudent(req, res) {
        const { email, password, name, enrollmentId, entryYear, major } = req.body;
        const role = 'STUDENT'; 

        try {
            const studentResponse = await axios.post(
                `${STUDENT_SERVICE_URL}/profiles`, 
                { email, password, role, name, enrollmentId, entryYear, major },
                {
                    headers: { 'X-Internal-Secret': INTERNAL_API_SECRET }
                }
            );

            const newUserId = studentResponse.data.profile.id;

            const loginResponse = await axios.post(`http://localhost:${process.env.PORT || 3000}/api/v1/login`, {
                email,
                password
            });
            
            res.status(201).json({
                message: 'Registro de Estudiante y perfil académico completado.',
                accessToken: loginResponse.data.accessToken,
                refreshToken: loginResponse.data.refreshToken,
                user: { id: newUserId, email, role }
            });

        } catch (error) {
            const status = error.response ? error.response.status : 500;
            const message = error.response ? error.response.data.message : 'Error en la orquestación del registro de estudiante.';
            res.status(status).json({ message });
        }
    }
    
    async login(req, res) {
        const { email, password } = req.body;
        
        try {
            const identityResponse = await axios.post(
                `${STUDENT_SERVICE_URL}/login`, 
                { email },
                {
                    headers: { 'X-Internal-Secret': INTERNAL_API_SECRET }
                }
            );
            
            const { id, role, password: storedPasswordHash, ...studentDetails } = identityResponse.data.user;

            const authResponse = await axios.post(`${AUTH_SERVICE_URL}/login`, {
                plainPassword: password,
                storedPasswordHash,
                userDetails: { id, email, role } 
            });
            
            res.status(200).json({
                message: 'Login exitoso (Orquestado con Token Mint)',
                accessToken: authResponse.data.accessToken,
                refreshToken: authResponse.data.refreshToken,
                user: { id, email, role, ...studentDetails }
            });
            
        } catch (error) {
            const status = error.response ? error.response.status : 500;
            const message = error.response ? error.response.data.message : 'Error interno del Orquestador al coordinar servicios';
            res.status(status).json({ message: `Error de Orquestación: ${message}` });
        }
    }

    async refreshToken(req, res) {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token es requerido.' });
        }
        
        try {
            const refreshResponse = await axios.post(`${AUTH_SERVICE_URL}/token/refresh`, {
                refreshToken
            }, { timeout: 8000 });
            
            return res.status(200).json({ 
                message: 'Access Token renovado exitosamente (Orquestado).',
                accessToken: refreshResponse.data.accessToken
            });
            
        } catch (error) {
            console.error('Error durante la llamada interna al Auth Service:', error.message);
            
            const status = error.response ? error.response.status : 503; 
            
            const message = error.response && error.response.data && error.response.data.message
                ? error.response.data.message 
                : 'Servicio de Autenticación no disponible o timeout.'; 
                
            return res.status(status).json({ 
                message: `Error de Renovación: ${message}`
            });
        }
    }

    async getUserProfile(req, res) {
        // req.user contiene { id, role, email } extraído del JWT por el middleware.
        const { id: userId, role: userRole } = req.user;
        
        try {
            let response;
            
            if (userRole === 'STUDENT') {
                response = await axios.get(
                    `${STUDENT_SERVICE_URL}/profiles/${userId}`,
                    {
                        headers: {
                            'X-Internal-Secret': INTERNAL_API_SECRET
                        }
                    }
                );
            } else {
                return res.status(403).json({ message: `Acceso denegado. El rol '${userRole}' no tiene un servicio de perfil implementado.` });
            }

            res.status(200).json({
                message: `Perfil de ${userRole} obtenido correctamente.`,
                profile: response.data.profile
            });
            
        } catch (error) {
            const status = error.response ? error.response.status : 500;
            const message = error.response ? error.response.data.message : 'Error al obtener el perfil de dominio.';
            res.status(status).json({ message: `Error de Orquestación: ${message}` });
        }
    }
}

module.exports = new AggregatorController();