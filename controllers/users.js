const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const {
  okCode,
  createdCode,
  badRequestCode,
  invalidCredentialsCode,
  notFoundCode,
  internalServerError,
} = require("../utils/errors");
const { JWT_SECRET } = require("../utils/config");
const validator = require("validator");

// const getUsers = (req, res) => {
//   User.find({})
//     .then((users) => res.status(okCode).send(users))
//     .catch((err) => {
//       console.error(err);
//       return res
//         .status(internalServerError)
//         .send({ message: "An error has occurred on the server" });
//     });
// };

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

// const getUser = (req, res) => {
//   const { userId } = req.params;
//   User.findById(userId)
//     .orFail()
//     .then((user) => res.status(okCode).send(user))
//     .catch((err) => {
//       console.error(err);
//       if (err.name === "DocumentNotFoundError") {
//         return res.status(notFoundCode).send({ message: err.message });
//       }
//       if (err.name === "CastError") {
//         return res.status(badRequestCode).send({ message: "Invalid data" });
//       }
//       return res
//         .status(internalServerError)
//         .send({ message: "An error has occurred on the server" });
//     });
// };

const login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch((err) => {
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
      res.status(okCode).send(user);
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
