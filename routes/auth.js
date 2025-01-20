// routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const upload = require("../middleware/multer");

router.post("/register", upload.single("profileImage"), async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);

    const { username, bio, email, password, role } = req.body;
    const profileImage = req.file ? `/uploads/${req.file.filename}` : "";

    const user = new User({
      username,
      bio,
      email,
      password,
      avatar: profileImage,
      role: role || "member",
    });

    await user.save();
    res.status(201).send("User registered successfully");
  } catch (err) {
    console.error("Registration Error:", err.message || err);
    res.status(400).send(err.message);
  }
});

router.post("/validate-password", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("Invalid email or password");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid email or password");

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });

    res.json({ username: user.username, role: user.role });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.send("Logged out");
});

// router.get("/me", auth, (req, res) => {
//   res.json({ username: req.user.username, role: req.user.role });
// });

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      username: user.username,
      role: user.role, 
    });
  } catch (err) {
    console.error('Auth Error:', err.message);
    res.status(500).send('Server error');
  }
});


router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

router.put(
  "/profile",
  auth,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const updates = req.body;

      if (req.file) {
        updates.avatar = `/uploads/${req.file.filename}`;
      }

      const user = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true,
      }).select("-password");
      res.json(user);
    } catch (err) {
      res.status(500).send("Unable to update profile");
    }
  }
);

router.post("/validate-email", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      res.json({ valid: true });
    } else {
      res.status(400).json({ valid: false, message: "Email not found" });
    }
  } catch (err) {
    res.status(500).json({ valid: false, message: "Server error" });
  }
});

module.exports = router;
