const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    loanAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    tenure: { type: Number, required: true }, // In months or years
    borrowerName: { type: String, required: true },
    remainingBalance: { type: Number, required: true }, // Remaining loan amount
    startDate: { type: String, required: true }, // "YYYY-MM-DD"
    isPaidOff: { type: Boolean, default: false } // Whether the loan is fully repaid
});

const Loan = mongoose.model('Loan', loanSchema);
module.exports = Loan;
