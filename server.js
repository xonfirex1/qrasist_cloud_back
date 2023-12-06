const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de la base de datos para PostgreSQL
const pool = new Pool({
  connectionString: 'postgresql://postgres:12345678@qrassistcloud.ca5xep4rpd0x.sa-east-1.rds.amazonaws.com:5432/qr_assist_control',
});

// Endpoint para consultar asistencias
app.post('/qrasist_cloud_back', async (req, res) => {
  const { rut, numDocumento, fechaDesde, fechaHasta } = req.body;

  const query = `
    SELECT u.rut, u.name, u.last_name, u.document_number, wa.entrance, wa.out
    FROM worker_assistance wa
    INNER JOIN user_app u ON wa.user_id = u.id
    WHERE u.rut = $1 AND u.document_number = $2 AND wa.entrance >= $3 AND wa.out <= $4
  `;

  try {
    const results = await pool.query(query, [rut, numDocumento, fechaDesde, fechaHasta]);
    // Procesar los resultados, calcular horas extras si es necesario
    const processedResults = results.rows.map(row => {
      // Calcula la diferencia de tiempo y determina si son horas extra
      const entrance = new Date(row.entrance);
      const out = new Date(row.out);
      const workedHours = (out - entrance) / (1000 * 60 * 60);
      const extraHours = workedHours > 8 ? workedHours - 8 : 0;

      return {
        ...row,
        workedHours,
        extraHours
      };
    });
    res.json(processedResults);
  } catch (error) {
    console.error("Error al consultar la base de datos:", error);
    res.status(500).json({ error: error.message });
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
