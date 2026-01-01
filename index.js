const express = require('express');
const bodyParser = require('body-parser');
const env = require('dotenv');
const path = require('path');
const config = require('./config/app-config');
const routes = require('./routes');
const errorHandler = require("./middleware/errorHandler");
const cors = require("cors");
const app = express();

env.config();

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PATCH', 'DELETE','OPTIONS'],
    allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  maxAge: 86400 // 24 hours
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/v1', routes);

app.get("/docs", function (req, res) {
  res.sendFile(path.join(__dirname, "doc", "index.html"));
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Loading env from: env/.env.${process.env.NODE_ENV}`);
});
