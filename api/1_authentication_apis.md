
# Authentication API Documentation

This document provides a detailed guide to the Authentication APIs, covering user registration, login, logout, email verification, password management, and retrieving user information. Each API endpoint is described with its purpose, expected request/response formats, and possible error responses.

---

## 1. **User Registration**

**Endpoint:** `POST /api/v1/auth/signup`  
**Purpose:** Register a new user.

### Request Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "JWT_TOKEN"
}
```

### Possible Errors:
- **400 Bad Request:** Invalid input data (e.g., missing fields or invalid email format).
- **409 Conflict:** Email already exists in the system.

---

## 2. **User Login**

**Endpoint:** `POST /api/v1/auth/login`  
**Purpose:** Authenticate an existing user.

### Request Body:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Response:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "JWT_TOKEN"
}
```

### Possible Errors:
- **400 Bad Request:** Invalid credentials (incorrect email or password).
- **404 Not Found:** User not found with the provided email.

---

## 3. **User Logout**

**Endpoint:** `POST /api/v1/auth/logout`  
**Purpose:** Log out the authenticated user.

### Headers:
```
Authorization: Bearer JWT_TOKEN
```

### Response:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Possible Errors:
- **401 Unauthorized:** Invalid or expired JWT token.

---

## 4. **Email Verification**

**Endpoint:** `POST /api/v1/auth/verify-email`  
**Purpose:** Verify the user's email address.

### Request Body:
```json
{
  "token": "EMAIL_VERIFICATION_TOKEN"
}
```

### Response:
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### Possible Errors:
- **400 Bad Request:** Invalid or expired email verification token.

---

## 5. **Forgot Password**

**Endpoint:** `POST /api/v1/auth/forgot-password`  
**Purpose:** Initiate the password reset process for a user.

### Request Body:
```json
{
  "email": "john@example.com"
}
```

### Response:
```json
{
  "success": true,
  "message": "Password reset instructions sent to email"
}
```

### Possible Errors:
- **404 Not Found:** No user found with the provided email address.

---

## 6. **Reset Password**

**Endpoint:** `POST /api/v1/auth/reset-password`  
**Purpose:** Reset the user's password using a password reset token.

### Request Body:
```json
{
  "token": "PASSWORD_RESET_TOKEN",
  "newPassword": "newSecurePassword123"
}
```

### Response:
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Possible Errors:
- **400 Bad Request:** Invalid or expired password reset token.
- **400 Bad Request:** New password does not meet security requirements (e.g., insufficient length or strength).

---

## 7. **Get Current User Information**

**Endpoint:** `GET /api/v1/auth/me`  
**Purpose:** Retrieve the currently authenticated user's information.

### Headers:
```
Authorization: Bearer JWT_TOKEN
```

### Response:
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2023-04-15T12:00:00Z",
    "lastLogin": "2023-04-15T14:30:00Z"
  }
}
```

### Possible Errors:
- **401 Unauthorized:** Invalid or expired JWT token.

---

## Error Codes Summary:

| HTTP Status | Description                            |
|-------------|----------------------------------------|
| 400         | Bad Request: Invalid input or token    |
| 401         | Unauthorized: Invalid or expired token |
| 404         | Not Found: User or resource not found  |
| 409         | Conflict: Resource already exists      |

---

## Authorization and Security Notes:
- All endpoints requiring authentication (e.g., Logout, Get Current User) use the `Authorization` header with a Bearer JWT token.
- Tokens should be kept secure and not exposed to clients in a non-secure manner. Consider using HTTP-only cookies to store tokens for better security.

This documentation provides a clear overview of the Authentication API endpoints, making it easier for developers to integrate the authentication flow into their applications.