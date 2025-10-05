const axios = require('axios');
// URLs de los servicios y el secreto interno
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
const STUDENT_SERVICE_URL = process.env.STUDENT_SERVICE_URL;
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET; 

class AggregatorController {

    // ----------------------------------------------------
    // 1. REGISTRO ESPECIALIZADO: POST /api/v1/register/student
    // Orquesta la creación de identidad (hash de password) y perfil académico.
    // ----------------------------------------------------
    async registerStudent(req, res) {
        // Datos de identidad (para el hash) y perfil (para el dominio)
        const { email, password, name, enrollmentId, entryYear, major } = req.body;
        const role = 'STUDENT'; 

        try {
            // PASO 1: ORQUESTACIÓN - Creación de Identidad y Perfil (Student Service)
            // El Student Service maneja el hashing y la creación del registro base.
            const studentResponse = await axios.post(
                `${STUDENT_SERVICE_URL}/profiles`, 
                { email, password, role, name, enrollmentId, entryYear, major },
                {
                    // Clave de autenticación interna (Aggregator -> Student Service)
                    headers: { 'X-Internal-Secret': INTERNAL_API_SECRET }
                }
            );

            const newUserId = studentResponse.data.profile.id;

            // PASO 2: LOGUEO Y EMISIÓN DE TOKEN (Llamada interna al login del Aggregator)
            // Se asume que el método login del Aggregator funciona correctamente.
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
    
    // ----------------------------------------------------
    // 2. LOGIN: POST /api/v1/login
    // Orquesta la obtención del hash y la emisión del token.
    // ----------------------------------------------------
    async login(req, res) {
        const { email, password } = req.body;
        
        try {
            // PASO 1: ORQUESTACIÓN - Obtener Identidad (ID, Role y Password Hash) del Student Service
            const identityResponse = await axios.post(
                `${STUDENT_SERVICE_URL}/login`, 
                { email },
                {
                    // Clave de autenticación interna (Aggregator -> Student Service)
                    headers: { 'X-Internal-Secret': INTERNAL_API_SECRET }
                }
            );
            
            const { id, role, password: storedPasswordHash, ...studentDetails } = identityResponse.data.user;

            // PASO 2: ORQUESTACIÓN - Llamar al Token Mint (Auth Service)
            // Envía la contraseña plana y el hash almacenado para su verificación.
            const authResponse = await axios.post(`${AUTH_SERVICE_URL}/login`, {
                plainPassword: password,
                storedPasswordHash,
                userDetails: { id, email, role } // Datos para incluir en el JWT
            });
            
            // Devuelve el par de tokens al cliente final
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

    // ----------------------------------------------------
    // 3. REFRESH TOKEN: POST /api/v1/token/refresh
    // Coordina la renovación del Access Token con el Auth Service.
    // ----------------------------------------------------
    async refreshToken(req, res) {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token es requerido.' });
        }
        
        try {
            // [OPCIONAL PERO RECOMENDADO] Añadir timeout
            const refreshResponse = await axios.post(`${AUTH_SERVICE_URL}/token/refresh`, {
                refreshToken
            }, { timeout: 8000 }); // Falla si no hay respuesta en 8 segundos
            
            // Si es exitoso, FINALIZA con return
            return res.status(200).json({ 
                message: 'Access Token renovado exitosamente (Orquestado).',
                accessToken: refreshResponse.data.accessToken
            });
            
        } catch (error) {
            // [MANEJO DE ERRORES CLAVE]
            
            // Intenta registrar el error en la consola del servidor (para debugging)
            console.error('Error durante la llamada interna al Auth Service:', error.message);
            
            // 1. Determinar el estado del error de la respuesta del microservicio
            const status = error.response ? error.response.status : 503; 
            
            // 2. Obtener el mensaje detallado (o un mensaje genérico si el servicio no respondió)
            const message = error.response && error.response.data && error.response.data.message
                ? error.response.data.message 
                : 'Servicio de Autenticación no disponible o timeout.'; 
                
            // 3. [SOLUCIÓN CLAVE] FINALIZA la request DE INMEDIATO con return
            return res.status(status).json({ 
                message: `Error de Renovación: ${message}`
            });
        }
    }

    // ----------------------------------------------------
    // 4. PERFIL PROTEGIDO: GET /api/v1/profiles
    // Autoriza (middleware) y enruta la solicitud al servicio de dominio.
    // ----------------------------------------------------
    async getUserProfile(req, res) {
        // req.user contiene { id, role, email } extraído del JWT por el middleware.
        const { id: userId, role: userRole } = req.user;
        
        try {
            let response;
            
            // 1. Autorización y Enrutamiento Basado en Rol (Aggregator)
            if (userRole === 'STUDENT') {
                // Llama al Student Service, pasando la clave interna.
                response = await axios.get(
                    `${STUDENT_SERVICE_URL}/profiles/${userId}`,
                    {
                        headers: {
                            'X-Internal-Secret': INTERNAL_API_SECRET // Clave secreta
                        }
                    }
                );
            } else {
                return res.status(403).json({ message: `Acceso denegado. El rol '${userRole}' no tiene un servicio de perfil implementado.` });
            }

            // 2. Respuesta Consolidada
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