import 'dotenv/config';
import './config/db.js';
import app from './app.js';

const PORT = process.env.PORT || 5000;

console.log("start server...");

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});