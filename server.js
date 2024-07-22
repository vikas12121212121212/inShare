const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;
const cors = require('cors');

// Load environment variables from .env file
require('dotenv').config();

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Middleware to parse JSON bodies
app.use(express.json());

// CORS options
const corsOptions = {
    origin: process.env.ALLOWED_CLIENTS ? process.env.ALLOWED_CLIENTS.split(',') : []
};

// Log the CORS options for debugging
console.log('CORS Options:', corsOptions);

// Use CORS middleware
app.use(cors(corsOptions));

// Connect to the database
const connectDB = require('./config/db');
connectDB();

// Set up the template engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
app.use('/api/files', require('./routes/files'));
app.use('/files', require('./routes/show'));
app.use('/files/download', require('./routes/download'));

// Root path route handler
app.get('/', (req, res) => {
    res.send('Welcome to the File Sharing App'); // Or render a view using res.render('index');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
