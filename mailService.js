const nodemailer = require("nodemailer");
require("dotenv").config();


const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === "true", 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendMail = async ({ to, subject, text }) => {
    try {
        if (!to || !subject || !text) {
            throw new Error("Missing required email parameters: 'to', 'subject', or 'text'");
        }

        console.log(`Sending email to: ${to}\nSubject: ${subject}\nText: ${text}`);

        const info = await transporter.sendMail({
            from: `"No Reply" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
        });

        console.log("Email sent successfully: ", info.messageId);
        return { success: true, messageId: info.messageId, message: "OTP Sent Successfully", status: 200 };
    } catch (error) {
        console.error("Error sending email: ", error);
        return { success: false, error: error.message, status: 500 };
    }
};

module.exports = sendMail;
