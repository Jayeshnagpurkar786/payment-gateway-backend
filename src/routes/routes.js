const express = require('express');
const paymentMethod = require('../controllers/paymentMethod');

const router = express.Router();

router.post('/webhook', paymentMethod.paymentMethodHandler);

module.exports = router;