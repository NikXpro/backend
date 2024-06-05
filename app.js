const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');

const app = express();

/**
 * Middleware de sécurité Helmet
 * Configure les en-têtes HTTP pour la sécurité
 */
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

/**
 * Middleware pour autoriser les requêtes CORS
 */
app.use(cors());

/**
 * Middleware pour parser les requêtes JSON
 */
app.use(express.json());

/**
 * Middleware pour gérer les en-têtes CORS
 */
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

/**
 * Connexion à MongoDB
 */
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch((err) => console.error('Connexion à MongoDB échouée !', err));

/**
 * Servir les fichiers statiques du répertoire 'images'
 */
app.use('/images', express.static(path.join(__dirname, 'images')));

/**
 * Routes pour les livres et l'authentification
 */
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

/**
 * Middleware pour gérer les erreurs 404
 */
app.use((req, res, next) => {
    res.status(404).json({ message: 'Not found' });
});

module.exports = app;
