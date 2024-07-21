const router = require('express').Router();
const File = require('../models/file');
const path = require('path');

router.get('/:uuid', async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });
        if (!file) {
            return res.render('download.ejs', { error: 'Link has expired.' });
        }

        const filePath = path.resolve(file.path); // Make sure this resolves to the correct file location
        console.log(`File path: ${filePath}`); // Debugging line

        return res.render('download.ejs', {
            fileName: file.filename,
            fileSize: file.size,
            download: `${process.env.APP_BASE_URL}/files/${file.uuid}`
        });
    } catch (err) {
        console.error(err);
        return res.render('download.ejs', { error: 'Something went wrong.' });
    }
});

module.exports = router;
