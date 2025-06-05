
````markdown
# 🖥️ URL Shortener Backend

This is the **backend** of a full-stack URL Shortener application built using **Node.js**, **Express**, **PostgreSQL**, and **JWT**. It handles user authentication, URL creation and management, and secure routing.

---

## 🚀 Features

- 🔐 User registration and login with JWT authentication
- 🔗 URL shortening with optional custom short codes
- 📋 Retrieve, edit, and delete shortened URLs
- 🔄 Redirect shortened URLs to original destinations
- 🧱 PostgreSQL integration with user-based URL storage
- 🔒 Auth middleware for protecting endpoints

---

## 🧰 Tech Stack

- Node.js + Express
- PostgreSQL + node-postgres (`pg`)
- JSON Web Tokens (`jsonwebtoken`)
- Dotenv for config
- CORS + Body Parser

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/url-shortener.git
cd url-shortener/backend
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the root of the backend directory:

```env
DB_NAME=your_db_name
DB_PASSWORD=you_db_password
JWT_SECRET=your_super_secret_key 
```

### 4. Setup PostgreSQL Database

Ensure PostgreSQL is installed and running.

#### Create Database

```bash
psql
CREATE DATABASE url_shortener;
\q
```

#### Create Tables

You can run this schema inside `psql` or through any DB GUI:

```sql
-- users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- urls table
CREATE TABLE urls (
  id SERIAL PRIMARY KEY,
  original_url TEXT NOT NULL,
  short_code VARCHAR(100) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🧪 Running the Server

```bash
nodemon index.js
```

Server runs at:

```
http://localhost:3000
```

---
