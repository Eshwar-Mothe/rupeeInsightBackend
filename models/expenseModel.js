const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    type: { type: String, default: "expense" },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    note: { type: String, default: "" }
});

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
