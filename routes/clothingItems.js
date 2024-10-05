const router = require("express").Router();
const {
  getItems,
  createItem,
  deleteItem,
  updateItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");

router.get("/", getItems);
router.post("/", createItem);
router.delete("/:itemId", deleteItem);
router.put("/:itemId", updateItem);
router.put("/:itemId/likes", likeItem);
router.put("/:itemId/likes", dislikeItem);

module.exports = router;
