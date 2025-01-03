// index.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const auth = require('./middleware/auth');
const cookieParser = require('cookie-parser');
const User = require('./models/User');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// middleware to parse JSON
app.use(express.json());

app.use(cookieParser());

app.use("/uploads", express.static("uploads"));

app.use(
  cors({
    origin: 'http://localhost:5173', // Frontend URL in development
    credentials: true, // Allow cookies to be sent
  })
);

app.use('/api/auth', authRoutes);

// Protected route example
app.get('/api/protected', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      message: 'This is a protected route',
      user: user
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
