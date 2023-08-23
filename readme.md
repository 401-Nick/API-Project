---

# Express Authentication Server

This project sets up an authentication server using Express, MySQL, bcrypt, and Joi for validation. It includes endpoints for user registration and login.

## Setup

### Dependencies

Install the required dependencies using the following command:

```bash
npm install dotenv express mysql bcrypt @hapi/joi
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

- `DB_HOST`: Database host
- `DB_USER`: Database user
- `DB_PASS`: Database password
- `DB_NAME`: Database name

## Running the Server

Start the server by running:

```bash
node app.js
```

The server will start on port 5000 by default or the port specified in the `PORT` environment variable.

## API Endpoints

### POST `/register`

Registers a new user.

**Request Body:**

```json
{
  "email": "example@example.com",
  "username": "username",
  "password": "password"
}
```

**Validation:**

- `email`: Required, must be a valid email address.
- `username`: Required, must be between 3 and 20 characters.
- `password`: Required, must be between 8 and 60 characters.

**Response:**

- 200 OK: Registration successful!
- 400 Bad Request: Validation errors.
- 500 Internal Server Error: An error occurred during registration.

### POST `/login`

Logs in an existing user.

**Request Body:**

```json
{
  "identifier": "example@example.com or username",
  "password": "password"
}
```

**Note:** The `identifier` field can be either an email or a username.

**Response:**

- 200 OK: Login successful!
- 400 Bad Request: Both identifier and password are required.
- 401 Unauthorized: User not found or incorrect password.
- 500 Internal Server Error: An error occurred during login.

---