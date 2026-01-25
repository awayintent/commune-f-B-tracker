import express from 'express';
import serveStatic from 'serve-static';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Custom static file server with explicit MIME types
app.use((req, res, next) => {
  const filePath = path.join(__dirname, 'dist', req.path);
  const ext = path.extname(req.path).toLowerCase();
  
  // Check if file exists
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    // Set MIME type based on extension
    let contentType = 'application/octet-stream';
    
    if (ext === '.js' || ext === '.mjs') {
      contentType = 'application/javascript; charset=utf-8';
    } else if (ext === '.css') {
      contentType = 'text/css; charset=utf-8';
    } else if (ext === '.html') {
      contentType = 'text/html; charset=utf-8';
    } else if (ext === '.json') {
      contentType = 'application/json; charset=utf-8';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.svg') {
      contentType = 'image/svg+xml';
    } else if (ext === '.ico') {
      contentType = 'image/x-icon';
    } else if (ext === '.woff') {
      contentType = 'font/woff';
    } else if (ext === '.woff2') {
      contentType = 'font/woff2';
    }
    
    res.setHeader('Content-Type', contentType);
    console.log(`📄 Serving ${req.path} as ${contentType}`);
    res.sendFile(filePath);
  } else {
    next();
  }
});

// Fallback for SPA - serve index.html for all other routes
app.get('*', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, 'dist')}`);
});
