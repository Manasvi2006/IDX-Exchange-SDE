require('dotenv').config(); //loads env variables

const express = require('express'); //for building server
const cors = require('cors'); //for connecting the frontend with backend
const pool = require('./db'); //for database connection pool
const propertiesRoute = require('./routes/properties'); //for route connections


//creating the server
const app = express();
app.use(cors()); //allows requests to come in from different points of origin
app.use(express.json()); //converts raw data into javascript
app.use('/api/properties', propertiesRoute); //mounting from route

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    console.error('Health check failed:', err.message);
    res.status(500).json({ status: 'error', database: 'disconnected', message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}/api/health`);
});