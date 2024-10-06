const router = require("express").Router();
const userRouter = require("./users");
const itemRouter = require("./clothingItems");
const { notFoundCode } = require("../utils/errors");

router.use("/users", userRouter);
router.use("/items", itemRouter);
router.use((req, res) => {
  res.status(notFoundCode).send({ message: "Not Found" });
});

module.exports = router;
