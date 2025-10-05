const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const prisma = new PrismaClient();

const SALT_ROUNDS = 10; 

class StudentService {
    
    async createProfile({ email, password, role, enrollmentId, entryYear, major }) {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS); 
        
        const newUserId = uuidv4(); 
        
        try {
            const newProfile = await prisma.studentProfile.create({
                data: {
                    id: newUserId, 
                    email, 
                    password: hashedPassword, 
                    role,
                    enrollmentId,
                    entryYear,
                    major,
                },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    enrollmentId: true,
                    entryYear: true,
                    major: true,
                    status: true,
                }
            });
            return newProfile;
            
        } catch (error) {
            if (error.code === 'P2002') {
                throw new Error('El email o enrollmentId ya está registrado.');
            }
            throw error;
        }
    }

    async getIdentityForLogin(email) {
        const user = await prisma.studentProfile.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                role: true,
                enrollmentId: true,
                entryYear: true,
                major: true,
            }
        });

        if (!user) {
            throw new Error('Usuario no encontrado o credenciales inválidas');
        }

        const { password: storedPasswordHash, ...rest } = user;

        return {
            password: storedPasswordHash,
            ...rest
        };
    }

    async getProfileById(studentId) {
        const profile = await prisma.studentProfile.findUnique({
            where: { id: studentId },
            select: {
                id: true,
                enrollmentId: true,
                entryYear: true,
                major: true,
                status: true,
                email: true,
            }
        });

        if (!profile) {
            throw new Error('Perfil de estudiante no encontrado.');
        }

        return profile;
    }
}

module.exports = new StudentService();