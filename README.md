# Roxiler FSDI – Store Rating Platform

A full-stack store rating application with role-based access for System Administrators, Normal Users, and Store Owners.

## Features

### System Administrator

* Dashboard with total users, stores, and ratings.
* Add and manage users and stores.
* View user roles and store ratings.
* Search and filter records.

### Normal User

* Sign up and log in.
* Browse and search stores.
* Submit and update store ratings.
* View average ratings and personal ratings.
* Change password.

### Store Owner

* View store rating statistics.
* View users who rated their store.
* View average store rating.
* Change password.

## Tech Stack

* Frontend: React, Vite, CSS
* Backend: Node.js, Express.js
* Database: MySQL
* Authentication: JWT
* Password Hashing: bcryptjs

## Project Structure

```text
Roxiler-FSDI/
├── backend/
│   ├── src/
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   └── package.json
└── README.md
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Nitishh44/Roxiler-FSDI.git
cd Roxiler-FSDI
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=roxiler_db
DB_PORT=3306
JWT_SECRET=your_secure_secret
```

Create the `roxiler_db` database in MySQL and configure the required tables.

Start backend:

```bash
npm run dev
```

Backend runs at `http://localhost:5000`.

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown by Vite.

## Production Build

```bash
cd frontend
npm run build
```

## Validation

* Name: 20–60 characters
* Address: Maximum 400 characters
* Password: 8–16 characters, including an uppercase letter and special character
* Email: Valid email format

## Repository

https://github.com/Nitishh44/Roxiler-FSDI
