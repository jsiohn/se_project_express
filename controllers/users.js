const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const {
  okCode,
  createdCode,
  badRequestCode,
  invalidCredentialsCode,
  notFoundCode,
  conflictCode,
  internalServerError,
} = require("../utils/errors");
const { JWT_SECRET } = require("../utils/config");
// const validator = require("validator");

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  if (!email || !password) {
    return res
      .status(badRequestCode)
      .send({ message: "Both email and password fields are required" });
  }

  return User.findOne({ email }).then((user) => {
    if (user) {
      res.status(conflictCode).send({ message: "This user already exists" });
    }

    return bcrypt
      .hash(password, 10)
      .then((hash) => User.create({ name, avatar, email, password: hash }))
      .then((user) => {
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;
        res.status(createdCode).send(userWithoutPassword);
      })
      .catch((err) => {
        console.error(err);
        if (err.name === "ValidationError") {
          return res.status(badRequestCode).send({ message: "Invalid data" });
        }
        return res
          .status(internalServerError)
          .send({ message: "An error has occurred on the server" });
      });
  });
};

const login = (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  if (!email || !password) {
    return res
      .status(badRequestCode)
      .send({ message: "Both email and password fields are required" });
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
      res
        .status(invalidCredentialsCode)
        .send({ message: "Invalid credentials" });
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
        return res.status(notFoundCode).send({ message: "User not found" });
      }
      if (err.name === "CastError") {
        return res.status(badRequestCode).send({ message: "Invalid data" });
      }
      return res
        .status(internalServerError)
        .send({ message: "An error has occurred on the server" });
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
        return res.status(badRequestCode).send({ message: "Invalid user" });
      }
      if (err.name === "DocumentNotFoundError") {
        return res.status(notFoundCode).send({ message: "User not found" });
      }
      return res
        .status(internalServerError)
        .send({ message: "An error has occurred on the server" });
    });
};

module.exports = {
  createUser,
  login,
  getCurrentUser,
  updateProfile,
};
