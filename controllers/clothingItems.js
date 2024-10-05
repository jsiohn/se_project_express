const mongoose = require("mongoose");
const ClothingItem = require("../models/clothingItem");
const {
  okCode,
  createdCode,
  noContentCode,
  badRequestCode,
  notFoundCode,
  internalServerError,
} = require("../utils/errors");

//GET /items
const getItems = (req, res) => {
  ClothingItem.find({})
    .then((items) => res.status(okCode).send(items))
    .catch((err) => {
      console.log(err.name);
      return res.status(internalServerError).send({ message: err.message });
    });
};

//POST /items
const createItem = (req, res) => {
  // console.log(req.user._id);
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
        return res.status(badRequestCode).send({ message: err.message });
      }
      return res.status(internalServerError).send({ message: err.message });
    });
};

//DELETE /items/:itemId
const deleteItem = (req, res) => {
  const { itemId } = req.params;
  console.log(itemId);

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(notFoundCode).send({ message: "Invalid ItemId" });
  }
  return ClothingItem.findByIdAndDelete(itemId)
    .orFail()
    .then((item) => res.status(okCode).send(item))
    .catch((err) => {
      console.log(err.name);
      if (err.name === "DocumentNotFoundError") {
        return res.status(badRequestCode).send({ message: err.message });
      }
      return res.status(internalServerError).send({ message: err.message });
    });
};

//UPDATE
const updateItem = (req, res) => {
  const { itemId } = req.params;
  const { imageUrl } = req.body;

  ClothingItem.findByIdAndUpdate(itemId, { $set: { imageUrl } })
    .orFail()
    .then((item) => res.status(okCode).send({ data: item }))
    .catch((err) => {
      console.log(err.name);
      return res.status(internalServerError).send({ message: err.message });
    });
};

//LIKES-DISLIKES
const likeItem = (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(notFoundCode).send({ message: "Invalid ItemId" });
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
        return res.status(notFoundCode).send({ message: err.message });
      } else if (err.name === "CastError") {
        return res.status(badRequestCode).send({ message: err.message });
      }
      return res.status(internalServerError).send({ message: err.message });
    });
};

const dislikeItem = (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(notFoundCode).send({ message: "Invalid ItemId" });
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
        return res.status(notFoundCode).send({ message: err.message });
      } else if (err.name === "CastError") {
        return res.status(badRequestCode).send({ message: err.message });
      }
      return res.status(internalServerError).send({ message: err.message });
    });
};

module.exports = {
  getItems,
  createItem,
  deleteItem,
  updateItem,
  likeItem,
  dislikeItem,
};
