const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist/flye-frontend')));

// Send all requests to index.html
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist/flye-frontend/index.html'));
});

// Start the app by listening on the default port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
