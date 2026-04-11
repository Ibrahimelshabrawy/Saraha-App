# 📩 Saraha App Backend API

![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![Express](https://img.shields.io/badge/Express.js-Framework-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![Redis](https://img.shields.io/badge/Redis-Caching-red)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-blue)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange)
![Production Ready](https://img.shields.io/badge/Status-Production--Ready-success)
![Live Server](https://img.shields.io/badge/Live-AWS%20EC2-success)

A production-ready anonymous messaging backend API built using Node.js, Express, MongoDB, Redis, and Cloudinary with secure authentication, OTP verification, 2FA support, Google OAuth login, caching system, and token revocation.

---
## 🌍 Live Demo (Production)

The API is deployed and running on AWS EC2:

🔗 http://54.86.101.39

---

# 🚀 Features

## 🔐 Authentication System

- User Signup with email verification
- OTP Confirmation using Redis
- Login with JWT
- Refresh Token support
- Logout (single device)
- Logout (all devices)
- Google OAuth Login
- Two Factor Authentication (2FA)
- Login confirmation OTP
- Auto delete account if email not confirmed within 24 hours

---

## 🔑 Token Security System

- Access Token generation
- Refresh Token rotation
- Token revocation per device
- Logout all sessions support
- Credential change invalidates previous tokens
- Redis revoke-token storage

---

## 📧 OTP Protection Layer

Used for:

- Email confirmation
- Login confirmation
- Reset password
- Enable 2FA

Includes:

- expiration control
- resend protection
- attempt limiting
- temporary blocking after abuse

---

## 👤 Profile Management

Users can:

- Get profile (Redis cached)
- Share public profile
- Update profile data
- Change password securely
- Upload profile picture
- Upload cover pictures
- Delete profile picture
- Delete account
- Admin delete users
- Track profile visit count

Sensitive data like ( phone numbers - password ) stored encrypted.

---

## 📸 Media Upload System

Cloudinary integration supports:

- profile images upload
- cover images upload
- archive old profile pictures automatically
- secure cloud storage handling

---

## 💬 Anonymous Messaging System

Supports:

- sending anonymous messages
- attaching multiple images
- retrieving single message
- retrieving all messages

Endpoints:

POST /message/send  
GET  /message/:messageId  
GET  /message

---

## 🛡️ Security Features

- bcrypt password hashing
- JWT authentication
- Redis caching
- login attempt limiter
- OTP resend limiter
- helmet protection headers
- express-rate-limit middleware
- encrypted sensitive fields
- centralized error handling
- Joi validation middleware

---

# 🧠 Redis Usage

Redis powers:

- OTP storage
- OTP expiration tracking
- resend attempt limits
- login failure blocking
- profile caching
- token revocation system
- 2FA verification flow

---

# 🌐 Google OAuth Support

POST /user/signup/gmail

Automatically creates account if user does not exist.

---

# 👁 Profile Visit Counter

GET /user/visit-profile/:id

Admin access only.

---
# 📂 Project Structure
```
Saraha-App
│
├── src
│   │
│   ├── common
│   │   │
│   │   ├── enum
│   │   │   ├── email.enum.js
│   │   │   ├── multer.enum.js
│   │   │   └── user.enum.js
│   │   │
│   │   ├── middleware
│   │   │   ├── Auth
│   │   │   │   ├── authentication.middleware.js
│   │   │   │   └── authorization.middleware.js
│   │   │   │
│   │   │   ├── multer
│   │   │   │   └── multer.js
│   │   │   │
│   │   │   └── validation
│   │   │       └── validation.middleware.js
│   │   │
│   │   ├── utils
│   │   │   │
│   │   │   ├── cloudinary
│   │   │   │   └── cloudinary.js
│   │   │   │
│   │   │   ├── email
│   │   │   │   ├── email.event.js
│   │   │   │   ├── email.template.js
│   │   │   │   └── sendEmail.js
│   │   │   │
│   │   │   ├── helpers
│   │   │   │   ├── files.js
│   │   │   │   └── generalRules.validation.js
│   │   │   │
│   │   │   ├── jwt
│   │   │   │   └── token.service.js
│   │   │   │
│   │   │   ├── response
│   │   │   │   └── success.response.js
│   │   │   │
│   │   │   └── Security
│   │   │       ├── encryption.security.js
│   │   │       └── hash.security.js
│   │
│   ├── DB
│   │   │
│   │   ├── models
│   │   │   ├── message.model.js
│   │   │   └── user.model.js
│   │   │
│   │   ├── redis
│   │   │   ├── redis.db.js
│   │   │   └── redis.services.js
│   │   │
│   │   ├── connectionDB.js
│   │   └── db.services.js
│   │
│   ├── modules
│   │   │
│   │   ├── messages
│   │   │   ├── message.controller.js
│   │   │   ├── message.service.js
│   │   │   └── message.validation.js
│   │   │
│   │   └── users
│   │       ├── user.controller.js
│   │       ├── user.services.js
│   │       └── user.validation.js
│   │
│   ├── config
│   │   ├── config.service.js
│   │   ├── development.env
│   │   └── production.env
│   │
│   ├── app.controller.js
│   └── index.js
│
├── uploads
├── email.html
├── .gitignore
├── package.json
└── package-lock.json
```

# 🛠 Tech Stack

Backend

- Node.js
- Express.js

Database

- MongoDB
- Mongoose

Authentication

- JWT
- bcrypt

Caching & Security

- Redis
- Helmet
- Express Rate Limit

File Upload

- Multer
- Cloudinary

Validation

- Joi

Email Service

- Nodemailer

OAuth

- Google Auth Library

---

# ⚙️ Environment Variables

Create .env file:

PORT  
SALT_ROUNDS   
DB_URI   
DB_URI_ONLINE   
ENCRYPT_SECRET_KEY   
ACCESS_SECRET_KEY    
REFRESH_SECRET_KEY   
EXPIRES_IN  
WEB_CLIENT_ID  
REDIS_URI   
EMAIL  
PASSWORD  
WHITELIST  
CLOUD_NAME   
CLOUD_API_KEY   
CLOUD_API_SECRET 

---

# ▶️ Running The Project

Development mode:

npm run start:dev

Production mode:

npm run start:prod

---

# 🔐 Authentication Endpoints

POST /user/signup  
POST /user/signup/gmail  
POST /user/signin  
PATCH /user/confirm-email  
POST /user/resend-otp  
PATCH /user/forget-password  
PATCH /user/reset-password  
GET   /user/refreshToken  
GET   /user/logout  
POST  /user/enable-2fa  
POST  /user/confirm-enable-2fa  
POST  /user/login-confirmation

---

# 👤 User Endpoints

GET    /user/profile  
GET    /user/share-profile/:id  
GET    /user/visit-profile/:id  

PATCH  /user/update-profile/:id  
PATCH  /user/update-password  

PATCH  /user/update-coverPics  
PATCH  /user/upload-profilePicture  

DELETE /user/delete-profilePicture  
DELETE /user/delete-user  
DELETE /user/delete-user-ByAdmin/:id

---

# 💬 Message Endpoints

POST /message/send  
GET  /message/:messageId  
GET  /message

---

# 👨‍💻 Author

Ibrahim Elshabrawy  
Backend Developer (Node.js)  
Computer Science Student — Mansoura University
