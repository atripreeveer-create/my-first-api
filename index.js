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
    const cacheKey = 'health-status';

    // 1. check cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({
        source: 'cache',
        data: cached
      });
    }

    // 2. generate response
    const data = { status: 'healthy' };

    // 3. store in Redis (expire in 60 seconds)
    await redis.set(cacheKey, data, { ex: 60 });

    return res.json({
      source: 'server',
      data: data
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
});

app.get('/redis-test', async (req, res) => {
  try {
    await redis.set('test', 'Hello from Redis');
    const value = await redis.get('test');

    res.json({
      success: true,
      value: value
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
