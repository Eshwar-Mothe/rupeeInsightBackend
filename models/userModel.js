const mongoose = require('mongoose');

// ====== Subschemas ======
const expenseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    paymentMethod: { type: String, required: true },
    type: { type: String, required: true },
    note: { type: String, default: "" },
});

const debtsSchema = new mongoose.Schema({
    loanType: String,
    loanAmount: Number,
    remainingBalance: Number,
    interestRate: Number,
    dueDate: Date,
});

const investmentSchema = new mongoose.Schema({
    investmentType: String,
    amount: Number,
    date: Date,
    riskLevel: String,
    returns: Number,
});

const reminderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reminderCategory: { type: String, required: true },
    reminderTitle: { type: String, required: true },
    reminderDuration: { type: String, required: true },
    reminderDueDate: { type: Date, required: true }, 
    amount: { type: Number, required: true }, 
    isCompleted: { type: Boolean, default: false },
    isSnoozed: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
});

// ====== Main User Schema ======
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
        type: { type: String, enum: ["income", "expense"] },
    }],

    expenses: [expenseSchema],
    debts: [debtsSchema],
    investments: [investmentSchema],
    reminders: [reminderSchema],

    totals: {
        totalExpenses: { type: Number, default: 0 },
        totalLoans: { type: Number, default: 0 },
        totalSavings: { type: Number, default: 0 },
        totalIncome: { type: Number, default: 0 },
    },

    createdAt: { type: Date, default: Date.now },
});

// ====== Instance Methods ======
userSchema.methods.addReminder = async function (newReminder) {
    this.reminders.push(newReminder);
    await this.save();
    return this;
};

userSchema.methods.addExpense = async function (newExpense) {
    this.expenses.push(newExpense);
    this.totals.totalExpenses += newExpense.amount;
    await this.save();
    return this;
};

userSchema.methods.addDebt = async function (newDebt) {
    this.debts.push(newDebt);
    this.totals.totalLoans += newDebt.loanAmount;
    await this.save();
    return this;
};

userSchema.methods.addInvestment = async function (newInvestment) {
    this.investments.push(newInvestment);
    this.totals.totalSavings += newInvestment.amount;
    await this.save();
    return this;
};

// ====== Recalculate All Totals Method ======
userSchema.methods.recalculateTotals = function () {
    this.totals.totalExpenses = this.expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    this.totals.totalLoans = this.debts.reduce((sum, debt) => sum + (debt.loanAmount || 0), 0);
    this.totals.totalSavings = this.investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    this.totals.totalIncome = this.transactions
        .filter(tx => tx.type === "income")
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);
};

// ====== Optional: Auto-recalculate before save ======
userSchema.pre("save", function (next) {
    this.recalculateTotals();
    next();
});

// ====== Export User Model ======
const User = mongoose.model('Users', userSchema);
module.exports = User;
