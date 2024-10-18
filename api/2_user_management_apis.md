
# User Management APIs

## 1. Update User Profile
**Endpoint:** `PUT /api/v1/users/profile`

**Purpose:** Update user profile information

### Headers:
- Authorization: Bearer JWT_TOKEN

### Request Body:
```json
{
    "name": "Updated Name",
    "email": "newemail@example.com",
    "profilePicture": "https://example.com/profile.jpg"
}
```

### Response:
```json
{
    "success": true,
    "message": "Profile updated successfully",
    "user": {
        "id": "user_id",
        "name": "Updated Name",
        "email": "newemail@example.com",
        "profilePicture": "https://example.com/profile.jpg"
    }
}
```

### Possible Errors:
- 400 Bad Request: Invalid input data
- 401 Unauthorized: Invalid or expired token
- 409 Conflict: Email already in use

---

## 2. Change Password
**Endpoint:** `PUT /api/v1/users/change-password`

**Purpose:** Change user's password

### Headers:
- Authorization: Bearer JWT_TOKEN

### Request Body:
```json
{
    "currentPassword": "oldPassword123",
    "newPassword": "newSecurePassword456"
}
```

### Response:
```json
{
    "success": true,
    "message": "Password changed successfully"
}
```

### Possible Errors:
- 400 Bad Request: Invalid current password
- 400 Bad Request: New password doesn't meet security requirements
- 401 Unauthorized: Invalid or expired token

---

## 3. Get User's Active Sessions
**Endpoint:** `GET /api/v1/users/sessions`

**Purpose:** Retrieve a list of user's active sessions

### Headers:
- Authorization: Bearer JWT_TOKEN

### Response:
```json
{
    "success": true,
    "sessions": [
        {
            "id": "session_id_1",
            "device": "Chrome on Windows",
            "ip": "192.168.1.1",
            "lastActive": "2023-04-15T12:00:00Z"
        },
        {
            "id": "session_id_2",
            "device": "Safari on iOS",
            "ip": "10.0.0.1",
            "lastActive": "2023-04-15T13:30:00Z"
        }
    ]
}
```

### Possible Errors:
- 401 Unauthorized: Invalid or expired token

---

## 4. Logout from All Devices
**Endpoint:** `POST /api/v1/users/logout-all`

**Purpose:** Log out user from all active sessions

### Headers:
- Authorization: Bearer JWT_TOKEN

### Response:
```json
{
    "success": true,
    "message": "Logged out from all devices successfully"
}
```

### Possible Errors:
- 401 Unauthorized: Invalid or expired token

---

## 5. Delete User Account
**Endpoint:** `DELETE /api/v1/users/account`

**Purpose:** Permanently delete user account

### Headers:
- Authorization: Bearer JWT_TOKEN

### Request Body:
```json
{
    "password": "currentPassword123"
}
```

### Response:
```json
{
    "success": true,
    "message": "Account deleted successfully"
}
```

### Possible Errors:
- 400 Bad Request: Invalid password
- 401 Unauthorized: Invalid or expired token

---

## 6. Get User Preferences
**Endpoint:** `GET /api/v1/users/preferences`

**Purpose:** Retrieve user preferences

### Headers:
- Authorization: Bearer JWT_TOKEN

### Response:
```json
{
    "success": true,
    "preferences": {
        "theme": "dark",
        "language": "en",
        "currency": "USD",
        "notifications": {
            "email": true,
            "push": false
        }
    }
}
```

### Possible Errors:
- 401 Unauthorized: Invalid or expired token

---

## 7. Update User Preferences
**Endpoint:** `PUT /api/v1/users/preferences`

**Purpose:** Update user preferences

### Headers:
- Authorization: Bearer JWT_TOKEN

### Request Body:
```json
{
    "theme": "light",
    "language": "fr",
    "currency": "EUR",
    "notifications": {
        "email": false,
        "push": true
    }
}
```

### Response:
```json
{
    "success": true,
    "message": "Preferences updated successfully",
    "preferences": {
        "theme": "light",
        "language": "fr",
        "currency": "EUR",
        "notifications": {
            "email": false,
            "push": true
        }
    }
}
```

### Possible Errors:
- 400 Bad Request: Invalid input data
- 401 Unauthorized: Invalid or expired token