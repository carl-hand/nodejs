
const Joi = require("@hapi/joi");
const express = require("express");

const router = express.Router();

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

router.get("/", (req, res) => {
  res.send(courses);
});

router.get("/:id", (req, res) => {
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

// router.get("/api/posts/:year/:month", (req, res) => {
//   // get request params year and month
//   // res.send(req.params);

//   // to get query params
//   res.send(req.query);
// });

router.post("/", (req, res) => {
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

router.put("/:id", (req, res) => {
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

router.delete("/:id", (req, res) => {
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

module.exports = router;
