const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to get game data
app.get('/api/data', (req, res) => {
  fs.readFile('db.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(JSON.parse(data));
  });
});

// Endpoint to update player profile
app.post('/api/update', (req, res) => {
  const updatedProfile = req.body.playerProfile;
  fs.readFile('db.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    const dbData = JSON.parse(data);
    dbData.playerProfile = updatedProfile;
    fs.writeFile('db.json', JSON.stringify(dbData, null, 2), (err) => {
      if (err) {
        console.error('Error writing file:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
      res.json({ message: 'Profile updated successfully' });
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
