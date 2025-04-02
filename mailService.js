// mailService.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, 
    auth: {
        user: 'rupeeinsight@gmail.com',
        pass: 'pwzr ddeq hmht noqz',
    },
});

const sendMail = async (payload) => {
    try {
        const { to, subject, text } = payload;
        console.log(`${to} ${subject} ${text}`);
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
        });
        console.log("Email sent: ", info.messageId);
        return { success: true, messageId: info.messageId, message:"OTP Sent Successfully", status:200 };
    } catch (error) {
        console.error("Error sending email: ", error);
        return { success: false, error: error.message };
    }
};

module.exports = sendMail;


