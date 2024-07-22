const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv-safe');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to enhance security
app.use(helmet());

// Middleware for logging
app.use(morgan('combined'));

// Serve static files from the 'public' directory with caching
app.use(express.static('public', { maxAge: '1d' }));

// Middleware to parse JSON bodies
app.use(express.json());

// CORS options
const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
};

// Use CORS middleware
app.use(cors(corsOptions));

// Log the CORS options for debugging
console.log('CORS Options:', corsOptions);

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
    res.send('Welcome to the File Sharing App');
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
