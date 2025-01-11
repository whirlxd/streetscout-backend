const express = require('express');
const multer = require('multer');
const { verifyImage } = require('../services/imageVerification');
const Report = require('../models/report');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, latitude, longitude, severity } = req.body;
    const imageBuffer = req.file ? await fs.promises.readFile(req.file.path) : null;

    let aiConfidence = 0;
    if (imageBuffer) {
      aiConfidence = await verifyImage(imageBuffer, description);
    }

    const report = new Report({
      title,
      description,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      severity,
      status: 'pending',
      imageUrl: req.file ? req.file.path : null,
      aiConfidence,
      userId: req.user._id // Assuming user authentication middleware
    });

    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


