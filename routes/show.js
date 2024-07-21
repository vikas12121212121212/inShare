const express = require('express');
const router = express.Router();
const File = require('../models/file'); // Adjust the path as needed

router.get('/:uuid', async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });
        if (!file) {
            return res.render('download', { error: 'Link has been expired.' });
        }

        return res.render('download', {
            fileName: file.filename,
            fileSize: file.size,
            download: `${process.env.APP_BASE_URL}/files/${file.uuid}`
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('download', { error: 'Something went wrong.' });
    }
});

module.exports = router;

