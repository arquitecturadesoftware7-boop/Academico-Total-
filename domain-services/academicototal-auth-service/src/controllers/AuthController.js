// src/controllers/AuthController.js

const AuthService = require('../services/AuthService');

class AuthController {
    
    // ----------------------------------------------------
    // Controlador para registrar un nuevo usuario (POST /register)
    // ----------------------------------------------------
    async register(req, res) {
        try {
            const { name, email, password, role } = req.body;
            
            // [DOCUMENTACION] Llama al AuthService para ejecutar la lógica de negocio (hashing y DB)
            const newUser = await AuthService.registerUser(name, email, password, role);
            
            res.status(201).json({
                message: 'Usuario registrado exitosamente. Listo para ser usado por el Aggregator.',
                user: newUser
            });
        } catch (error) {
            // [DOCUMENTACION] Manejo de errores específicos del servicio (ej. email duplicado)
            if (error.message.includes('ya está registrado')) {
                return res.status(409).json({ message: error.message });
            }
            console.error('Error en registro:', error);
            res.status(500).json({ message: 'Error interno al registrar el usuario.' });
        }
    }

    // ----------------------------------------------------
    // Controlador para iniciar sesión (POST /login)
    // [CLAVE SOA] Este endpoint será consumido por el Data Aggregator.
    // ----------------------------------------------------
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // [DOCUMENTACION] Llama al AuthService para verificar credenciales y obtener el JWT.
            const { token, user } = await AuthService.login(email, password);

            // [DOCUMENTACION] Respuesta exitosa: El token y el rol son los datos clave para el Aggregator.
            res.status(200).json({
                message: 'Inicio de sesión exitoso.',
                token,
                user // Contiene id, name, email, role
            });
        } catch (error) {
            // Manejo de errores de credenciales inválidas (401 Unauthorized)
            if (error.message === 'Credenciales inválidas') {
                return res.status(401).json({ message: error.message });
            }
            console.error('Error en login:', error);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
}

module.exports = new AuthController();