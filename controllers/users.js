const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const {
  okCode,
  createdCode,
  // badRequestCode,
  // invalidCredentialsCode,
  // notFoundCode,
  // conflictCode,
  // internalServerError,
} = require("../utils/errors");
const { JWT_SECRET } = require("../utils/config");

const NotFoundError = require("../errors/not-found-err");
const ConflictError = require("../errors/conflict-err");
const BadRequestError = require("../errors/bad-request-err");
// const ForbiddenError = require("../errors/forbidden-err");
const UnauthorizedError = require("../errors/unauthorized-err");

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  if (!email || !password) {
    next(new BadRequestError("Both email and password fields are rquired"));
    // return res
    //   .status(badRequestCode)
    //   .send({ message: "Both email and password fields are required" });
  }

  return User.findOne({ email })
    .then((user) => {
      if (user) {
        next(new ConflictError("This user already exists"));
        // return res
        //   .status(conflictCode)
        //   .send({ message: "This user already exists" });
      }

      return bcrypt
        .hash(password, 10)
        .then((hash) => User.create({ name, avatar, email, password: hash }))
        .then((newUser) => {
          res.status(createdCode).send({
            name: newUser.name,
            avatar: newUser.avatar,
            email: newUser.email,
          });
        });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        next(new BadRequestError("Invalid data"));
        // return res.status(badRequestCode).send({ message: "Invalid data" });
      }
      next(err);

      // return res
      //   .status(internalServerError)
      //   .send({ message: "An error has occurred on the server" });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  if (!email || !password) {
    next(new BadRequestError("Both email and password fields are required"));
    // return res
    //   .status(badRequestCode)
    //   .send({ message: "Both email and password fields are required" });
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch((err) => {
      console.log(err);
      if (err.message === "Incorrect email or password") {
        next(new UnauthorizedError("Invalid credentials"));
        // return res
        //   .status(invalidCredentialsCode)
        //   .send({ message: "Invalid credentials" });
      }
      next(err);

      // return res
      //   .status(internalServerError)
      //   .send({ message: "An error has occurred on the server" });
    });
};

const getCurrentUser = (req, res) => {
  const id = req.user._id;
  User.findById(id)
    .orFail()
    .then((user) => {
      const { _id, email, avatar, name } = user;
      res.status(okCode).send({ _id, email, avatar, name });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("User not found"));
        // return res.status(notFoundCode).send({ message: "User not found" });
      }
      if (err.name === "CastError") {
        next(new BadRequestError("Invalid data"));
        // return res.status(badRequestCode).send({ message: "Invalid data" });
      }
      next(err);
      // return res
      //   .status(internalServerError)
      //   .send({ message: "An error has occurred on the server" });
    });
};

const updateProfile = (req, res) => {
  const { name, avatar } = req.body;
  return User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .orFail()
    .then((user) => res.send({ name: user.name, avatar: user.avatar }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new BadRequestError("Invalid user"));
        // return res.status(badRequestCode).send({ message: "Invalid user" });
      }
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("User not found"));
        // return res.status(notFoundCode).send({ message: "User not found" });
      }
      next(err);
      // return res
      //   .status(internalServerError)
      //   .send({ message: "An error has occurred on the server" });
    });
};

module.exports = {
  createUser,
  login,
  getCurrentUser,
  updateProfile,
};
