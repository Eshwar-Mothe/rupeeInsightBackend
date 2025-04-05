const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const express = require("express");

const app = express();
app.use(express.json());

const saltRounds = 10;


const addUser = async (req, res) => {
    try {
        console.log("Received Data:", req.body);
        console.log("Received File:", req.file);

        const { email, password, username, income, mobile, gender, dob, address, city, state, pincode, jobTitle, debt, savings } = req.body;

        if (!email || !password || !username || !income || !mobile || !gender || !dob || !address || !city || !state || !pincode || !jobTitle) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const isUserExist = await User.findOne({ email });
        if (isUserExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        let profileImage = null;
        if (req.file) {
            profileImage = `/uploads/${req.file.filename}`;
        }

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            profileImage,
            mobile,
            gender,
            dob,
            address,
            city,
            state,
            pincode,
            jobTitle,
            debt,
            savings,
            initialIncome: income,
        });

        const response = await newUser.save();
        console.log("User Registered:", response);

        return res.status(201).json({
            message: "User Registration Successful.",
            user: newUser,
            status: 201
        });

    } catch (err) {
        console.error("Error in user registration:", err);
        res.status(500).json({ message: "Error in registering the user", error: err.message });
    }
};


const setReminder = async (req, res) => {
    try {
        console.log("Fetching the reminder data...");

        const { userId, reminderCategory, reminderTitle, reminderDuration, reminderDueDate, amount } = req.body;
        const price = Number(amount);

        // Convert DD/MM/YYYY to YYYY-MM-DD
        const [day, month, year] = reminderDueDate.split("/");
        const formattedDate = new Date(`${year}-${month}-${day}`);

        if (isNaN(formattedDate.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        console.log("Received Data for Reminder:", userId, reminderCategory, reminderTitle, reminderDuration, reminderDueDate, amount);

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newReminder = {
            userId,
            reminderCategory,
            reminderTitle,
            reminderDuration,
            reminderDueDate: formattedDate,
            amount: price,
            isCompleted: false,
            isSnoozed: false,
            isDeleted: false,
        };

        user.reminders.push(newReminder);
        await user.save();

        res.status(201).json({ message: "Reminder added successfully", reminder: newReminder });
    } catch (err) {
        console.error("Error adding reminder:", err);
        res.status(500).json({ error: err.message });
    }
};


const addExpense = async (req, res) => {
    try {
        console.log("receieved Data", req.body)
        const { category, subcategory, amount, date, paymentMethod, note, type, userId, } = req.body;

        if (!userId || !category || !subcategory || !amount || !date || !paymentMethod) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const formattedDate = new Date(date);

        if (isNaN(formattedDate.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newExpense = { category, subcategory, amount, date: formattedDate, paymentMethod, type, note };
         user.expenses.push(newExpense);
        await user.save()

        res.status(201).json({ message: "Expense added successfully", expense: newExpense });
    } catch (err) {
        console.error("Error adding expense:", err);
        res.status(500).json({ error: err.message });
    }
};


const addDebt = async (req, res) => {
    try {
        const { userId, loanType, loanAmount, remainingBalance, interestRate, dueDate } = req.body;

        if (!userId || !loanType || !loanAmount || !remainingBalance || !interestRate || !dueDate) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const formattedDate = new Date(dueDate);
        if (isNaN(formattedDate.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newDebt = { loanType, loanAmount, remainingBalance, interestRate, dueDate: formattedDate };
        await user.addDebt(newDebt);

        res.status(201).json({ message: "Debt added successfully", debt: newDebt });
    } catch (err) {
        console.error("Error adding debt:", err);
        res.status(500).json({ error: err.message });
    }
};


const addInvestment = async (req, res) => {
    try {
        const { userId, investmentType, amount, date, riskLevel, returns } = req.body;

        if (!userId || !investmentType || !amount || !date || !riskLevel || !returns) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const formattedDate = new Date(date);
        if (isNaN(formattedDate.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newInvestment = { investmentType, amount, date: formattedDate, riskLevel, returns };
        await user.investments.push(newInvestment);

        res.status(201).json({ message: "Investment added successfully", investment: newInvestment });
    } catch (err) {
        console.error("Error adding investment:", err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { addUser, setReminder, addExpense, addDebt, addInvestment };
