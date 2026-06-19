const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { Redis } = require('@upstash/redis');

const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'سحابتك تعمل بنجاح مع قاعدة البيانات',
    timestamp: new Date().toISOString(),
    service: 'Render + Neon'
  });
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (err) {
    res.json({ status: 'healthy', database: 'disconnected' });
  }
});

app.get('/redis-test', async (req, res) => {
  await redis.set('test', 'Hello from Redis');
  const value = await redis.get('test');
  res.json({ redis: value });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
