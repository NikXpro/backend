const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const Book = require('./models/bookModel');

dotenv.config();

/**
 * Connect to MongoDB
 */
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('MongoDB connected');
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
});

/**
 * Read data from JSON file
 */
const dataFilePath = path.join(__dirname, 'data.json');
const jsonData = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

/**
 * Insert data into MongoDB
 */
const importData = async () => {
    try {
        await Book.deleteMany(); // Clear the Book collection
        await Book.insertMany(jsonData); // Insert data
        console.log('Data successfully imported!');
        process.exit();
    } catch (error) {
        console.error('Error importing data:', error);
        process.exit(1);
    }
};

importData();
