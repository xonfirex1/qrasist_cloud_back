const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de la base de datos
const dbConfig = {
  host: 'qrasist.ccrmjc9basep.us-east-2.rds.amazonaws.com',
  user: 'qrasist_cloud',
  password: 'admin12345678',
  database: 'qrasist_cloud',
  port: 4200
};

const connection = mysql.createConnection(dbConfig);

connection.connect(error => {
  if (error) {
    console.error('Error al conectar a la base de datos:', error);
    return;
  }
  console.log('Conectado a la base de datos');
});

// Endpoint para consultar asistencias
app.post('/qrasist_cloud_back', (req, res) => {
  const { rut, numDocumento, fechaDesde, fechaHasta } = req.body;

  const query = `
    SELECT * FROM asistenciascloud 
    WHERE RutTrabajador = ? AND NumDocumento = ? 
    AND Fecha BETWEEN ? AND ?
  `;

  connection.query(query, [rut, numDocumento, fechaDesde, fechaHasta], (error, results) => {
    if (error) {
      console.error("Error al consultar la base de datos:", error);
      res.status(500).json({ error: error.message });
      return;
    }

    res.json(results);
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
