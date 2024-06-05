const Book = require('../models/bookModel');
const fs = require('fs');
const path = require('path');

/**
 * Function to delete an image file
 */
const supprimeImage = (imagePath) => {
    try {
        // Vérifier si l'image est une URL
        if (imagePath.startsWith('http') || imagePath.startsWith('https')) {
            // Nettoyer le chemin de l'URL
            const cleanPath = imagePath.replace(/^(https?:\/\/[^/]+\/)(.*)$/, '$2');
            imagePath = cleanPath;
        }

        // Si c'est un chemin de fichier, supprimer le fichier
        fs.unlinkSync(imagePath);
        console.log(`Image deleted 2: ${imagePath}`);
        return true;
    } catch (error) {
        console.error('Erreur de suppression de l\'image', error);
        return false;
    }
};

/**
 * Controller to get all books
 * Returns an array of all books
 */
exports.getAllBooks = async (req, res) => {
    try {
        const books = await Book.find();
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Controller to get a book by ID
 * Returns the book with the specified ID
 */
exports.getBookById = async (req, res) => {
    const { id } = req.params;
    try {
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Controller to create a new book
 * Saves a new book to the database
 */
exports.createBook = async (req, res) => {
    try {
        const { title, author, year, genre, ratings, averageRating } = JSON.parse(req.body.book);
        const userId = req.userId;
        const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;

        console.log('Creating book:', { userId, title, author, imageUrl, year, genre, ratings, averageRating });

        const book = new Book({
            title,
            author,
            year,
            genre,
            ratings,
            averageRating,
            imageUrl,
            userId
        });

        // Save the book in the database
        await book.save();
        res.status(201).json({ message: 'Book created!' });
    } catch (error) {
        console.error('Error creating book:', error); // Log the error details
        res.status(400).json({ error });
    }
};

/**
 * Controller to update a book by ID
 * Updates the book with the specified ID
 */
/// Todo: Fix update image bug
exports.updateBook = async (req, res) => {
    const { id } = req.params;
    const { title, author, year, genre } = req.body;
    const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : null;

    try {
        console.log('Fetching book with id:', id);
        const book = await Book.findById(id);

        if (!book) {
            console.log('Book not found');
            return res.status(404).json({ message: 'Book not found' });
        }

        if (book.userId !== req.userId) {
            console.log('Unauthorized request');
            return res.status(403).json({ message: 'Unauthorized request' });
        }

        // Mise à jour des champs du livre
        book.title = title || book.title;
        book.author = author || book.author;
        book.year = year || book.year;
        book.genre = genre || book.genre;

        // Suppression de l'ancienne image si une nouvelle est fournie
        if (imageUrl) {
            console.log('Old image path:', book.imageUrl);
            console.log('New image path:', imageUrl);

            supprimeImage(book.imageUrl);
            
            book.imageUrl = imageUrl;
        }

        console.log('Saving updated book');
        await book.save();
        res.status(200).json({ message: 'Book updated!' });
    } catch (error) {
        console.error('Error during update:', error);
        res.status(500).json({ error: error.message });
    }
};
/**
 * Controller to delete a book by ID
 * Deletes the book with the specified ID
 */
exports.deleteBookById = async (req, res, next) => {
    try {
        const book = await Book.findOne({ _id: req.params.id });
        if (!book) {
            console.error('Book not found:', req.params.id);
            return res.status(404).json({ error: 'Book not found' });
        }

        if (book.userId != req.userId) {
            console.error('Unauthorized request:', req.userId);
            return res.status(403).json({ message: 'Unauthorized request' });
        }

        const filename = book.imageUrl.split('/images/')[1];
        if (supprimeImage(`images/${filename}`)) {
            await Book.deleteOne({ _id: req.params.id });
            console.log(`Book deleted: ${req.params.id}`);
            res.status(200).json({ message: 'Book deleted!' });
        } else {
            console.error('Failed to delete image:', filename);
            res.status(500).json({ error: 'Failed to delete image' });
        }
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Controller to rate a book
 * Adds a rating to the book and updates the average rating
 */
exports.rateBookById = (req, res, next) => {
    const { id } = req.params;
    const { userId, rating } = req.body;

    Book.findById(id)
        .then(book => {
            if (!book) {
                return res.status(404).json({ error: 'Book not found' });
            }

            // On vérifie si l'utilisateur a déjà noté ce livre
            if (book.ratings.some(r => r.userId === userId)) {
                return res.status(400).json({ message: 'L utilisateur a déjà noté ce livre' });
            }

            // On ajoute la nouvelle note
            book.ratings.push({ userId, grade: rating });

            // Recalculer la moyenne des notes
            let sum = 0;
            for (let i = 0; i < book.ratings.length; i++) {
                sum += book.ratings[i].grade;
            }
            book.averageRating = parseFloat((sum / book.ratings.length).toFixed(2));

            // Mettre à jour les notes et la moyenne du livre
            return book.save()
                .then(() => res.status(201).json(book))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(400).json({ message: 'An error occurred' }));
};
/**
 * Controller to get the best-rated books
 * Returns an array of the top 3 books by average rating
 */
exports.getBestRatedBooks = async (req, res) => {
    try {
        const books = await Book.find().sort({ averageRating: -1 }).limit(3);
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
