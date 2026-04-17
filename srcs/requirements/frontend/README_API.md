# API SPECIFICATION (Login & Register)

---------------------------------------------------
1. LOGIN REQUEST
---------------------------------------------------
URL:      POST /api/users/auth/login
Headers:  Content-Type: application/json

[REQUEST BODY] (Frontend sends this):
{
    "username": "testuser",
    "password": "securePassword123"
}

[RESPONSE - SUCCESS] (Status: 200 OK):
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com",
        "avatar": "/media/avatars/default.png"
    }
}

[RESPONSE - ERROR] (Status: 400 Bad Request or 401 Unauthorized):
{
    "success": false,
    "message": "Invalid username or password."
}

---------------------------------------------------
2. REGISTER REQUEST
---------------------------------------------------
URL:      POST /api/users/auth/register
Headers:  Content-Type: application/json

[REQUEST BODY] (Frontend sends this):
{
    "username": "newplayer",
    "email": "player@example.com",
    "password": "securePassword123"
}

[RESPONSE - SUCCESS] (Status: 201 Created):
{
    "success": true,
    "message": "Registration successful! Please log in.",
    "user_id": 15
}

[RESPONSE - ERROR] (Status: 400 Bad Request):
{
    "success": false,
    "message": "Username is already taken."
}