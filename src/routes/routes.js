const express = require('express');
const paymentMethod = require('../controllers/paymentMethod');


const router = express.Router();

router.post('/webhook', paymentMethod.paymentMethodHandler);

router.get('/getAllUserData', paymentMethod.getUserData);

module.exports = router;
