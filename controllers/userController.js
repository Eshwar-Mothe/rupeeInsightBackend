const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const express = require("express");

const app = express();
app.use(express.json())

const saltRounds = 10;

// Controller function to handle user registration
const addUser = async (req, res) => {
    try {
        console.log("Received Data:", req.body);
        console.log("Received File:", req.file); 

        const { email, password, username, income, mobile, gender, dob, address, city, state, pincode, jobTitle, debt, savings } = req.body;

        // Validate required fields
        if (!email || !password || !username || !income || !mobile || !gender || !dob || !address || !city || !state || !pincode || !jobTitle) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if the user already exists
        const isUserExist = await User.findOne({ email });
        console.log(isUserExist)
        if (isUserExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Handle profile image (store file path)
        let profileImage = null;
        if (req.file) {
            profileImage = `/uploads/${req.file.filename}`;
        }

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            profileImage, // Storing only the file path
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
        console.log("response of mongo",response);

        return res.status(201).json({
            message: "User Registration Successful.",
            user: newUser,
            status:201
        });

    } catch (err) {
        console.error("Error in user registration:", err);
        res.status(500).json({
            message: "Error in registering the user",
            error: err.message,
        });
    }
};

module.exports = { addUser };
