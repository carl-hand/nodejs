const startupDebugger = require('debug')('app:startup');
const dbDebugger = require('debug')('app:db');
const config = require('config');
const morgan = require("morgan");
const helmet = require("helmet");
const logger = require("./middleware/logger");
const authenticator = require("./middleware/authenticator");
const courses = require('./routes/courses');
const home = require('./routes/home');
const express = require("express");

const app = express();

const env = process.env.NODE_ENV || "development";
console.log(`app: ${app.get("env")}`);
app.use(logger);
app.use(authenticator);
// this line is needed to allow us to parse the body of a post request
app.use(express.json());
// { extended: true } allows us to pass arrays and complex objects
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
// Helmet helps you secure your Express apps by setting various HTTP headers
app.use(helmet());
// routes
app.use('/', home);
app.use('/api/courses', courses);

// Configuration
console.log(`Application Name: ${config.get('name')}`);
console.log(`Mail Server Name: ${config.get('mail.host')}`);
console.log(`Mail Password: ${config.get('mail.password')}`);

if (env === "development") {
  // HTTP request logger middleware. Probably not a good idea to turn this on in PROD
  // as it will log every request and make things slower!
  app.use(morgan("tiny"));
  startupDebugger('morgan enabled');
}

// DB work...
dbDebugger('Connected to the database...');

const PORT = process.env.PORT_NODE_COURSE || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
