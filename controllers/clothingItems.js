const mongoose = require("mongoose");
const ClothingItem = require("../models/clothingItem");
const {
  okCode,
  // badRequestCode,
  // notFoundCode,
  // internalServerError,
  // forbidden,
} = require("../utils/errors");

const NotFoundError = require("../errors/not-found-err");
// const ConflictError = require("../errors/conflict-err");
const BadRequestError = require("../errors/bad-request-err");
const ForbiddenError = require("../errors/forbidden-err");
// const UnauthorizedError = require("../errors/unauthorized-err");

// GET /items
const getItems = (req, res, next) => {
  ClothingItem.find({})
    .then((items) => res.status(okCode).send(items))
    .catch((err) => {
      console.log(err.name);
      next(err);
      // return res
      //   .status(internalServerError)
      //   .send({ message: "An error has occurred on the server" });
    });
};

// POST /items
const createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => {
      console.log(item);
      res.send({ data: item });
    })
    .catch((err) => {
      console.log(err.name);
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

// DELETE /items/:itemId
const deleteItem = (req, res, next) => {
  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return next(new BadRequestError("Invalid data"));
    // return res.status(badRequestCode).send({ message: "Invalid data" });
  }

  console.log(itemId);
  return ClothingItem.findById(itemId)
    .orFail()
    .then((item) => {
      if (!item.owner.equals(req.user._id)) {
        return next(
          new ForbiddenError("You are not authorized to delete this item")
        );
        // return res
        //   .status(forbidden)
        //   .send({ message: "You are not authorized to delete this item" });
      }
      return item
        .deleteOne()
        .then(() => res.send({ message: "Item successfully deleted" }));
    })
    .catch((err) => {
      console.log(err.name);
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("Item not found"));
        // return res.status(notFoundCode).send({ message: err.message });
      }
      next(err);
      // return res
      //   .status(internalServerError)
      //   .send({ message: "An error has occurred on the server" });
    });
};

// LIKES
const likeItem = (req, res, next) => {
  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    next(new BadRequestError("Invalid data"));
    // return res.status(badRequestCode).send({ message: "Invalid data" });
  }
  return ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((likes) => res.status(okCode).send(likes))
    .catch((err) => {
      console.log(err.name);
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("Item not found"));
        // return res.status(notFoundCode).send({ message: err.message });
      }
      next(err);
      // return res
      //   .status(internalServerError)
      //   .send({ message: "An error has occurred on the server" });
    });
};

// DISLIKES
const dislikeItem = (req, res, next) => {
  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    next(new BadRequestError("Invalid data"));
    // return res.status(badRequestCode).send({ message: "Invalid data" });
  }
  return ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((likes) => res.status(okCode).send(likes))
    .catch((err) => {
      console.log(err.name);
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("Item not found"));
        // return res.status(notFoundCode).send({ message: err.message });
      }
      next(err);
      // return res
      //   .status(internalServerError)
      //   .send({ message: "An error has occurred on the server" });
    });
};

module.exports = {
  getItems,
  createItem,
  deleteItem,
  likeItem,
  dislikeItem,
};
