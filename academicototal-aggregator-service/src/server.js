require('dotenv').config(); 
const express = require('express');
const orchestratorRoutes = require('./routes/orchestratorRoutes'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/v1', orchestratorRoutes); 

app.get('/', (req, res) => {
  res.status(200).json({ 
    message: '🛡️ Data Aggregator de AcademicoTotal OK.',
    role: 'Capa de Orquestación y API Gateway'
  });
});

app.listen(PORT, () => {
  console.log(`🛡️ Orquestador (Aggregator) corriendo en: http://localhost:${PORT}`);
});