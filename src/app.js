const express = require('express');
const Razorpay = require('razorpay');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const routes = require('./routes/routes');
const dotenv = require('dotenv');
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Set headers to allow CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// Razorpay Integration Example Route
app.post('/create-order', async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.rzp_test_7ttu8dTD0Es0yJ,
      key_secret: process.env.baqn54chqOz7hqwMAzE4n8XS,
    });

    const options = {
      amount: req.body.amount, // amount in smallest currency unit (e.g., paise for INR)
      currency: req.body.currency,
      receipt: req.body.receipt,
      notes: req.body.notes,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
});

// Route to handle order creation
app.post('/create-order', async (req, res) => {
  try {
    const { amount, currency, receipt, notes } = req.body;
    const options = {
      amount: amount * 100, // Convert amount to paise
      currency,
      receipt,
      notes,
    };

    const order = await razorpay.orders.create(options);

    // Read current orders, add new order, and write back to the file
    const orders = readData();
    orders.push({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: 'created',
    });
    writeData(orders);

    res.json(order); // Send order details to frontend, including order ID
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating order');
  }
});

// Route to serve the success page
app.get('/payment-success', (req, res) => {
  res.sendFile(path.join(__dirname, 'success.html'));
});

// Route to handle payment verification
app.post('/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  const body = razorpay_order_id + '|' + razorpay_payment_id;

  try {
    const isValidSignature = validateWebhookSignature(body, razorpay_signature, secret);

    if (isValidSignature) {
      // Update the order with payment details
      const orders = readData();
      const order = orders.find(o => o.order_id === razorpay_order_id);
      if (order) {
        order.status = 'paid';
        order.payment_id = razorpay_payment_id;
        writeData(orders);
      }

      res.status(200).json({ status: 'ok' });
      console.log("Payment verification successful");
    } else {
      res.status(400).json({ status: 'verification_failed' });
      console.log("Payment verification failed");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Error verifying payment' });
  }
});

// Simple test route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'Ok' });
});

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
};

app.use(errorHandler);

// Use custom routes
app.use('/v1', routes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Functions to read and write data (you should implement these as needed)
function readData() {
  // Example implementation to read JSON data from a file
  const data = fs.readFileSync('orders.json', 'utf-8');
  return JSON.parse(data);
}

function writeData(orders) {
  // Example implementation to write JSON data to a file
  fs.writeFileSync('orders.json', JSON.stringify(orders, null, 2));
}
