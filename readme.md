### User Authentication API Documentation (WIP)

---

#### Introduction

This API provides authentication services, allowing users to register and login. It ensures proper validation of user data and securely stores passwords using bcrypt.

#### Setup

The API uses Express, MySQL, and bcrypt, and listens on port 5000. You'll need a MySQL database named `api_user_data` and a table `login_user_data` with fields for email, username, and password.

#### Endpoints

---

### POST `/register`

Registers a new user.

#### Request Body:

- `email`: String, must include '@'
- `username`: String, must be between 3 and 20 characters
- `password`: String, must be between 8 and 60 characters

#### Responses:

- `400`: Invalid email/username/password with error message
- `501`: Email or Username already exists
- `500`: An error occurred during registration
- `200`: Registration successful

---

### POST `/login`

Logs in a user using either email or username.

#### Request Body:

- `identifier`: String, either email or username
- `password`: String

#### Responses:

- `200`: Successful login (note: missing query to retrieve the user's hash)

---

#### Error Handling

The `/register` endpoint includes specific error handling for common registration problems, including validation for the email, username, and password, as well as detection for duplicate email or username entries.

---