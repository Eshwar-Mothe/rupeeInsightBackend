const express = require("express");
const multer = require("multer");
const { addUser, setReminder, addExpense, addDebt, addInvestment } = require("../controllers/userController");

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
router.post("/expenses", addExpense)
router.post("/loans", addDebt)

router.get('/:userId/totals', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user.totals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
