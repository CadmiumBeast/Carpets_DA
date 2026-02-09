# Authentication System Documentation

## Overview
Complete authentication system with role-based routing for customers and admins.

## Features
- **Login**: Username/password authentication for both customers and admins
- **Signup**: Customer registration only
- **Role-Based Routing**: 
  - Customers → Main webpage (/)
  - Admins → Admin portal (/admin)
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcryptjs for secure password storage

## Server Setup

### Authentication Routes
- `POST /api/auth/signup` - Customer registration
- `POST /api/auth/login` - Login for all users
- `GET /api/auth/verify` - Verify JWT token

### Database Schema
```javascript
User Model:
- username (String, required, unique)
- password (String, required, hashed)
- role (String: 'customer' | 'admin')
- email (String)
- fullName (String)
- timestamps
```

### Middleware
Located in `/server/middleware/authMiddleware.js`:
- `authMiddleware` - Verify JWT token
- `adminOnly` - Restrict to admin users
- `customerOnly` - Restrict to customer users

#### Usage Example:
```javascript
const { authMiddleware, adminOnly } = require('./middleware/authMiddleware');

// Protected route for admins only
router.get('/admin/dashboard', authMiddleware, adminOnly, (req, res) => {
  res.json({ message: 'Admin dashboard', user: req.user });
});
```

## Client Setup

### Components
1. **Login** (`/client/src/auth/login.jsx`)
   - Username/password form
   - Role-based redirect after login

2. **Signup** (`/client/src/auth/signup.jsx`)
   - Customer registration form
   - Full name, email, username, password

3. **ProtectedRoute** (`/client/src/auth/ProtectedRoute.jsx`)
   - HOC for route protection
   - Role-based access control

### React Router Setup Example
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './auth/login';
import Signup from './auth/signup';
import { ProtectedRoute } from './auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Customer routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerHomePage />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin routes */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
```

### useAuth Hook
```jsx
import { useAuth } from './auth/ProtectedRoute';

function MyComponent() {
  const { isAuthenticated, user, logout } = useAuth();
  
  return (
    <div>
      <p>Welcome, {user.fullName}!</p>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Environment Variables
Create a `.env` file in the server directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
PORT=5000
```

## Testing

### Create Admin User (MongoDB)
Since signup only creates customers, you'll need to manually create an admin user:

```javascript
// Run in MongoDB shell or add a seed script
db.users.insertOne({
  username: "admin",
  password: "$2a$10$...", // Hash "admin123" with bcrypt
  role: "admin",
  email: "admin@example.com",
  fullName: "System Administrator",
  createdAt: new Date(),
  updatedAt: new Date()
});
```

Or create a seed script in `/server/scripts/createAdmin.js`:
```javascript
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const admin = new User({
    username: 'admin',
    password: 'admin123', // Will be hashed automatically
    role: 'admin',
    email: 'admin@example.com',
    fullName: 'System Administrator'
  });
  
  await admin.save();
  console.log('Admin user created');
  process.exit(0);
}

createAdmin();
```

Run: `node scripts/createAdmin.js`

## API Request Examples

### Signup (Customer)
```javascript
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123",
  "email": "john@example.com",
  "fullName": "John Doe"
}
```

### Login
```javascript
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "john_doe",
    "role": "customer",
    "email": "john@example.com",
    "fullName": "John Doe"
  }
}
```

### Protected Request
```javascript
GET http://localhost:5000/api/protected-route
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Security Features
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens expire in 7 days
- CORS enabled for cross-origin requests
- Protected routes require valid JWT
- Role-based access control
- Client-side route guards

## Styling
The auth components use a modern, responsive design with:
- Gradient background
- Card-based layout
- Smooth animations
- Form validation feedback
- Mobile-responsive

## Next Steps
1. Add password reset functionality
2. Implement email verification
3. Add remember me feature
4. Set up refresh tokens
5. Add OAuth providers (Google, Facebook)
6. Implement rate limiting
7. Add CAPTCHA for signup
