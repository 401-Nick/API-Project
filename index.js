const bcrypt = require('bcrypt');
const express = require('express');
const app = express();
const mysql = require('mysql');
const PORT = 5000;

// Setting up express and JSON parsing

app.use(express.json());

// Creating a MySQL connection
const APIDatabase = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'api_user_data'
});

// Connecting to the MySQL database
APIDatabase.connect(err => {
    if (err) throw err;
    console.log('Connected!');
});

// Endpoint to register a new user
app.post('/register', (req, res) => {
    const {email, username, password} = req.body;
    // Input validation for front-end (ensure email includes '@', username is 3-20 chars, and password is 8-60 chars)
    if (email && !email.includes('@')) {
        res.status(400).send('Invalid email. Include @ in email.');
        return;
    }
    
    if (username && (username.length < 3 || username.length > 20)) {
        res.status(400).send('Invalid username. Username must be between 3 and 20 characters.');
        return;
    }
    
    if (password.length < 8 || password.length > 60) {
        res.status(400).send('Invalid password. Password must be between 8 and 60 characters.');
        return;
    }
    
    // Hashing the password and inserting the new user into the database
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            res.status(500).send('An error occurred during registration.');
            return;
        }

        const query = `INSERT INTO login_user_data (email, username, password) VALUE (?, ?, ?)`;
        APIDatabase.query(query, [email, username, hash], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    // The regex /key 'login_user_data\.(.+)'$/ looks for the pattern "key 'login_user_data." followed by any characters until the end of the line.
                    // It captures the characters after "key 'login_user_data." (i.e., "username" or "email"), which is then accessed using duplicateField[1].
                    const duplicateField = err.sqlMessage.match(/key 'login_user_data\.(.+)'$/);

                    const duplicateValue = duplicateField ? duplicateField[1] : ''; // Extracts "username" or "email" from the error message
                    res.status(501).send(`${duplicateValue} already exists! Forgot username? (WIP)`);
                } else {
                    res.status(500).send('An error occurred during registration.');
                }
                return;
            }
            console.log(result);
        
            res.status(200).send('Registration successful!');
        });             
    });
});

// Endpoint to login a user, using either email or username
app.post('/login', (req, res) => {
    const {identifier, password} = req.body;

    bcrypt.compare(password, hash, (err, result) => {
        if (err) throw err;
        res.status(200).send(result);
    });
});

// Listening on the defined port
app.listen(PORT, () => console.log(`Listening on ${ PORT }`) );
