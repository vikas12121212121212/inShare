const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const { v4: uuidv4 } = require('uuid');
const sendMail = require('../services/emailService'); // Import the sendMail function from your email service

let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

let upload = multer({
    storage,
    limits: { fileSize: 1000000 * 100 },
}).single('myfile');

router.post('/', (req, res) => {
    upload(req, res, async (err) => {
        // Handle upload error
        if (err) {
            return res.status(500).send({ error: err.message });
        }

        // Validate request
        if (!req.file) {
            return res.json({ error: 'All fields are required.' });
        }

        // Store to Database
        const file = new File({
            filename: req.file.filename,
            uuid: uuidv4(),
            path: req.file.path,
            size: req.file.size
        });

        try {
            const response = await file.save();
            return res.json({ file: `${process.env.APP_BASE_URL.replace(/\/+$/, '')}files/${response.uuid}` });

        } catch (error) {
            return res.status(500).send({ error: error.message });
        }
    });
});

router.post('/send', async (req, res) => {
    

    // Validate req
    const { uuid, emailTo, emailFrom } = req.body;

    if (!uuid || !emailTo || !emailFrom) {
        return res.status(422).send({ error: 'All fields are required.' });
    }

    // Get data from database
    const file = await File.findOne({ uuid: uuid });
    if (file.sender) {
        return res.status(422).send({ error: 'Email already send.' });
    }
    file.sender = emailFrom;
    file.receiver = emailTo; // Corrected assignment
    const response = await file.save();

    // Send Email
    try {
        await sendMail({
            from: emailFrom,
            to: emailTo,
            subject: 'inShare file sharing',
            text: `${emailFrom} shared a file with you.`,
            html: require('../services/emailTemplate')({
                emailFrom: emailFrom,
                downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
                size: parseInt(file.size / 1000) + ' KB',
                expires: '24 hours'
            })
        });
        return res.send({ success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Failed to send email.' });
    }
});

module.exports = router;
