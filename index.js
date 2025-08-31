const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
const env = require('dotenv');
env.config({ path: `./env/.env.${process.env.NODE_ENV || 'local'}` });
const errorHandler = require("./middleware/errorHandler");
const router = require('./routes');
const app = express();

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/v1', router);


app.use(errorHandler);


app.listen( process.env.PORT  , () => {
  console.log(`Server is running on port ${process.env.PORT }`); 
});
