const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/book');
const auth = require('./middleware/auth');
const cookieParser = require('cookie-parser');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Parse JSON
app.use(cookieParser()); // Parse cookies

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

// CORS configuration
app.use(
  cors({
    origin: 'http://localhost:5173', // Frontend URL during development
    credentials: true, // Allow cookies to be sent
  })
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes); // Add book routes



// Protected route example
app.get('/api/protected', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      message: 'This is a protected route',
      user: user,
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("Uploads directory created");
}

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
