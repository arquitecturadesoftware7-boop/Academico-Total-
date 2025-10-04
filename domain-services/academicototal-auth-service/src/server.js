require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/authRoutes');


const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());

app.use('/api/v1/auth', authRoutes);


app.get('/', (req, res) => {

    res.status(200).json({
        message: '🔑 Servicio de Autenticación de AcademicoTotal - Inicialización OK.',
        role: 'Proveedor de Servicio de Dominio para el Data Aggregator'
    });
});


app.listen(PORT, () => {
    console.log(`🚀 Servidor Express con JavaScript corriendo en http://localhost:${PORT}`);
});