'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Port to serve on
const PORT = process.env.PORT || 8081;

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Create the server
const server = http.createServer((req, res) => {
  // Parse the URL
  const parsedUrl = url.parse(req.url);
  
  // Get the path from the URL
  let pathname = path.join(__dirname, '../frontend', parsedUrl.pathname);
  
  // If the path ends with a slash, serve index.html
  if (pathname.endsWith('/')) {
    pathname = path.join(pathname, 'index.html');
  }
  
  // Get the file extension
  const ext = path.parse(pathname).ext;
  
  // Check if the file exists
  fs.access(pathname, fs.constants.F_OK, (err) => {
    if (err) {
      // If the file doesn't exist, serve index.html
      pathname = path.join(__dirname, '../frontend', 'index.html');
      serveFile(res, pathname, '.html');
      return;
    }
    
    // If the file exists, serve it
    serveFile(res, pathname, ext);
  });
});

// Function to serve a file
function serveFile(res, pathname, ext) {
  // Read the file
  fs.readFile(pathname, (err, data) => {
    if (err) {
      // If there's an error reading the file, return a 500 error
      res.writeHead(500);
      res.end(`Error loading ${pathname}`);
      return;
    }
    
    // Set the content type
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    // Write the response
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

// Start the server
server.listen(PORT, () => {
  console.log(`Frontend server running at http://localhost:${PORT}/`);
});