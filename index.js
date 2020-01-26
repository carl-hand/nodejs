const morgan = require("morgan");
const helmet = require("helmet");
const Joi = require("@hapi/joi");
const logger = require("./logger");
const authenticator = require("./authenticator");
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

if (env === "development") {
  // HTTP request logger middleware. Probably not a good idea to turn this on in PROD
  // as it will log every request and make things slower!
  app.use(morgan("tiny"));
  console.log('morgan enabled');
}

let courses = [
  {
    id: 1,
    name: "course1"
  },
  {
    id: 2,
    name: "course2"
  },
  {
    id: 3,
    name: "course3"
  }
];

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/courses", (req, res) => {
  res.send(courses);
});

app.get("/api/courses/:id", (req, res) => {
  const idString = req.params.id;
  const id = parseInt(idString);
  const hasId = courses.find(course => {
    return course.id === id;
  });

  if (!hasId) {
    res.status(404).send({ msg: "id not found" });
  } else {
    const course = courses.filter(course => {
      return course.id === id;
    });
    res.send(course);
  }
});

app.get("/api/posts/:year/:month", (req, res) => {
  // get request params year and month
  // res.send(req.params);

  // to get query params
  res.send(req.query);
});

app.post("/api/courses", (req, res) => {
  const { error } = validateCourse(req.body);
  if (error) {
    // 400 bad request
    return res.status(400).send(error.details[0].message);
  }

  const name = req.body.name;
  const newCourse = {
    id: courses.length + 1,
    name
  };
  courses.push(newCourse);

  // convention when creating a new item is for the server to send back that new course in the body of the response to the client
  // the reason for this is because most liklely the client needs this id that was created by the database
  res.send(newCourse);
});

app.put("/api/courses/:id", (req, res) => {
  // Step 1: check if course id exists
  const { id: idString } = req.params;
  const id = parseInt(idString);
  const { name } = req.body;
  const courseToUpdate = courses.find(course => {
    return id === course.id;
  });

  if (!courseToUpdate) {
    // course not found
    return res.status(404).send("No course found");
  }

  // Step 2: check if info is valid
  const { error } = validateCourse(req.body);
  if (error) {
    // 400 bad request
    return res.status(400).send(error.details[0].message);
  }

  // Step 3: update value
  courseToUpdate.name = name;
  res.send(courseToUpdate);
});

app.delete("/api/courses/:id", (req, res) => {
  const idString = req.params.id;
  const id = parseInt(idString);
  const course = courses.find(course => {
    return id === course.id;
  });

  if (!course) {
    return res.status(404).send("No course found");
  }

  const updatedCourses = courses.filter(course => {
    return id !== course.id;
  });

  courses = updatedCourses;

  res.send(course);
});

function validateCourse(course) {
  const schema = Joi.object({
    name: Joi.string()
      .min(3)
      .required()
  });

  return schema.validate(course);
}

const PORT = process.env.PORT_NODE_COURSE || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
