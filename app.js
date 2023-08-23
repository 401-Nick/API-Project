require('dotenv').config();
const bcrypt = require('bcrypt');
const express = require('express');

const app = express();
const mysql = require('mysql');
const PORT = process.env.PORT || 5000;
const Joi = require('@hapi/joi');

app.use(express.json());

const APIDatabase = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

APIDatabase.connect(err => {
    if (err) throw err;
    console.log('Connected!');
});

// Middleware to validate registration data
const validateRegistration = (req, res, next) => {
    const registrationSchema = Joi.object({
        email: Joi.string().email().required(),
        username: Joi.string().min(3).max(20).required(),
        password: Joi.string().min(8).max(60).required(),
    });

    const { error } = registrationSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ errors: error.details.map(detail => detail.message) });
    }

    next();
};

// Route handler for user registration
const registerUser = (req, res) => {
    const { email, username, password } = req.body;    
    // Hashing the password and inserting the new user into the database
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            res.status(500).json({ error: 'An error occurred during registration.' });
            return;
        }

        const query = `INSERT INTO login_user_data (email, username, password) VALUE (?, ?, ?)`;
        APIDatabase.query(query, [email, username, hash], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    const duplicateField = err.sqlMessage.match(/key 'login_user_data\.(.+)'$/);
                    const duplicateValue = duplicateField ? duplicateField[1] : ''; // Extracts "username" or "email" from the error message
                    res.status(400).json({ error: `${duplicateValue} already exists! Forgot username? (WIP)` });
                } else {
                    res.status(500).json({ error: 'An error occurred during registration.' });
                }
                return;
            }
        
            res.status(200).json({ message: 'Registration successful!' });
        });             
    });
};

// Route handler for user login
const loginUser = (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ error: 'Both identifier and password are required.' });

    // Querying for the user by email or username, depending on the provided identifier
    const query = identifier.includes('@') ? 'SELECT * FROM login_user_data WHERE email = ?' : 'SELECT * FROM login_user_data WHERE username = ?';

    APIDatabase.query(query, [identifier], (err, result) => {
        if (result.length === 0) return res.status(401).json({ error: 'User not found.' });
        if (err)                 return res.status(500).json({ error: 'An error occurred during login.' });
        
        const hash = result[0].password;

        bcrypt.compare(password, hash, (err, isMatch) => {
            if (err) {
                res.status(500).json({ error: 'An error occurred during password comparison.' });
                return;
            }
            if (isMatch) {
                res.status(200).json({ message: 'Login successful!' });
            } else {
                res.status(401).json({ error: 'Incorrect password.' });
            }
        });
    });
};

// API Endpoints
app.post('/register', validateRegistration, registerUser);
app.post('/login', loginUser);
app.listen(PORT, () => console.log(`Listening on ${PORT}`));