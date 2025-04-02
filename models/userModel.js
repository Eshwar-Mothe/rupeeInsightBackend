const mongoose = require('mongoose');

// Expense Schema
const expenseSchema = new mongoose.Schema({
    category: String,
    subcategory: String,
    amount: Number,
    date: Date,
    paymentMethod: String,
    note: String
});

// Loan Schema (renamed debtsSchema)
const debtsSchema = new mongoose.Schema({
    loanType: String,
    loanAmount: Number,
    remainingBalance: Number,
    interestRate: Number,
    dueDate: Date
});

// Investment Schema
const investmentSchema = new mongoose.Schema({
    investmentType: String,
    amount: Number,
    date: Date,
    riskLevel: String,
    returns: Number
});

// Reminder Schema
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

// User Schema
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
    initialIncome: { type: Number, required: true },

    transactions: [{ 
        amount: Number, 
        date: Date,
        type: { type: String, enum: ["income", "expense"] } 
    }],

    expenses: [expenseSchema],  // Added Expenses Array
    debts: [debtsSchema],       // Added Debts Array
    investments: [investmentSchema], // Added Investments Array
    reminders: [reminderSchema], // Added Reminders Array

    totals: { 
        totalExpenses: { type: Number, default: 0 },
        totalLoans: { type: Number, default: 0 },
        totalSavings: { type: Number, default: 0 },
        totalIncome: { type: Number, default: 0 }
    },

    createdAt: { type: Date, default: Date.now }
});

// 🔹 Method to Push New Reminder
userSchema.methods.addReminder = async function (newReminder) {
    this.reminders.push(newReminder);
    await this.save();
    return this;
};

// 🔹 Method to Push New Expense
userSchema.methods.addExpense = async function (newExpense) {
    this.expenses.push(newExpense);
    this.totals.totalExpenses += newExpense.amount; // Update total
    await this.save();
    return this;
};

// 🔹 Method to Push New Debt
userSchema.methods.addDebt = async function (newDebt) {
    this.debts.push(newDebt);
    this.totals.totalLoans += newDebt.loanAmount; // Update total
    await this.save();
    return this;
};

// 🔹 Method to Push New Investment
userSchema.methods.addInvestment = async function (newInvestment) {
    this.investments.push(newInvestment);
    await this.save();
    return this;
};

// Create Model
const User = mongoose.model('Users', userSchema);
module.exports = User;
