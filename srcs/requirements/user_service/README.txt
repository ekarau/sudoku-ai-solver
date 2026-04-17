
ENDPOINT: /api/v1/user/me/ 

METHOD: 
GET 

BODY: 
Yok

OUTPUT JSON: 
{ "id": 5, "username": "user3", "display_name": "user3", "avatar": "/media/avatars/download_3.jpeg", "is_online": false, "is_profile_complete": true }



ENDPOINT: /api/v1/user/signup/

METHOD: 
POST 

BODY (JSON): 
{ "username": "deneme_user", "password": "GuvenliSifre123!", "email": "deneme@example.com", "avatar": "Opsiyonel (File)" } 

OUTPUT JSON: (farklı error mesajlari)
{ "message": "User created successfully", "user": { "username": "deneme_user", "display_name": "deneme_user" } }
{"password":["This password is too short. It must contain at least 8 characters.","This password is too common.","This password is entirely numeric."]}

ENDPOINT: /api/v1/user/login/ 

METHOD:
POST

BODY (JSON): 
{ "username": "deneme_user", "password": "GuvenliSifre123!" }

OUTPUT JSON 
(Success - 200 OK): { "message": "Login successful", "user": { "id": 7, "username": "deneme_user", "display_name": "deneme_user" } }
(Error - 401 Unauthorized): { "error": "Invalid username or password." }

ENDPOINT: /api/v1/user/friends/

METHOD:
GET

BODY:
Yok

OUTPUT JSON
{
  "friends": [
    { "rel_id": 1, "username": "user1", "display_name": "Player_1", "avatar": "/media/avatars/avatar_user1.jpeg", "is_online": true }
  ],
  "pending_requests": [
    { "rel_id": 5, "username": "user2", "display_name": "Player_2", "avatar": "/media/avatars/avatar_user2.jpeg" }
  ]
}

ENDPOINT: /api/v1/user/friends/

METHOD:
POST

HEADERS:
Content-Type: application/json

BODY:
Yok

INPUT JSON
{ 
  "action": "send", 
  "target_username": "kaykin" 
}

OUTPUT JSON
Success (201 Created): { "message": "Request sent to kaykin!" }
Error (400 Bad Request): { "error": "You cannot add yourself." } veya { "message": "Relationship already exists." }
Error (404 Not Found): { "error": "User not found." }

ENDPOINT: /api/v1/user/friends/

METHOD:
POST

HEADERS:
Content-Type: application/json

BODY:
Yok

INPUT JSON
{ 
  "action": "approve", 
  "rel_id": 15 
}

OUTPUT JSON
Success (200 OK): { "message": "Friend request approved!" }
Error (404 Not Found): { "error": "Relationship not found." }

ENDPOINT: /api/v1/user/friends/

METHOD:
POST

HEADERS:
Content-Type: application/json

BODY:
Yok

INPUT JSON
{ 
  "action": "remove", 
  "rel_id": 15 
}

OUTPUT JSON
Success (200 OK): { "message": "Friendship/Request removed." }
Error (404 Not Found): { "error": "Relationship not found." }

ENDPOINT: /api/user/profile/edit/

METHOD:
PUT

HEADERS:
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <your_token>"
}

INPUT JSON:
{
  "display_name": "Yeni Kullanıcı Adı",
  "email": "yeni_email@example.com",
  "avatar": "base64_encoded_image_or_null",
  "remove_avatar": true
}

OUTPUT JSON
{
  "message": "Profile updated successfully",
  "user": {
    "id": 5,
    "username": "user3",
    "display_name": "Yeni Kullanıcı Adı",
    "email": "yeni_email@example.com",
    "avatar": "/media/avatars/new_avatar.jpeg"
  }
}

{
  "error": "Invalid input data."
}

{
  "error": "Authentication credentials were not provided."
}