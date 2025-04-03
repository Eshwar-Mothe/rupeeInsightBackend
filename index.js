const express = require("express");
const sendMail = require("./mailService");
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const router = require("./routes/userRoutes");
const User = require('./models/userModel');

const app = express();
const SECRET_KEY = process.env.SECRET_KEY || 'rupeeInsight';
const SALT_ROUNDS = 10;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log("📂 'uploads' folder created successfully.");
}

app.use("/uploads", express.static(uploadsPath));
app.use("", router);

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized access" });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid or expired token" });
        req.userId = decoded.id;
        next();
    });
};

app.post("/sendMail", async (req, res) => {
    try {
        const { to, subject, text } = req.body;
        const isUserExist = await User.findOne({ email: to });
        if (isUserExist) return res.status(400).json({ message: "User already exists" });

        const response = await sendMail({ to, subject, text });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: "Failed to send email." });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Required fields are empty" });

        const userData = await User.findOne({ email });
        if (!userData) return res.status(404).json({ message: "User Not Exist" });

        const isValidPassword = await bcrypt.compare(password, userData.password);
        if (!isValidPassword) return res.status(401).json({ message: "Invalid Password" });

        const token = jwt.sign({ id: userData._id, email: userData.email }, SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ message: "User login Successful", data: userData, token, status: 200 });

    } catch (err) {
        res.status(500).json({ message: "Error in Logging in the user", error: err.message });
    }
});

app.post('/expenses', verifyToken, async (req, res) => {
    try {
        const { category, customCategory, subcategory, customSubCategory, amount, date, paymentMethod, note } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const newExpense = { 
            category: category === "Others" ? customCategory : category,
            subcategory: subcategory === "Others" ? customSubCategory : subcategory,
            amount,
            date,
            paymentMethod,
            note: note || ""
        };

        user.expenses.push(newExpense);
        user.totals.totalExpenses += amount;
        await user.save();

        res.status(201).json({ message: "Expense added successfully", expense: newExpense });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/reminders', verifyToken, async (req, res) => {
    try {
        const { transactionName, reminderTitle, reminderDuration, reminderDueDate, amount } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const newReminder = {
            transactionName,
            reminderTitle,
            reminderDuration,
            reminderDueDate,
            amount,
            isCompleted: false,
            isSnoozed: false,
            isDeleted: false
        };

        user.reminders.push(newReminder);
        await user.save();

        res.status(201).json({ message: "Reminder added successfully", reminder: newReminder });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/loan', verifyToken, async (req, res) => {
    try {
        const { loanType, loanAmount, remainingBalance, interestRate, dueDate } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const newDebt = { loanType, loanAmount, remainingBalance, interestRate, dueDate };
        user.debts.push(newDebt);
        user.totals.totalLoans += loanAmount;
        await user.save();

        res.status(201).json({ message: "Loan details saved successfully", loan: newDebt });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/investments', verifyToken, async (req, res) => {
    try {
        const { investmentType, amount, date, riskLevel, returns } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const newInvestment = { investmentType, amount, date, riskLevel, returns };
        user.investments.push(newInvestment);
        await user.save();

        res.status(201).json({ message: "Investment added successfully", investment: newInvestment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/expenses', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json(user.expenses);
    } catch (err) {
        res.status(500).json({ message: "Error fetching expenses", error: err.message });
    }
});

app.get('/debts', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json(user.debts);
    } catch (err) {
        res.status(500).json({ message: "Error fetching debts", error: err.message });
    }
});

app.get('/home', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message, message: 'Error in fetching UserData' });
    }
});

app.get('/reminders', async (req, res) => {
    try {
        const users = await Reminder.find();
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message, message: 'Error in fetching UserData' });
    }
});

app.get('/expenses', (req, res) => {
    try {

    }
    catch (err) {
        console.log(err)
        res.send({ message: "Error Reading the Expenses Data", Error: err })
    }
})


mongoose.connect(process.env.MONGO_URI, { dbName: "usersData" })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

