const nodemailer = require('nodemailer');
async function sendMail({ from, to, subject, text, html }) {
    // Ensure downloadLink is defined
    if (!download) {
        console.error('Error: downloadLink is not defined');
        throw new Error('downloadLink is not defined');
    }

    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    try {
        let info = await transporter.sendMail({
            from: `inShare <${from}>`,
            to,
            subject,
            text,
            html
        });
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

// Example call
sendMail({
    from: 'example@example.com',
    to: 'recipient@example.com',
    subject: 'Your file is ready',
    text: 'Please download your file from the link below.',
    html: `<p>Please download your file from <a href="${download}">this link</a>.</p>`
});


module.exports = sendMail;