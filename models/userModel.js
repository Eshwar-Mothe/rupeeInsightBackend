const mongoose = require('mongoose');


const expenseSchema = new mongoose.Schema({
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    paymentMethod: { type: String, required: true },
    note: { type: String, default: "" },
});


const debtsSchema = new mongoose.Schema({
    loanType: String,
    loanAmount: Number,
    remainingBalance: Number,
    interestRate: Number,
    dueDate: Date
});


const investmentSchema = new mongoose.Schema({
    investmentType: String,
    amount: Number,
    date: Date,
    riskLevel: String,
    returns: Number
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
    isDeleted: { type: Boolean, default: false }
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

    transactions: [{ 
        amount: Number, 
        date: Date,
        type: { type: String, enum: ["income", "expense"] } 
    }],

    expenses: [expenseSchema],  
    debts: [debtsSchema],       
    investments: [investmentSchema], 
    reminders: [reminderSchema], 

    totals: { 
        totalExpenses: { type: Number, default: 0 },
        totalLoans: { type: Number, default: 0 },
        totalSavings: { type: Number, default: 0 },
        totalIncome: { type: Number, default: 0 }
    },

    createdAt: { type: Date, default: Date.now }
});


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
    await this.save();
    return this;
};


const User = mongoose.model('Users', userSchema);
module.exports = User;
