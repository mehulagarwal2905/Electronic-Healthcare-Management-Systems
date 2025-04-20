
# MedConnect Backend Implementation Guide

This document provides guidance on implementing the backend services for the MedConnect healthcare portal using Node.js, Express, and MongoDB.

## Project Structure

```
backend/
├── config/             # Configuration files
│   └── db.js           # MongoDB connection
├── controllers/        # Route controllers
│   ├── auth.js         # Authentication controller
│   ├── doctor.js       # Doctor functionality
│   └── patient.js      # Patient functionality
├── models/             # MongoDB models
│   ├── User.js         # User model with role
│   ├── Prescription.js # Prescription model
│   └── LabReport.js    # Lab report model
├── middleware/         # Custom middleware
│   ├── auth.js         # Authentication middleware
│   └── roles.js        # Role-based access control
├── routes/             # API routes
│   ├── auth.js         # Authentication routes
│   ├── doctor.js       # Doctor routes
│   └── patient.js      # Patient routes
├── utils/              # Utility functions
├── .env                # Environment variables
├── package.json        # Dependencies
└── server.js           # Entry point
```

## Implementation Steps

### 1. Initialize the Project

```bash
mkdir medconnect-backend
cd medconnect-backend
npm init -y
```

### 2. Install Dependencies

```bash
npm install express mongoose bcryptjs jsonwebtoken dotenv cors
npm install --save-dev nodemon
```

### 3. Set Up Environment Variables

Create a `.env` file:

```
MONGO_URI=mongodb://localhost:27017/medconnect
JWT_SECRET=your_jwt_secret
PORT=5000
```

### 4. Connect to MongoDB

Create `config/db.js`:

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### 5. Create Models

#### User Model (`models/User.js`):

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['patient', 'doctor'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with stored password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
```

#### Prescription Model (`models/Prescription.js`):

```javascript
const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medication: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  instructions: {
    type: String
  },
  issuedDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('Prescription', PrescriptionSchema);
```

### 6. Authentication Middleware

Create `middleware/auth.js`:

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const doctor = (req, res, next) => {
  if (req.user && req.user.role === 'doctor') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as a doctor' });
  }
};

const patient = (req, res, next) => {
  if (req.user && req.user.role === 'patient') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as a patient' });
  }
};

module.exports = { protect, doctor, patient };
```

### 7. Controllers

#### Authentication Controller (`controllers/auth.js`):

```javascript
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getUserProfile };
```

### 8. Routes

#### Authentication Routes (`routes/auth.js`):

```javascript
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

module.exports = router;
```

### 9. Server Setup

Create `server.js`:

```javascript
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');

// Route imports
const authRoutes = require('./routes/auth');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 10. Update Frontend to Connect to Backend

In your frontend React application, update the API calls to connect to your backend:

```javascript
// Example API service
const API_URL = 'http://localhost:5000/api';

// Register user
export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to register');
  }
  
  return data;
};

// Login user
export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to login');
  }
  
  // Store user info in localStorage
  localStorage.setItem('user', JSON.stringify(data));
  
  return data;
};

// Get prescriptions for patient
export const getPatientPrescriptions = async (token) => {
  const response = await fetch(`${API_URL}/patient/prescriptions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch prescriptions');
  }
  
  return data;
};
```

## Additional Recommendations

1. Implement proper error handling throughout the application
2. Add input validation using a library like Joi or express-validator
3. Implement rate limiting to prevent abuse
4. Set up proper logging with Winston or similar libraries
5. Add CSRF protection for production
6. Consider implementing refresh tokens for better security
7. Set up automated testing with Jest

## Connecting Frontend to Backend

In your React components, update the API calls to use the service functions:

```javascript
import { loginUser } from '../services/api';

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    const userData = await loginUser(email, password);
    // Navigate based on user role
    if (userData.role === 'patient') {
      navigate('/patient-dashboard');
    } else {
      navigate('/doctor-dashboard');
    }
  } catch (error) {
    toast({
      title: 'Login failed',
      description: error.message,
      variant: 'destructive',
    });
  } finally {
    setIsLoading(false);
  }
};
```
