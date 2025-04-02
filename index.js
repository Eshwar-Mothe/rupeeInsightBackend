const express = require("express");
const sendMail = require("./mailService");
const fs = require('fs')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const { data } = require("react-router-dom");
const { message } = require("antd");
const { error } = require("console");
const Expense = require('./models/expenseModel');
const Reminder = require('./models/reminderModel');
const Loan = require("./models/loanModel");
const User = require('./models/userModel');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const router = require("./routes/userRoutes");


const app = express();

const secret_key = 'rupeeInsight'
const salt = 10


app.use(express.json());  
app.use(express.urlencoded({ extended: true }));  

app.use("/uploads", express.static("uploads"));
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use("", router)

// Post methods




app.post("/sendMail", async (req, res) => {
    console.log("Received Data:", req.body);
    try {
        const { to, subject, text } = req.body;

        const isUserExist = await User.findOne({ to });
        if (isUserExist) {
            return res.status(400).json({ message: "User already exists" });
        }
        const payload = { to, subject, text };

        console.log("Sent:", payload);
        const response = await sendMail(payload);
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to send email." });
    }
});

app.post("/verifyOtp", async (req,res) => {
    try{
        const { email, otp, generatedOtp } = req.body;

    }
    catch(err){

    }
})

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Required fields are empty" });
        }

        const userData = await User.findOne({ email: email });

        if (!userData) {
            return res.status(404).json({ message: "User Not Exist" });
        }

        const isValidPassword = await bcrypt.compare(password, userData.password);

        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid Password" });
        }

        const token = jwt.sign({ id: userData._id, email: userData.email }, secret_key, { expiresIn: '1h' });

        res.status(200).json({ message: "User login Successful", data: userData, token, status: 200 });

    } catch (err) {
        res.status(500).json({ message: "Error in Logging in the user", error: err.message });
    }
});


app.post('/expenses', async (req, res) => {
    try {
        const { category, customCategory, subcategory, customSubCategory, amount, date, paymentMethod, note } = req.body;

        const newExpense = new Expense({
            type: "expense",
            category: category === "Others" ? customCategory : category,
            subcategory: subcategory === "Others" ? customSubCategory : subcategory,
            amount,
            date,
            paymentMethod,
            note: note || ""
        });

        await newExpense.save();
        res.status(201).json({ message: "Expense added successfully", expense: newExpense });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/reminders', async (req, res) => {
    try {
        const { transactionName, reminderTitle, reminderDuration, reminderDueDate, amount } = req.body;

        const newReminder = new Reminder({
            type: "reminder",
            transactionName,
            reminder_title: reminderTitle,
            reminder_duration: reminderDuration,
            reminder_dueDate: reminderDueDate,
            amount,
            isCompleted: false,
            isSnoozed: false,
            isDeleted: false,
        });

        await newReminder.save();
        res.status(201).json({ message: "Reminder added successfully", reminder: newReminder });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post('/loan', async (req, res) => {
    try {
        const { loanAmount, interestRate, tenure, borrowerName, remainingBalance, startDate } = req.body;

        const newLoan = new Loan({
            loanAmount,
            interestRate,
            tenure,
            borrowerName,
            remainingBalance,
            startDate,
            isPaidOff: false
        });

        await newLoan.save();
        res.status(201).json({ message: "Loan details saved successfully", loan: newLoan });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Get Methods

app.get('/dashboard', async (req, res) => {
    try {
        const users = await User.find();
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

app.get('/debts', (req, res) => {
    try {
    }
    catch (err) {
        console.log(err)
        res.send({ message: "Error Reading the Debts Data", Error: err })
    }
})

// MongoDB Connection

mongoose.connect(process.env.MONGO_URI, {
    dbName: "usersData"
})
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Error:", err));

const PORT = process.env.Port || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
