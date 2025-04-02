const mongoose = require('mongoose');

// Expense Schema (Sub-document)
const expenseSchema = new mongoose.Schema({
    category: String,
    subcategory: String,
    amount: Number,
    date: Date,
    paymentMethod: String,
    note: String
});

// Loan Schema (Sub-document)
const loanSchema = new mongoose.Schema({
    loanType: String,
    loanAmount: Number,
    remainingBalance: Number,
    interestRate: Number,
    dueDate: Date
});

// Reminder Schema (Sub-document)
const reminderSchema = new mongoose.Schema({
    transactionName: String,
    reminderTitle: String,
    reminderDuration: String,
    reminderDueDate: Date,
    amount: Number,
    isCompleted: Boolean,
    isSnoozed: Boolean,
    isDeleted: Boolean
});

// Savings Schema (Sub-document)
const savingsSchema = new mongoose.Schema({
    goalName: String,
    targetAmount: Number,
    currentAmount: Number,
    dateStarted: Date
});

// Total Schema for Summaries
const totalSchema = new mongoose.Schema({
    totalExpenses: { type: Number, default: 0 },
    totalLoans: { type: Number, default: 0 },
    totalSavings: { type: Number, default: 0 },
    totalIncome: { type: Number, default: 0 }
});

// Main User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: String,
    mobile: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    dob: { type: Date, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    jobTitle: { type: String, required: true },
    debt: { type: Number, default: 0 }, 
    savings: { type: Number, default: 0 }, 
    initialIncome: { type: Number, required: true },
    transactions: [{ 
        amount: Number, 
        date: Date,
        type: { type: String, enum: ["income", "expense"] } 
    }],
    totals: { type: totalSchema, default: () => ({}) },
    createdAt: { type: Date, default: Date.now }
});

// Pre-save Middleware to Auto-update Totals
userSchema.pre('save', function (next) {
    if (!this.totals) {
        this.totals = { totalExpenses: 0, totalLoans: 0, totalSavings: 0, totalIncome: 0 };
    }

    this.totals.totalExpenses = this.transactions?.reduce((sum, txn) => 
        txn.type === "expense" ? sum + (txn.amount || 0) : sum, 0) || 0;

    this.totals.totalLoans = this.debt || 0;

    this.totals.totalSavings = this.savings || 0;

    const monthlyIncome = this.transactions?.reduce((sum, txn) => 
        txn.type === "income" ? sum + (txn.amount || 0) : sum, 0) || 0;

    this.totals.totalIncome = this.initialIncome + monthlyIncome;

    next();
});

const User = mongoose.model('Users', userSchema);
module.exports = User;
