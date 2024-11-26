const nodemailer = require('nodemailer');
require("dotenv").config()

module.exports.sendMail = (email, subject, html) => {
    console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS)
    console.log(email)


    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: '1st Store <khanhhs11vtt@gmail.com>',
        to: email,
        subject: subject,
        html: html
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("*")
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            // do something useful
        }
    });
};