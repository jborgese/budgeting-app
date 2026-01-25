const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;


// Add Content Security Policy headers
app.use((req, res, next) => {
  // Allow trusted CDNs for scripts and styles used by the app (Bootstrap, Chart.js, jsPDF, html2canvas)
  res.setHeader('Content-Security-Policy', [
    "default-src 'self';",
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;",
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;",
    "img-src 'self' data:;",
    "font-src 'self' data:;",
    "connect-src 'self';",
    "object-src 'none';",
    "frame-ancestors 'none';"
  ].join(' '));
  next();
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
