const express = require('express');
const cors = require('cors');
const routes = require('./routes/routes');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/', (req, res) => {
  res.status(200).json({ status: 'Ok' });
});

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
};

app.use(errorHandler);

app.use('/v1', routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

