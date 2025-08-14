import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import doctorRoutes from './routes/doctor.js';
import patientRoutes from './routes/patient.js';
import prescriptionRoutes from './routes/prescription.js';
import debugRoutes from './routes/debug.js';
import testRoutes from './routes/test.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Define API routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/test', testRoutes);

// Try port 5001 if 5000 is in use
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
