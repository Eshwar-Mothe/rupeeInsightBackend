const cron = require('node-cron');
const User = require('../models/userModel');

// Runs every day at midnight
cron.schedule('0 0 * * *', async () => {
    console.log("Running daily income renewal cron job...");

    try {
        const users = await User.find({});
        for (const user of users) {
            await user.renewMonthlyIncome(); // This should be defined in userModel.js
        }
        console.log("Income renewal done for all users.");
    } catch (err) {
        console.error("Error during income renewal cron job:", err.message);
    }
});
