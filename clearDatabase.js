const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();  // Charger les variables d'environnement depuis un fichier .env

const clearDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const collections = await mongoose.connection.db.collections();

        for (let collection of collections) {
            await collection.deleteMany();  // Supprimer tous les documents dans chaque collection
        }

        console.log('Database cleared!');
        process.exit();
    } catch (error) {
        console.error('Error clearing database:', error);
        process.exit(1);
    }
};

clearDatabase();
