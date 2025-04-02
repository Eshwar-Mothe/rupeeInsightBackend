const express = require("express");
const multer = require("multer");
const { addUser, setReminder } = require("../controllers/userController");

const router = express.Router();


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); 
    },
    filename: (req, file, cb) => {
        console.log("this is userRoutes")
        cb(null, Date.now() + "-" + file.originalname); 
    }
});

const upload = multer({ storage });

router.post("/signup", upload.single("profileImage"), addUser);
router.post("/reminders", setReminder)
module.exports = router;
