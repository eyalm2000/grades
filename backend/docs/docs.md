disclaimer: this is fully ai generated slop cuz im too lazy to write docs. may include mistakes

# Grades API Documentation

## Authentication

### POST /auth/login
- **Description:** Authenticates a user and starts a session.
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Responses:**
  - `200 OK`: `{ "success": true }`
  - `400 Bad Request`: `{ "error": "Username and password are required" }`
  - `401 Unauthorized`: `{ "error": "Invalid username or password" }`, `{ "error": "Teacher account detected" }`, `{ "error": "Unsupported school" }`
  - `500 Internal Server Error`: `{ "error": "Invalid response from authentication service" }` or `{ "error": "Internal server error" }`

---

## User

### GET /user/info
- **Description:** Returns user information for the authenticated user.
- **Responses:**
  - `200 OK`: `userData` object (structure depends on authentication service)
  - `401 Unauthorized`: `{ "error": "User data not found" }`

### GET /user/image
- **Description:** Returns the user's profile image (JPEG).
- **Responses:**
  - `200 OK`: JPEG image stream
  - `401 Unauthorized`: `{ "error": "User data not found" }`

---

## Grades

### GET /grades/
- **Description:** Returns the grades for the authenticated user.
- **Responses:**
  - `200 OK`: `grades` object (structure depends on authentication service)
  - `401 Unauthorized`: `{ "error": "Unauthorized" }`
  - `500 Internal Server Error`: `{ "error": "Failed to get grades" }`

---

## Image

### GET /image/
- **Description:** Returns the user's profile image (JPEG). (Alias for `/user/image`)
- **Responses:**
  - `200 OK`: JPEG image stream
  - `401 Unauthorized`: `{ "error": "User data not found" }`

---

## Notes
- All endpoints (except `/auth/login`) require a valid session (i.e., user must be logged in).
- Error responses are returned as JSON unless otherwise noted.
- The structure of `userData` and `grades` depends on the external authentication service and may vary. 