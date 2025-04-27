const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    loanAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    tenure: { type: Number, required: true },
    borrowerName: { type: String, required: true },
    remainingBalance: { type: Number, required: true },
    startDate: { type: String, required: true },
    isPaidOff: { type: Boolean, default: false }
});

const Loan = mongoose.model('Loan', loanSchema);
module.exports = Loan;
