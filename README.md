


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
