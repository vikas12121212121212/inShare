const router = require('express').Router();
const File = require('../models/file');
const path = require('path'); // Import path module for resolving file paths

router.get('/:uuid', async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });
        if (!file) {
            console.log(`File with UUID ${req.params.uuid} not found.`);
            return res.render('download.ejs', { error: 'Link has expired.' });
        }

        const filePath = path.resolve(file.path); // Resolve file path
        console.log(`Resolved file path: ${filePath}`);

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


