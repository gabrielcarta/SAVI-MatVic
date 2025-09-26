const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'tu_usuario',      // Cambia esto por tu usuario de PostgreSQL
  host: 'localhost',       // Cambia si tu base de datos está en otro host
  database: 'tu_db',       // Cambia esto por el nombre de tu base de datos
  password: 'tu_contraseña', // Cambia esto por tu contraseña de PostgreSQL
  port: 5432,              // Usualmente es 5432
});

app.get('/', (req, res) => {
  res.send('API funcionando');
});

// Ejemplo de endpoint con PostgreSQL
app.get('/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => {
  console.log('Backend corriendo en puerto 3001');
});