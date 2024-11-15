const router = require("express").Router();
const userRouter = require("./users");
const itemRouter = require("./clothingItems");
const { login, createUser } = require("../controllers/users");
const { validateUserBody, validateAuth } = require("../middlewares/validation");
const NotFoundError = require("../errors/not-found-err");

router.use("/users", userRouter);
router.use("/items", itemRouter);
router.post("/signin", validateAuth, login);
router.post("/signup", validateUserBody, createUser);

router.use((req, res, next) => {
  next(new NotFoundError("Resource not found"));
});

module.exports = router;
