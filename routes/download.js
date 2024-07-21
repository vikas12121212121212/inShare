const router = require('express').Router();
const File = require('../models/file');
const path = require('path'); // Import path module for resolving file paths

router.get('/:uuid', async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });
        if (!file) {
            return res.render('download.ejs', { error: 'Link has expired.' });
        }

        const filePath = path.resolve(file.path); // Resolve file path
        res.download(filePath, file.filename); // Send file as attachment with original filename
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;


