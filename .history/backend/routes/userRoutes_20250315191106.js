const express = require('express');
const router = express.Router();

// Tạm thời để trống, sẽ implement sau
router.get('/', (req, res) => {
  res.json({ message: 'User routes' });
});

module.exports = router;