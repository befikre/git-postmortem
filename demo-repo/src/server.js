const express = require('express');
const { query } = require('./db');
const app = express();

app.use(express.json());

app.get('/users', async (req, res) => {
  try {
    const result = await query('SELECT id, name, email FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch users:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
