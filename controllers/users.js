const bcrypt = require("bcryptjs");
const User = require("../models/user");
const {
  okCode,
  createdCode,
  badRequestCode,
  invalidCredentialsCode,
  notFoundCode,
  internalServerError,
} = require("../utils/errors");

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(okCode).send(users))
    .catch((err) => {
      console.error(err);
      return res
        .status(internalServerError)
        .send({ message: "An error has occurred on the server" });
    });
};

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => User.create({ name, avatar, email, password }))
    .then((user) => res.status(createdCode).send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(badRequestCode).send({ message: "Invalid data" });
      }
      return res
        .status(internalServerError)
        .send({ message: "An error has occurred on the server" });
    });
};

const getUser = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail()
    .then((user) => res.status(okCode).send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res.status(notFoundCode).send({ message: err.message });
      }
      if (err.name === "CastError") {
        return res.status(badRequestCode).send({ message: "Invalid data" });
      }
      return res
        .status(internalServerError)
        .send({ message: "An error has occurred on the server" });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      // authentication successful! user is in the user variable
    })
    .catch((err) => {
      // authentication error
      res
        .status(invalidCredentialsCode)
        .send({ message: "Invalid credentials" });
    });
};

module.exports = { getUsers, createUser, getUser };
