const mongoose = require('mongoose');


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
    initialDebt: { type: Number },

    transactions: [{
        amount: Number,
        date: Date,
        type: { type: String, enum: ["savings", "expense", "debt", "income"] },
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

    lastIncomeRenewedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
});



userSchema.methods.addReminder = async function (newReminder) {
    this.reminders.push(newReminder);
    await this.save();
    return this;
};

userSchema.methods.addExpense = async function (newExpense) {
    this.expenses.push(newExpense);
    this.transactions.push({
        amount: newExpense.amount,
        date: newExpense.date,
        type: "expense"
    });
    this.totals.totalExpenses += newExpense.amount;
    await this.save();
    return this;
};

userSchema.methods.addDebt = async function (newDebt) {
    this.debts.push(newDebt);
    this.transactions.push({
        amount: newDebt.loanAmount,
        date: newDebt.dueDate || new Date(),
        type: "debt"
    });
    this.totals.totalLoans += newDebt.loanAmount;
    await this.save();
    return this;
};

userSchema.methods.addInvestment = async function (newInvestment) {
    this.investments.push(newInvestment);
    this.transactions.push({
        amount: newInvestment.amount,
        date: newInvestment.date,
        type: "savings"
    });
    this.totals.totalSavings += newInvestment.amount;
    await this.save();
    return this;
};

userSchema.methods.recalculateTotals = function () {
    this.totals.totalExpenses = this.expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    this.totals.totalLoans = this.debts.reduce((sum, debt) => sum + (debt.loanAmount || 0), 0);
    this.totals.totalSavings = this.investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);

    const now = new Date();
    const diffInMs = now - new Date(this.createdAt);
    const monthsSinceCreation = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 30));
    this.totals.totalIncome = this.initialIncome * (monthsSinceCreation + 1);
};

userSchema.methods.renewMonthlyIncome = async function () {
    const now = new Date();
    const lastRenewed = new Date(this.lastIncomeRenewedAt);

    const getLastWorkingDay = (date) => {
        let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        while (lastDay.getDay() === 0 || lastDay.getDay() === 6) {
            lastDay.setDate(lastDay.getDate() - 1);
        }
        return lastDay;
    };

    const lastWorkingDay = getLastWorkingDay(now);

    const isSameDay = now.getDate() === lastWorkingDay.getDate() &&
                      now.getMonth() === lastWorkingDay.getMonth() &&
                      now.getFullYear() === lastWorkingDay.getFullYear();

    const monthChanged = now.getMonth() !== lastRenewed.getMonth() || now.getFullYear() !== lastRenewed.getFullYear();

    if (isSameDay && monthChanged) {
        this.totals.totalIncome += this.initialIncome;
        this.lastIncomeRenewedAt = now;
        this.recalculateTotals();
        await this.save();
        console.log(`Income renewed for user: ${this.email} on last working day.`);
    }
};

userSchema.pre("save", function (next) {
    this.recalculateTotals();
    next();
});

const User = mongoose.model('Users', userSchema);
module.exports = User;
