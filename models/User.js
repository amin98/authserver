// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // firstName: {
  //   type: String,
  //   default: '',
  // },
  // lastName: {
  //   type: String,
  //   default: '',
  // },
  avatar: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  role:{
    type: String, 
    enum: ['member', 'admin', 'emperor'],
    default: 'member',
  }
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  console.log("Password before hashing: ", this.password);
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);
