const express = require("express");
const multer = require("multer");
const path = require("path");
const { addUser } = require("../controllers/userController");

const router = express.Router();

// Storage configuration
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  console.log("File has to come here in upload.js")
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"), false);
  }
};

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });

router.post("/signup", upload.single("profileImage"), addUser);

module.exports = router;
