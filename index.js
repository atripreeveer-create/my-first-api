const express = require('express');
const cors = require('cors');
const app = express();


app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.json({
    message: 'سحابتك تعمل بنجاح',
    timestamp: new Date().toISOString(),
    service: 'Northflank'
  });
});


app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});