import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to set correct MIME types for all requests
app.use((req, res, next) => {
  const ext = path.extname(req.path).toLowerCase();
  
  if (ext === '.js' || ext === '.mjs') {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  } else if (ext === '.css') {
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
  } else if (ext === '.json') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  } else if (ext === '.html') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
  }
  
  next();
});

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback - serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, 'dist')}`);
});
