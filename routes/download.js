const router = require('express').Router();
const File = require('../models/file');
const path = require('path'); // Import path module for resolving file paths

router.get('/:uuid', async (req, res) => {
    try {
        // Find the file by UUID
        const file = await File.findOne({ uuid: req.params.uuid });

        // Check if file exists
        if (!file) {
            return res.render('download', { error: 'Link has expired.' });
        }

        // Construct the full file path
        const filePath = `${__dirname}/../${file.path}`;

        // Send file for download
        res.download(filePath, file.filename, (err) => {
            if (err) {
                console.error(`Error sending file: ${err}`);
                res.status(500).send('Internal Server Error');
            }
        });
    } catch (err) {
        console.error(`Internal server error: ${err}`);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
