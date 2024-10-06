const User = require("../models/user");
const {
  okCode,
  createdCode,
  // noContentCode,
  badRequestCode,
  notFoundCode,
  internalServerError,
} = require("../utils/errors");

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(okCode).send(users))
    .catch((err) => {
      console.error(err);
      return res.status(internalServerError).send({ message: err.message });
    });
};

const createUser = (req, res) => {
  const { name, avatar } = req.body;
  User.create({ name, avatar })
    .then((user) => res.status(createdCode).send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(badRequestCode).send({ message: err.message });
      }
      return res.status(internalServerError).send({ message: err.message });
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
        return res.status(badRequestCode).send({ message: err.message });
      }
      return res.status(internalServerError).send({ message: err.message });
    });
};

module.exports = { getUsers, createUser, getUser };
