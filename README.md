# Roxiler FSDI – Store Rating Platform

A full-stack store rating application with role-based access for System Administrators, Normal Users, and Store Owners.

## Features

### System Administrator

* Dashboard with total users, stores, and ratings.
* Create users and stores, and review user roles and store ratings.
* Search, filter, sort listings, and view user details.

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
│   ├── database/
│   │   └── schema.sql
│   ├── src/
│   │   └── scripts/
│   │       └── create-admin.js
│   ├── test/
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

Create the database and all required tables from the provided schema:

```bash
mysql -u root -p < database/schema.sql
```

In Windows PowerShell, use:

```powershell
cmd /c "mysql -u root -p < database\schema.sql"
```

The schema uses InnoDB foreign keys, unique email addresses, one rating per
user/store pair, and database-level checks for name, address, and rating
limits. Use MySQL 8.0.16 or newer so CHECK constraints are enforced.

Start backend:

```bash
npm run dev
```

Backend runs at `http://localhost:5000`.

### 2a. Create the first administrator

Normal users can self-register, but administrator accounts must be created
from a trusted environment. Add these variables to the backend `.env` file
(do not commit the password), then run the bootstrap script from `backend/`:

```env
ADMIN_NAME=Platform Administrator Account
ADMIN_EMAIL=admin@example.com
ADMIN_ADDRESS=Platform operations
ADMIN_PASSWORD=REPLACE_WITH_A_UNIQUE_PASSWORD
```

Replace the example email and password with values for your own local setup.

```bash
npm run seed:admin
```

The script validates the assessment password/name rules and stores only a
bcrypt hash. It will not overwrite an existing account.

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown by Vite.

For deployments where the API is not at `http://localhost:5000/api`, set
`VITE_API_BASE_URL` to the deployed API's `/api` URL before building.

## Production Build

```bash
cd frontend
npm run build
```

## Checks

Run the frontend lint and unit tests from `frontend/`:

```bash
npm run lint
npm test
```

Run backend tests from `backend/`:

```bash
npm test
```

## Validation

* User and store name: 20–60 characters
* Address: Maximum 400 characters
* Password: 8–16 characters, including an uppercase letter and special character
* Email: Valid email format
* Store rating: Integer from 1 to 5; each user may keep one rating per store and update it later

## Assessment roles

* **System Administrator:** Manage users and stores, review platform totals, and inspect user/store details.
* **Normal User:** Create an account, find stores, and submit or update ratings.
* **Store Owner:** Review the average rating and customer ratings for owned stores.

All roles use the same sign-in page; access to protected actions is enforced by
the API according to the authenticated user's role.

## Repository

https://github.com/Nitishh44/Roxiler-FSDI
