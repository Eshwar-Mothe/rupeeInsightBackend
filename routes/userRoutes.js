const express = require("express");
const multer = require("multer");
const { addUser } = require("../controllers/userController");

const router = express.Router();

// Set up storage for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Save files in the "uploads" folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname); // Unique filenames
    }
});

const upload = multer({ storage });

router.post("/signup", upload.single("profileImage"), addUser);

module.exports = router;
