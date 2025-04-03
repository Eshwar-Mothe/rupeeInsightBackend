const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const express = require("express");

const app = express();
app.use(express.json())

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
        console.log(isUserExist)
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
            initialIncome: income
        });

        const response = await newUser.save();
        console.log("response of mongo", response);

        return res.status(201).json({
            message: "User Registration Successful.",
            user: newUser,
            status: 201
        });

    } catch (err) {
        console.error("Error in user registration:", err);
        res.status(500).json({
            message: "Error in registering the user",
            error: err.message,
        });
    }
};

const setReminder = async (req,res) => {
    console.log("Fetching the reminder data...");

    try {
        const { userId, reminderCategory, reminderTitle, reminderDuration, reminderDueDate, amount } = req.body;

        const price = Number(amount);

        const [day, month, year] = reminderDueDate.split("/");
        const formattedDate = new Date(`${year}-${month}-${day}`);

        if (isNaN(formattedDate.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        console.log("received Data from PostReminder",userId, reminderCategory, reminderTitle, reminderDuration, reminderDueDate, amount)

        const user = await User.findById(userId);
        // console.log("User finding by id in userController",user)
        if (!user) {
            console.log("User not found")
            return res.status(404).json({ message: "User not found" });
        }

        const newReminder = {
            userId,
            reminderCategory,
            reminderTitle,
            reminderDuration,
            reminderDueDate:formattedDate,
            amount:price,
            isCompleted: false,
            isSnoozed: false,
            isDeleted: false,
        };
        user.reminders.push(newReminder);
        console.log("reminers after adding reminder", user.reminders)

        const response = await user.save();
        console.log("response for reminder", response);

        res.status(201).json({ message: "Reminder added successfully", reminder: newReminder });
    } catch (err) {
        console.error("Error adding reminder:", err);
        res.status(500).json({ error: err.message });
    }
}

module.exports = { addUser, setReminder };
