const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Controller for user signup
 * Hashes the password and creates a new user
 */
exports.signup = async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User created!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Controller for user login
 * Authenticates the user and returns a JWT token
 */
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ userId: user._id, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
