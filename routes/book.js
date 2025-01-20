const express = require("express");
const router = express.Router();
const Book = require("../models/Book");
const auth = require("../middleware/auth");
const upload = require('../middleware/multer'); 


// Middleware to ensure the user is an "emperor"
const isEmperor = (req, res, next) => {
  if (req.user.role !== "emperor") {
    return res.status(403).send("Access denied. Only emperors can perform this action.");
  }
  next();
};

router.post("/", auth, isEmperor, upload.single("bookImage"), async (req, res) => {
    try {
      const { title, author, description } = req.body;
      const bookImage = req.file ? `/uploads/${req.file.filename}` : ""; 
  
      const newBook = new Book({
        title,
        author,
        description,
        image: bookImage,
        createdBy: req.user.id,
      });
  
      const savedBook = await newBook.save();
      res.status(201).json(savedBook);
    } catch (err) {
      res.status(500).send("Server error: " + err.message);
    }
  });

router.get("/", auth, async (req, res) => {
  try {
    const books = await Book.find().populate("createdBy", "username role");
    res.json(books);
  } catch (err) {
    res.status(500).send("Server error: " + err.message);
  }
});


router.get("/:id", auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("createdBy", "username role");
    if (!book) return res.status(404).send("Book not found");
    res.json(book);
  } catch (err) {
    res.status(500).send("Server error: " + err.message);
  }
});


router.delete("/:id", auth, isEmperor, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).send("Book not found");

    await book.remove();
    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).send("Server error: " + err.message);
  }
});


module.exports = router;
