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
// router.put("/users/:id", async (req, res) => {
//     const { id } = req.params;
//     const { name, email, profileImage } = req.body;

//     try {
//         const updatedUser = await User.findByIdAndUpdate(
//             id,
//             { name, email, profileImage },
//             { new: true, runValidators: true }
//         );

//         if (!updatedUser) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         res.status(200).json(updatedUser);
//     } catch (error) {
//         console.error("Error updating user:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });

// module.exports = router;

module.exports = router;
