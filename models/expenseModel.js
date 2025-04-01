const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    type: { type: String, default: "expense" },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true }, // Storing as formatted string (e.g., "YYYY-MM-DD")
    paymentMethod: { type: String, required: true },
    note: { type: String, default: "" }
});

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
