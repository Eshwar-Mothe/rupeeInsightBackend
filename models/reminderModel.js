const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    type: { type: String, default: "reminder" },
    transactionName: String,
    reminder_title: String,
    reminder_duration: String,
    reminder_dueDate: String,
    amount: String,
    isCompleted: { type: Boolean, default: false },
    isSnoozed: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
});

const Reminder = mongoose.model('Reminder', reminderSchema);
module.exports = Reminder;
