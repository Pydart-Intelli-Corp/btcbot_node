const express = require('express');
const router = express.Router();

// Portfolio routes will be implemented here
router.get('/', (req, res) => {
  res.json({ message: 'Portfolio routes - coming soon' });
});

module.exports = router;