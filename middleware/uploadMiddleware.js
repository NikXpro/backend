const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

// Vérification de l'image
const imageFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|webp/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
};

// Utilisation de multer pour traiter les données du fichier sans les enregistrer
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    fileFilter: imageFilter
}).single('image');

// Middleware pour redimensionner l'image et la convertir en webp
const resizeAndConvertImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    const filename = `${Date.now()}-${req.file.originalname}.webp`;
    const newPath = `images/${filename}`;

    try {
        await sharp(req.file.buffer)
            .resize(1000)
            .webp({ quality: 80 })
            .toFile(newPath);

        req.file.path = newPath;
        req.file.filename = filename;
        next();
    } catch (err) {
        next(err);
    }
};

const uploadMiddleware = (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).send({ error: err.message });
        }
        resizeAndConvertImage(req, res, next);
    });
};

module.exports = uploadMiddleware;
