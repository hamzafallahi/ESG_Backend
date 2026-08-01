const express = require('express');
const bodyParser = require('body-parser');
const env = require('dotenv');
const path = require('path');
const config = require('./config/app-config');
const routes = require('./routes');
const errorHandler = require("./middleware/errorHandler");
const cors = require("cors");
const app = express();
const setupSwagger = require("./config/swagger");

env.config();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], 
  methods: ['GET', 'POST', 'PATCH', 'DELETE','OPTIONS','PUT'],
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

if (process.env.NODE_ENV !== "production") {
  setupSwagger(app);
}


app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server is running on ${config.port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Loading env from: env/.env.${process.env.NODE_ENV}`);
});
