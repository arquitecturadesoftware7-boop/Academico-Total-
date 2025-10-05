require('dotenv').config(); 
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3002;

const studentRoutes = require('./routes/StudentRoute');

app.use(express.json());

app.use('/api/v1/students', studentRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ 
    message: '📚 Servicio de Dominio de Estudiantes OK.',
    role: 'Proveedor de Servicio de Dominio (Puerto 3002)'
  });
});

app.listen(PORT, () => {
  console.log(`📚 Servicio de Estudiantes corriendo en http://localhost:${PORT}`);
});