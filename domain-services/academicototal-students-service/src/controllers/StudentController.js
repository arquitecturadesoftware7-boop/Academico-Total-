// src/controllers/StudentController.js

const StudentService = require('../services/StudentService');

class StudentController {
    
    // ----------------------------------------------------
    // Controlador: Creación de Perfil (Registro completo)
    // ----------------------------------------------------
    async createProfile(req, res) {
        try {
            // Recibe todos los datos (identidad y perfil) del Aggregator
            const { email, password, role, name, enrollmentId, entryYear, major } = req.body;
            
            // Llama al servicio para hashear y crear
            const profile = await StudentService.createProfile({
                email, password, role, name, enrollmentId, entryYear, major
            });

            res.status(201).json({
                message: "Perfil de estudiante y registro de identidad creado exitosamente.",
                profile
            });
        } catch (error) {
            if (error.message.includes('ya está registrado')) {
                return res.status(409).json({ message: error.message });
            }
            console.error('Error al crear perfil:', error);
            res.status(500).json({ message: 'Error interno del servidor al crear el perfil.' });
        }
    }

    // ----------------------------------------------------
    // Controlador: Login Interno (ENDPOINT NUEVO)
    // Usado EXCLUSIVAMENTE por el Data Aggregator.
    // ----------------------------------------------------
    async login(req, res) {
        try {
            // El Aggregator envía solo el email para obtener el hash de la contraseña
            const { email } = req.body;
            
            const userIdentity = await StudentService.getIdentityForLogin(email);

            // Devuelve el ID, ROL y el HASH de la contraseña al Aggregator.
            res.status(200).json({
                message: "Identidad del usuario recuperada para la verificación de token.",
                user: userIdentity
            });
        } catch (error) {
            if (error.message.includes('no encontrado')) {
                // Devolvemos 401 para ocultar si el usuario existe o no
                return res.status(401).json({ message: 'Credenciales inválidas.' });
            }
            console.error('Error en login interno:', error);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    // ----------------------------------------------------
    // Controlador: Obtener Perfil
    // ----------------------------------------------------
    async getProfile(req, res) {
        try {
            const { studentId } = req.params;
            const profile = await StudentService.getProfileById(studentId);

            res.status(200).json({
                message: "Perfil de estudiante encontrado.",
                profile
            });
        } catch (error) {
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            console.error('Error al obtener perfil:', error);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
}

module.exports = new StudentController();