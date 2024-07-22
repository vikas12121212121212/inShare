const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const { v4: uuidv4 } = require('uuid');
const sendMail = require('../services/emailService'); // Import the sendMail function from your email service

// Multer storage configuration
let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

// Multer setup for file uploads
let upload = multer({
    storage,
    limits: { fileSize: 1000000 * 100 }, // Limit set to 100 MB
}).single('myfile');

// Route for uploading files
router.post('/', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).send({ error: 'No file uploaded.' });
        }

        const file = new File({
            filename: req.file.filename,
            uuid: uuidv4(),
            path: req.file.path,
            size: req.file.size
        });

        try {
            const response = await file.save();
            return res.json({ file: `${process.env.APP_BASE_URL.replace(/\/+$/, '')}/files/${response.uuid}` });
        } catch (error) {
            return res.status(500).send({ error: error.message });
        }
    });
});

// Route for sending email with file link
router.post('/send', async (req, res) => {
    const { uuid, emailTo, emailFrom } = req.body;

    if (!uuid || !emailTo || !emailFrom) {
        return res.status(422).send({ error: 'All fields are required.' });
    }

    try {
        const file = await File.findOne({ uuid });
        if (!file) {
            return res.status(404).send({ error: 'File not found.' });
        }
        if (file.sender) {
            return res.status(422).send({ error: 'Email already sent.' });
        }

        file.sender = emailFrom;
        file.receiver = emailTo; // Correct assignment
        await file.save();

        const downloadUrl = `${process.env.APP_BASE_URL.replace(/\/+$/, '')}/files/download/${file.uuid}`;
        
        console.log(`Sending email to ${emailTo} from ${emailFrom}`);
        console.log(`Download URL: ${downloadUrl}`);

        await sendMail({
            from: emailFrom,
            to: emailTo,
            subject: 'inShare file sharing',
            text: `${emailFrom} shared a file with you.`,
            html: require('../services/emailTemplate')({
                emailFrom,
                download: downloadUrl,
                size: `${parseInt(file.size / 1000)} KB`,
                expires: '24 hours'
            })
        });

        return res.send({ success: true });
    } catch (error) {
        console.error('Error sending email:', error.message);
        return res.status(500).send({ error: 'Failed to send email.' });
    }
});

module.exports = router;
